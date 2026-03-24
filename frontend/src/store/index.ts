import { create } from 'zustand';
import type { Company, UserInteraction, Manifest, FilterState, QuickFilterState } from '../types';

interface AppState {
  // 数据
  companies: Company[];
  manifest: Manifest | null;
  allUsers: UserInteraction[];
  
  // 选择状态
  selectedCompanyOids: number[];
  dateRange: [string, string] | null;
  
  // 筛选状态
  filters: FilterState;
  quickFilter: QuickFilterState;
  
  // 搜索
  searchText: string;
  
  // 加载状态
  loading: boolean;
  
  // Actions
  setCompanies: (companies: Company[]) => void;
  setManifest: (manifest: Manifest) => void;
  setAllUsers: (users: UserInteraction[]) => void;
  setSelectedCompanyOids: (oids: number[]) => void;
  setDateRange: (range: [string, string] | null) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  setQuickFilter: (filter: Partial<QuickFilterState>) => void;
  setSearchText: (text: string) => void;
  setLoading: (loading: boolean) => void;
  resetFilters: () => void;
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
  selectedCompanyOids: [],
  dateRange: null,
  filters: defaultFilters,
  quickFilter: defaultQuickFilter,
  searchText: '',
  loading: false,
  
  setCompanies: (companies) => set({ companies }),
  setManifest: (manifest) => set({ manifest }),
  setAllUsers: (users) => set({ allUsers: users }),
  setSelectedCompanyOids: (oids) => set({ selectedCompanyOids: oids }),
  setDateRange: (range) => set({ dateRange: range }),
  setFilters: (filters) => set((state) => ({ 
    filters: { ...state.filters, ...filters } 
  })),
  setQuickFilter: (filter) => set((state) => ({ 
    quickFilter: { ...state.quickFilter, ...filter } 
  })),
  setSearchText: (text) => set({ searchText: text }),
  setLoading: (loading) => set({ loading }),
  resetFilters: () => set({ filters: defaultFilters }),
}));
