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
   * 加载所有公司的用户数据（不限模式）
   */
  const loadAllCompanyUsers = useCallback(async (): Promise<UserInteraction[]> => {
    const userMap = new Map<string, UserInteraction>();
    const batchSize = 50;
    
    // 动态扫描所有 oid_*.json 文件
    const allFiles: string[] = [];
    try {
      // 先尝试加载 manifest 获取文件列表
      const manifestResp = await fetch('/data/manifest.json');
      if (manifestResp.ok) {
        const manifest = await manifestResp.json();
        if (manifest.files && manifest.files.length > 0) {
          allFiles.push(...manifest.files.map((f: any) => f.filename));
        }
      }
    } catch {
      // 如果manifest加载失败，尝试直接扫描目录（需要后端支持）
    }
    
    // 如果manifest没有文件列表，尝试加载已知的高频公司
    if (allFiles.length === 0) {
      //  fallback: 加载前100个可能的文件
      for (let i = 0; i < 100; i++) {
        allFiles.push(`oid_${i}.json`);
      }
    }
    
    for (let i = 0; i < allFiles.length; i += batchSize) {
      const batch = allFiles.slice(i, i + batchSize);
      const promises = batch.map(async (filename) => {
        try {
          const response = await fetch(`/data/${filename}`);
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
  }, []);
  
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
        // 不限模式：加载所有公司数据
        allUsers = await loadAllCompanyUsers();
      } else {
        // 选择公司模式：只加载选中公司的数据
        if (selectedCompanyOids.length === 0) {
          setAllUsers([]);
          return;
        }
        
        const promises = selectedCompanyOids.map((oid) => loadCompanyUsers(oid));
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
  }, [queryMode, selectedCompanyOids, loadCompanyUsers, loadAllCompanyUsers, setAllUsers, setLoading]);
  
  return {
    loadCompanies,
    loadIndustryData,
    loadManifest,
    loadCompanyUsers,
    loadUsers,
  };
}
