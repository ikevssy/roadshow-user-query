// 路演榜单数据类型

// 榜单1：报名分析
export interface RankingApply {
  mid: number;
  meet_title: string;
  start_time: string;
  click_count: number | null;
  pre_apply_times: number | string | null;
  apply_rate: number | null;
  skip_apply_count: number | null;
  live_join_count: number | null;
  attend_rate: number | null;
  avg_watch_minutes: number | null;
  total_watch_minutes: number | null;
  qa_count: number | null;
  oid: number;
  cn_short_name: string;
  stock_codes: string | null;
  logo_url: string | null;
}

// 榜单2：参会效果
export interface RankingEffect {
  mid: number;
  meet_title: string;
  start_time: string;
  total_watch_minutes: number | null;
  total_join_count: number | null;
  avg_watch_minutes: number | null;
  live_join_count: number | null;
  replay_join_count: number | null;
  replay_watch_minutes: number | null;
  avg_replay_watch_minutes: number | null;
  pre_apply_times: number | string | null;
  qa_count: number | null;
  remind_user_count: number | null;
  oid: number;
  cn_short_name: string;
  stock_codes: string | null;
  logo_url: string | null;
}

// 榜单3：转化效果
export interface RankingConversion {
  oid: number;
  cn_short_name: string;
  stock_codes: string | null;
  total_watch_minutes: number | null;
  total_join_count: number | null;
  avg_watch_minutes: number | null;
  live_join_count: number | null;
  replay_join_count: number | null;
  qa_count: number | null;
  sub_user_count: number | null;
  unsub_user_count: number | null;
  special_focus_user_count: number | null;
  logo_url: string | null;
}

// 榜单配置
export interface RankingConfig {
  days: number;
  max_days: number;
  limit: number;
}

// 榜单类型
export type RankingTab = 'apply' | 'effect' | 'conversion';

// 时间范围选项
export interface TimeRangeOption {
  key: string;
  label: string;
}

// 排序选项
export interface SortOption {
  key: string;
  label: string;
  field: string;
}
