import { useCallback } from 'react';
import { useAppStore } from '../store';
import type { UserInteraction, Manifest, Company } from '../types';

/**
 * 数据加载Hook
 */
export function useDataLoader() {
  const {
    setCompanies,
    setManifest,
    setAllUsers,
    setLoading,
    selectedCompanyOids,
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
   * 加载选中公司的所有用户数据
   */
  const loadSelectedCompanyUsers = useCallback(async () => {
    if (selectedCompanyOids.length === 0) {
      setAllUsers([]);
      return;
    }
    
    setLoading(true);
    
    try {
      // 并行加载所有选中公司的数据
      const promises = selectedCompanyOids.map((oid) => loadCompanyUsers(oid));
      const results = await Promise.all(promises);
      
      // 合并数据，去重（同一用户可能在多个公司有互动）
      const userMap = new Map<string, UserInteraction>();
      
      for (const users of results) {
        for (const user of users) {
          const existing = userMap.get(user.uid);
          if (!existing) {
            userMap.set(user.uid, user);
          } else {
            // 合并记录
            existing.apply_count += user.apply_count;
            existing.attend_count += user.attend_count;
            existing.apply_records = [...existing.apply_records, ...user.apply_records]
              .sort((a, b) => b.time.localeCompare(a.time));
            existing.attend_records = [...existing.attend_records, ...user.attend_records]
              .sort((a, b) => b.time.localeCompare(a.time));
            
            // 更新最近互动时间
            if (user.last_interaction_time > existing.last_interaction_time) {
              existing.last_interaction_time = user.last_interaction_time;
              existing.last_interaction_behavior = user.last_interaction_behavior;
              existing.interaction_company = user.interaction_company;
            }
          }
        }
      }
      
      // 转换为数组并按最近互动时间排序
      const allUsers = Array.from(userMap.values()).sort(
        (a, b) => b.last_interaction_time.localeCompare(a.last_interaction_time)
      );
      
      setAllUsers(allUsers);
    } catch (error) {
      console.error('加载用户数据失败:', error);
      setAllUsers([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCompanyOids, loadCompanyUsers, setAllUsers, setLoading]);
  
  return {
    loadCompanies,
    loadManifest,
    loadCompanyUsers,
    loadSelectedCompanyUsers,
  };
}
