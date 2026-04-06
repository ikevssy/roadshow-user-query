import { useCallback } from 'react';
import { useAppStore } from '../store';
import type { UserInteraction, Manifest, Company, IndustryData } from '../types';

/**
 * 数据加载Hook
 */
export function useDataLoader() {
  const {
    setCompanies,
    setManifest,
    setAllUsers,
    setIndustryData,
    setLoading,
    selectedCompanyOids,
    queryMode,
  } = useAppStore();
  
  /**
   * 加载公司列表
   */
  const loadCompanies = useCallback(async () => {
    try {
      const response = await fetch('/data/companies.json');
      const data: Company[] = await response.json();
      setCompanies(data);
      return data;
    } catch (error) {
      console.error('加载公司列表失败:', error);
      return [];
    }
  }, [setCompanies]);
  
  /**
   * 加载行业数据
   */
  const loadIndustryData = useCallback(async () => {
    try {
      const response = await fetch('/data/industries.json');
      const data: IndustryData = await response.json();
      setIndustryData(data);
      return data;
    } catch (error) {
      console.error('加载行业数据失败:', error);
      return null;
    }
  }, [setIndustryData]);
  
  /**
   * 加载数据清单
   */
  const loadManifest = useCallback(async () => {
    try {
      const response = await fetch('/data/manifest.json');
      const data: Manifest = await response.json();
      setManifest(data);
      return data;
    } catch (error) {
      console.error('加载数据清单失败:', error);
      return null;
    }
  }, [setManifest]);
  
  /**
   * 加载指定公司的用户数据
   */
  const loadCompanyUsers = useCallback(async (oid: number): Promise<UserInteraction[]> => {
    try {
      const response = await fetch(`/data/oid_${oid}.json`);
      if (!response.ok) return [];
      const data: UserInteraction[] = await response.json();
      return data;
    } catch (error) {
      console.error(`加载公司 ${oid} 数据失败:`, error);
      return [];
    }
  }, []);
  
  /**
   * 根据 manifest 中的 release_batch 字段构造文件 URL
   * 优先从 GitHub Releases 加载，fallback 到本地 /data/
   */
  const getFileUrl = useCallback((manifest: Manifest, filename: string, releaseBatch?: number): string => {
    if (manifest.github_base_url && manifest.release_tags && releaseBatch) {
      const tag = manifest.release_tags[releaseBatch - 1];
      if (tag) {
        return `${manifest.github_base_url}/${tag}/${filename}`;
      }
    }
    // fallback: 本地静态文件
    return `/data/${filename}`;
  }, []);

  /**
   * 加载所有公司的用户数据（不限模式）
   */
  const loadAllCompanyUsers = useCallback(async (manifest: Manifest): Promise<UserInteraction[]> => {
    const userMap = new Map<string, UserInteraction>();
    const batchSize = 20; // GitHub Releases 并发不宜过高

    const allFileEntries = manifest.files ?? [];
    if (allFileEntries.length === 0) return [];

    for (let i = 0; i < allFileEntries.length; i += batchSize) {
      const batch = allFileEntries.slice(i, i + batchSize);
      const promises = batch.map(async (entry: any) => {
        const url = getFileUrl(manifest, entry.filename, entry.release_batch);
        try {
          const response = await fetch(url);
          if (!response.ok) return [];
          return await response.json() as UserInteraction[];
        } catch {
          return [];
        }
      });

      const results = await Promise.all(promises);

      for (const users of results) {
        for (const user of users) {
          const existing = userMap.get(user.uid);
          if (!existing) {
            userMap.set(user.uid, user);
          } else {
            existing.apply_count += user.apply_count;
            existing.attend_count += user.attend_count;
            existing.apply_records = [...existing.apply_records, ...user.apply_records]
              .sort((a, b) => b.time.localeCompare(a.time));
            existing.attend_records = [...existing.attend_records, ...user.attend_records]
              .sort((a, b) => b.time.localeCompare(a.time));
            if (user.last_interaction_time > existing.last_interaction_time) {
              existing.last_interaction_time = user.last_interaction_time;
              existing.last_interaction_behavior = user.last_interaction_behavior;
              existing.interaction_company = user.interaction_company;
            }
          }
        }
      }
    }

    return Array.from(userMap.values()).sort(
      (a, b) => b.last_interaction_time.localeCompare(a.last_interaction_time)
    );
  }, [getFileUrl]);
  
  /**
   * 加载用户数据（根据查询模式）
   */
  const loadUsers = useCallback(async () => {
    setLoading(true);
    
    try {
      const manifest = await loadManifest();
      if (!manifest) {
        setAllUsers([]);
        return;
      }
      
      let allUsers: UserInteraction[] = [];
      
      if (queryMode === 'unlimited') {
        // 不限模式：加载所有公司数据（从 GitHub Releases）
        allUsers = await loadAllCompanyUsers(manifest);
      } else {
        // 选择公司模式：只加载选中公司的数据
        if (selectedCompanyOids.length === 0) {
          setAllUsers([]);
          return;
        }

        // 从 manifest 找到对应文件的 release_batch
        const fileMap = new Map<number, { filename: string; release_batch?: number }>();
        for (const entry of (manifest.files ?? [])) {
          fileMap.set(entry.oid, { filename: entry.filename, release_batch: entry.release_batch });
        }

        const promises = selectedCompanyOids.map((oid) => {
          const entry = fileMap.get(oid);
          if (entry) {
            const url = getFileUrl(manifest, entry.filename, entry.release_batch);
            return fetch(url).then(r => r.ok ? r.json() as Promise<UserInteraction[]> : []).catch(() => []);
          }
          return loadCompanyUsers(oid);
        });
        const results = await Promise.all(promises);
        
        const userMap = new Map<string, UserInteraction>();
        for (const users of results) {
          for (const user of users) {
            const existing = userMap.get(user.uid);
            if (!existing) {
              userMap.set(user.uid, user);
            } else {
              existing.apply_count += user.apply_count;
              existing.attend_count += user.attend_count;
              existing.apply_records = [...existing.apply_records, ...user.apply_records]
                .sort((a, b) => b.time.localeCompare(a.time));
              existing.attend_records = [...existing.attend_records, ...user.attend_records]
                .sort((a, b) => b.time.localeCompare(a.time));
              
              if (user.last_interaction_time > existing.last_interaction_time) {
                existing.last_interaction_time = user.last_interaction_time;
                existing.last_interaction_behavior = user.last_interaction_behavior;
                existing.interaction_company = user.interaction_company;
              }
            }
          }
        }
        
        allUsers = Array.from(userMap.values()).sort(
          (a, b) => b.last_interaction_time.localeCompare(a.last_interaction_time)
        );
      }
      
      setAllUsers(allUsers);
    } catch (error) {
      console.error('加载用户数据失败:', error);
      setAllUsers([]);
    } finally {
      setLoading(false);
    }
  }, [queryMode, selectedCompanyOids, loadCompanyUsers, loadAllCompanyUsers, getFileUrl, setAllUsers, setLoading]);
  
  return {
    loadCompanies,
    loadIndustryData,
    loadManifest,
    loadCompanyUsers,
    loadUsers,
  };
}
