import type { UserInteraction, FilterState, QuickFilterState } from '../types';
import dayjs from 'dayjs';

/**
 * 根据筛选条件过滤用户数据
 */
export function filterUsers(
  users: UserInteraction[],
  filters: FilterState,
  quickFilter: QuickFilterState,
  searchText: string,
  dateRange: [string, string] | null
): UserInteraction[] {
  let result = [...users];
  
  // 文本搜索
  if (searchText) {
    const search = searchText.toLowerCase();
    result = result.filter(
      (u) =>
        u.uid.toLowerCase().includes(search) ||
        u.name.toLowerCase().includes(search) ||
        u.org_name.toLowerCase().includes(search) ||
        u.position.toLowerCase().includes(search)
    );
  }
  
  // 主时间范围过滤（查询时选择的时间范围）
  if (dateRange && dateRange[0] && dateRange[1]) {
    const [start, end] = dateRange;
    const startTime = dayjs(start).startOf('day');
    const endTime = dayjs(end).endOf('day');
    result = result.filter((u) => {
      const time = dayjs(u.last_interaction_time);
      return (time.isAfter(startTime) || time.isSame(startTime)) && 
             (time.isBefore(endTime) || time.isSame(endTime));
    });
  }
  
  // 认证类型筛选
  if (filters.certTypes.length > 0) {
    result = result.filter((u) => filters.certTypes.includes(u.cert_type));
  }
  
  // 机构类型筛选
  if (filters.orgTypes.length > 0) {
    result = result.filter((u) => filters.orgTypes.includes(u.org_type));
  }
  
  // 最近互动时间范围筛选
  if (filters.interactionDateRange && filters.interactionDateRange[0] && filters.interactionDateRange[1]) {
    const [start, end] = filters.interactionDateRange;
    const startTime = dayjs(start).startOf('day');
    const endTime = dayjs(end).endOf('day');
    result = result.filter((u) => {
      const time = dayjs(u.last_interaction_time);
      return (time.isAfter(startTime) || time.isSame(startTime)) && 
             (time.isBefore(endTime) || time.isSame(endTime));
    });
  }
  
  // 最新报名时间范围筛选
  if (filters.applyDateRange && filters.applyDateRange[0] && filters.applyDateRange[1]) {
    const [start, end] = filters.applyDateRange;
    const startTime = dayjs(start).startOf('day');
    const endTime = dayjs(end).endOf('day');
    result = result.filter((u) => {
      if (u.apply_records.length === 0) return false;
      const latestApply = u.apply_records[0];
      const time = dayjs(latestApply.time);
      return (time.isAfter(startTime) || time.isSame(startTime)) && 
             (time.isBefore(endTime) || time.isSame(endTime));
    });
  }
  
  // 最新参会时间范围筛选
  if (filters.attendDateRange && filters.attendDateRange[0] && filters.attendDateRange[1]) {
    const [start, end] = filters.attendDateRange;
    const startTime = dayjs(start).startOf('day');
    const endTime = dayjs(end).endOf('day');
    result = result.filter((u) => {
      if (u.attend_records.length === 0) return false;
      const latestAttend = u.attend_records[0];
      const time = dayjs(latestAttend.time);
      return (time.isAfter(startTime) || time.isSame(startTime)) && 
             (time.isBefore(endTime) || time.isSame(endTime));
    });
  }
  
  // 是否首次参会
  if (filters.isFirstAttend !== null) {
    result = result.filter((u) => u.is_first_attend === filters.isFirstAttend);
  }
  
  // 快速过滤：排除近X天报名过某公司路演的人（避免重复邀约）
  if (quickFilter.companyOid) {
    const cutoff = dayjs().subtract(quickFilter.days, 'day');
    // 排除近X天内报名过该公司的用户
    result = result.filter((u) => {
      const hasRecentApply = u.apply_records.some((record) => {
        return dayjs(record.time).isAfter(cutoff);
      });
      // 返回false表示排除这些用户
      return !hasRecentApply;
    });
  }
  
  return result;
}

/**
 * 排序用户数据
 */
export function sortUsers(
  users: UserInteraction[],
  field: string,
  order: 'ascend' | 'descend' | null
): UserInteraction[] {
  if (!order) return users;
  
  const sorted = [...users];
  const multiplier = order === 'ascend' ? 1 : -1;
  
  sorted.sort((a, b) => {
    let aVal: any = a[field as keyof UserInteraction];
    let bVal: any = b[field as keyof UserInteraction];
    
    // 处理时间字段
    if (field === 'last_interaction_time') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }
    
    // 处理数字字段
    if (field === 'apply_count' || field === 'attend_count') {
      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
    }
    
    // 处理字符串字段
    if (typeof aVal === 'string') {
      return aVal.localeCompare(bVal) * multiplier;
    }
    
    return (aVal - bVal) * multiplier;
  });
  
  return sorted;
}

/**
 * 复制文本到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 降级方案
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}
