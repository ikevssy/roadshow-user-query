// 公司信息
export interface Company {
  oid: number;
  cn_short_name: string;
  logo_url: string | null;
  industries?: string[];
}

// 行业数据
export interface IndustryData {
  update_time: string;
  industries: string[];
  company_industry_map: Record<string, string[]>;
  industry_company_map: Record<string, number[]>;
  total_companies: number;
}

// 报名记录
export interface ApplyRecord {
  time: string;
  meet_title: string;
}

// 参会记录
export interface AttendRecord {
  time: string;
  meet_title: string;
  duration: number; // 分钟
}

// 订阅公司记录
export interface SubscribeRecord {
  company: string;
  time: string;
}

// 用户互动数据
export interface UserInteraction {
  uid: string;
  name: string;
  org_name: string;
  org_type: string;
  cert_type: string;
  position: string;
  department: string;
  last_interaction_time: string;
  last_interaction_behavior: string;
  interaction_company: string;
  apply_count: number;
  apply_records: ApplyRecord[];
  attend_count: number;
  attend_records: AttendRecord[];
  is_first_attend: boolean;
  subscribed_companies: SubscribeRecord[];
  special_companies: string;
}

// 数据清单
export interface Manifest {
  update_time: string;
  companies_count: number;
  data_start_time: string;
  synced_companies?: number;
  github_base_url?: string;
  release_tags?: string[];
  files: Array<{
    oid: number;
    cn_short_name: string;
    filename: string;
    user_count: number;
    release_batch?: number;
  }>;
}

// 查询模式
export type QueryMode = 'unlimited' | 'select';

// 筛选条件
export interface FilterState {
  certTypes: string[];
  orgTypes: string[];
  interactionDateRange: [string, string] | null;
  applyDateRange: [string, string] | null;
  attendDateRange: [string, string] | null;
  isFirstAttend: boolean | null;
}

// 过滤条件（右侧）
export interface QuickFilterState {
  days: number;
  companyOid: number | null;
}

// 表格列排序
export interface SortState {
  field: string;
  order: 'ascend' | 'descend' | null;
}

// 认证类型映射
export const CERT_TYPES: Record<number, string> = {
  1: '机构投资者',
  2: '卖方分析师',
  3: '上市公司',
  4: '服务机构',
  5: '金融机构',
  6: '媒体',
  99: '个人',
  '-1': '未分类',
};

// 机构类型选项
export const ORG_TYPES = [
  '公募基金',
  '私募基金',
  'QFII',
  '保险资管',
  '券商自营',
  '券商资管',
  '银行理财',
  '信托',
  '财务公司',
  '其他',
];

// 时间预设选项
export const TIME_PRESETS = [
  { label: '今天', value: 0 },
  { label: '昨天', value: -1 },
  { label: '3天', value: 3 },
  { label: '7天', value: 7 },
  { label: '30天', value: 30 },
  { label: '3个月', value: 90 },
  { label: '1年', value: 365 },
];

// 快速过滤天数选项
export const QUICK_FILTER_DAYS = [
  { label: '近3天', value: 3 },
  { label: '近7天', value: 7 },
  { label: '近15天', value: 15 },
];
