import { create } from 'zustand';
import type { Company, UserInteraction, Manifest, FilterState, QuickFilterState, IndustryData, QueryMode } from '../types';

interface AppState {
  // 数据
  companies: Company[];
  manifest: Manifest | null;
  allUsers: UserInteraction[];
  industryData: IndustryData | null;
  
  // 选择状态
  selectedCompanyOids: number[];
  selectedIndustries: string[];
  dateRange: [string, string] | null;
  
  // 查询模式
  queryMode: QueryMode;
  
  // 筛选状态
  filters: FilterState;
  quickFilter: QuickFilterState;
  
  // 搜索
  searchText: string;
  
  // 加载状态
  loading: boolean;
  
  // 筛选面板折叠状态
  filterCollapsed: boolean;
  
  // Actions
  setCompanies: (companies: Company[]) => void;
  setManifest: (manifest: Manifest) => void;
  setAllUsers: (users: UserInteraction[]) => void;
  setIndustryData: (data: IndustryData) => void;
  setSelectedCompanyOids: (oids: number[]) => void;
  setSelectedIndustries: (industries: string[]) => void;
  setDateRange: (range: [string, string] | null) => void;
  setQueryMode: (mode: QueryMode) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  setQuickFilter: (filter: Partial<QuickFilterState>) => void;
  setSearchText: (text: string) => void;
  setLoading: (loading: boolean) => void;
  setFilterCollapsed: (collapsed: boolean) => void;
  resetFilters: () => void;
  resetAll: () => void;
}

// localStorage 持久化
const FILTER_STORAGE_KEY = 'roadshow_filters';

const loadFiltersFromStorage = (): Partial<FilterState> => {
  try {
    const stored = localStorage.getItem(FILTER_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // 只加载非时间范围的筛选条件
      return {
        certTypes: parsed.certTypes || [],
        orgTypes: parsed.orgTypes || [],
        isFirstAttend: parsed.isFirstAttend ?? null,
        // 时间范围不从存储加载
        interactionDateRange: null,
        applyDateRange: null,
        attendDateRange: null,
      };
    }
  } catch (e) {
    console.warn('Failed to load filters from storage:', e);
  }
  return {};
};

const saveFiltersToStorage = (filters: FilterState) => {
  try {
    // 只保存非时间范围的筛选条件
    const toSave = {
      certTypes: filters.certTypes,
      orgTypes: filters.orgTypes,
      isFirstAttend: filters.isFirstAttend,
    };
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.warn('Failed to save filters to storage:', e);
  }
};

const defaultFilters: FilterState = {
  certTypes: [],
  orgTypes: [],
  interactionDateRange: null,
  applyDateRange: null,
  attendDateRange: null,
  isFirstAttend: null,
};

const defaultQuickFilter: QuickFilterState = {
  days: 7,
  companyOid: null,
};

// 初始化时加载保存的筛选条件
const initialFilters = { ...defaultFilters, ...loadFiltersFromStorage() };

export const useAppStore = create<AppState>((set) => ({
  companies: [],
  manifest: null,
  allUsers: [],
  industryData: null,
  selectedCompanyOids: [],
  selectedIndustries: [],
  dateRange: null,
  queryMode: 'select',
  filters: initialFilters,
  quickFilter: defaultQuickFilter,
  searchText: '',
  loading: false,
  filterCollapsed: true, // 默认折叠
  
  setCompanies: (companies) => set({ companies }),
  setManifest: (manifest) => set({ manifest }),
  setAllUsers: (users) => set({ allUsers: users }),
  setIndustryData: (data) => set({ industryData: data }),
  setSelectedCompanyOids: (oids) => set({ selectedCompanyOids: oids }),
  setSelectedIndustries: (industries) => set({ selectedIndustries: industries }),
  setDateRange: (range) => set({ dateRange: range }),
  setQueryMode: (mode) => set({ queryMode: mode }),
  setFilters: (filters) => {
    set((state) => {
      const newFilters = { ...state.filters, ...filters };
      // 保存到localStorage
      saveFiltersToStorage(newFilters);
      return { filters: newFilters };
    });
  },
  setQuickFilter: (filter) => set((state) => ({ 
    quickFilter: { ...state.quickFilter, ...filter } 
  })),
  setSearchText: (text) => set({ searchText: text }),
  setLoading: (loading) => set({ loading }),
  setFilterCollapsed: (collapsed) => set({ filterCollapsed: collapsed }),
  resetFilters: () => {
    // 重置时也清除localStorage
    localStorage.removeItem(FILTER_STORAGE_KEY);
    set({ filters: defaultFilters });
  },
  resetAll: () => {
    localStorage.removeItem(FILTER_STORAGE_KEY);
    set({
      selectedCompanyOids: [],
      selectedIndustries: [],
      dateRange: null,
      queryMode: 'select',
      filters: defaultFilters,
      quickFilter: defaultQuickFilter,
      searchText: '',
      filterCollapsed: true,
    });
  },
}));
