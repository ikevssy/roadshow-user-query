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

export const useAppStore = create<AppState>((set) => ({
  companies: [],
  manifest: null,
  allUsers: [],
  industryData: null,
  selectedCompanyOids: [],
  selectedIndustries: [],
  dateRange: null,
  queryMode: 'select',
  filters: defaultFilters,
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
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  setQuickFilter: (filter) => set((state) => ({ quickFilter: { ...state.quickFilter, ...filter } })),
  setSearchText: (text) => set({ searchText: text }),
  setLoading: (loading) => set({ loading }),
  setFilterCollapsed: (collapsed) => set({ filterCollapsed: collapsed }),
  resetFilters: () => set({ filters: defaultFilters }),
  resetAll: () => set({
    selectedCompanyOids: [],
    selectedIndustries: [],
    dateRange: null,
    queryMode: 'select',
    filters: defaultFilters,
    quickFilter: defaultQuickFilter,
    searchText: '',
    filterCollapsed: true,
  }),
}));
