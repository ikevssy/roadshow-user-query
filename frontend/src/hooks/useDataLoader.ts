import { useCallback, useRef } from 'react';
import { useAppStore } from '../store';
import type { UserInteraction, Manifest, Company, IndustryData } from '../types';

const GITHUB_OWNER = 'ikevssy';
const GITHUB_REPO = 'roadshow-user-query';
const BATCH_SIZE = 50;

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

  const manifestRef = useRef<Manifest | null>(null);

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

  const loadManifest = useCallback(async () => {
    try {
      const response = await fetch('/data/manifest.json');
      const data: Manifest = await response.json();
      setManifest(data);
      manifestRef.current = data;
      return data;
    } catch (error) {
      console.error('加载数据清单失败:', error);
      return null;
    }
  }, [setManifest]);

  const getFileUrl = useCallback((filename: string, releaseBatch?: number): string => {
    const tags = manifestRef.current?.release_tags;
    if (tags && releaseBatch) {
      const branch = tags[releaseBatch - 1];
      if (branch) {
        return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${branch}/${filename}`;
      }
    }
    return `/data/${filename}`;
  }, []);

  const fetchFile = useCallback(async (filename: string, releaseBatch?: number): Promise<UserInteraction[]> => {
    try {
      const url = getFileUrl(filename, releaseBatch);
      const response = await fetch(url);
      if (!response.ok) return [];
      return await response.json() as UserInteraction[];
    } catch {
      return [];
    }
  }, [getFileUrl]);

  const mergeUsers = useCallback((usersList: UserInteraction[][]): UserInteraction[] => {
    const userMap = new Map<string, UserInteraction>();
    for (const users of usersList) {
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
    return Array.from(userMap.values()).sort(
      (a, b) => b.last_interaction_time.localeCompare(a.last_interaction_time)
    );
  }, []);

  const loadAllCompanyUsers = useCallback(async (
    onProgress?: (loaded: number, total: number) => void
  ): Promise<UserInteraction[]> => {
    const m = manifestRef.current;
    if (!m || !m.files?.length) return [];

    const total = m.files.length;
    const allResults: UserInteraction[][] = [];
    let loaded = 0;

    for (let i = 0; i < total; i += BATCH_SIZE) {
      const batch = m.files.slice(i, i + BATCH_SIZE);
      const promises = batch.map(entry => fetchFile(entry.filename, entry.release_batch));
      const results = await Promise.all(promises);
      allResults.push(...results);
      loaded += batch.length;
      onProgress?.(loaded, total);
    }

    return mergeUsers(allResults);
  }, [fetchFile, mergeUsers]);

  const loadUsers = useCallback(async (
    onProgress?: (loaded: number, total: number) => void
  ) => {
    setLoading(true);
    try {
      const m = manifestRef.current || await loadManifest();
      if (!m) {
        setAllUsers([]);
        return;
      }

      let allUsers: UserInteraction[] = [];

      if (queryMode === 'unlimited') {
        allUsers = await loadAllCompanyUsers(onProgress);
      } else {
        if (selectedCompanyOids.length === 0) {
          setAllUsers([]);
          return;
        }

        const fileMap = new Map<number, { filename: string; release_batch?: number }>();
        for (const entry of (m.files ?? [])) {
          fileMap.set(entry.oid, { filename: entry.filename, release_batch: entry.release_batch });
        }

        const promises = selectedCompanyOids.map(oid => {
          const entry = fileMap.get(oid);
          if (entry) return fetchFile(entry.filename, entry.release_batch);
          return Promise.resolve<UserInteraction[]>([]);
        });
        const results = await Promise.all(promises);
        allUsers = mergeUsers(results);
      }

      setAllUsers(allUsers);
    } catch (error) {
      console.error('加载用户数据失败:', error);
      setAllUsers([]);
    } finally {
      setLoading(false);
    }
  }, [queryMode, selectedCompanyOids, loadManifest, loadAllCompanyUsers, fetchFile, mergeUsers, setAllUsers, setLoading]);

  return {
    loadCompanies,
    loadIndustryData,
    loadManifest,
    loadUsers,
  };
}


export function useDataLoader() {
  const {
    setCompanies,
    setManifest,
    setAllUsers,
    setIndustryData,
    setLoading,
    selectedCompanyOids,
    queryMode,
    manifest,
  } = useAppStore();

  const manifestRef = useRef<Manifest | null>(null);

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

  const loadManifest = useCallback(async () => {
    try {
      const response = await fetch('/data/manifest.json');
      const data: Manifest = await response.json();
      setManifest(data);
      manifestRef.current = data;
      return data;
    } catch (error) {
      console.error('加载数据清单失败:', error);
      return null;
    }
  }, [setManifest]);

  const getFileUrl = useCallback((filename: string, releaseBatch?: number): string => {
    const tags = manifestRef.current?.release_tags;
    if (tags && releaseBatch) {
      const branch = tags[releaseBatch - 1];
      if (branch) {
        return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${branch}/${filename}`;
      }
    }
    return `/data/${filename}`;
  }, []);

  const fetchFile = useCallback(async (filename: string, releaseBatch?: number): Promise<UserInteraction[]> => {
    try {
      const url = getFileUrl(filename, releaseBatch);
      const response = await fetch(url);
      if (!response.ok) return [];
      return await response.json() as UserInteraction[];
    } catch {
      return [];
    }
  }, [getFileUrl]);

  const mergeUsers = useCallback((usersList: UserInteraction[][]): UserInteraction[] => {
    const userMap = new Map<string, UserInteraction>();
    for (const users of usersList) {
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
    return Array.from(userMap.values()).sort(
      (a, b) => b.last_interaction_time.localeCompare(a.last_interaction_time)
    );
  }, []);

  const loadAllCompanyUsers = useCallback(async (): Promise<UserInteraction[]> => {
    const m = manifestRef.current;
    if (!m || !m.files?.length) return [];

    const batchSize = 20;
    const allResults: UserInteraction[][] = [];

    for (let i = 0; i < m.files.length; i += batchSize) {
      const batch = m.files.slice(i, i + batchSize);
      const promises = batch.map(entry => fetchFile(entry.filename, entry.release_batch));
      const results = await Promise.all(promises);
      allResults.push(...results);
    }

    return mergeUsers(allResults);
  }, [fetchFile, mergeUsers]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const m = manifestRef.current || await loadManifest();
      if (!m) {
        setAllUsers([]);
        return;
      }

      let allUsers: UserInteraction[] = [];

      if (queryMode === 'unlimited') {
        allUsers = await loadAllCompanyUsers();
      } else {
        if (selectedCompanyOids.length === 0) {
          setAllUsers([]);
          return;
        }

        const fileMap = new Map<number, { filename: string; release_batch?: number }>();
        for (const entry of (m.files ?? [])) {
          fileMap.set(entry.oid, { filename: entry.filename, release_batch: entry.release_batch });
        }

        const promises = selectedCompanyOids.map(oid => {
          const entry = fileMap.get(oid);
          if (entry) {
            return fetchFile(entry.filename, entry.release_batch);
          }
          return Promise.resolve<UserInteraction[]>([]);
        });
        const results = await Promise.all(promises);
        allUsers = mergeUsers(results);
      }

      setAllUsers(allUsers);
    } catch (error) {
      console.error('加载用户数据失败:', error);
      setAllUsers([]);
    } finally {
      setLoading(false);
    }
  }, [queryMode, selectedCompanyOids, loadManifest, loadAllCompanyUsers, fetchFile, mergeUsers, setAllUsers, setLoading]);

  return {
    loadCompanies,
    loadIndustryData,
    loadManifest,
    loadUsers,
  };
}
