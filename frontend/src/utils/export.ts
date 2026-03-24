import * as XLSX from 'xlsx';
import type { UserInteraction } from '../types';
import dayjs from 'dayjs';

/**
 * 导出用户数据为Excel
 */
export function exportToExcel(users: UserInteraction[], filename?: string): void {
  // 准备导出数据
  const exportData = users.map((user) => ({
    'UID': user.uid,
    '姓名': user.name,
    '机构名称': user.org_name,
    '机构类型': user.org_type,
    '认证类型': user.cert_type,
    '职位': user.position,
    '部门': user.department,
    '最近互动时间': user.last_interaction_time,
    '互动行为': user.last_interaction_behavior,
    '互动对象': user.interaction_company,
    '报名场次': user.apply_count,
    '参会场次': user.attend_count,
    '是否首次参会': user.is_first_attend ? '是' : '',
    '报名记录': user.apply_records
      .map((r) => `${r.time} ${r.meet_title}`)
      .join('\n'),
    '参会记录': user.attend_records
      .map((r) => `${r.time} ${r.meet_title} (${r.duration}分钟)`)
      .join('\n'),
    '订阅公司': user.subscribed_companies
      .map((s) => `${s.company} (${s.time})`)
      .join('\n'),
    '特别关注公司': user.special_companies,
  }));
  
  // 创建工作簿
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);
  
  // 设置列宽
  const colWidths = [
    { wch: 12 },  // UID
    { wch: 10 },  // 姓名
    { wch: 20 },  // 机构名称
    { wch: 12 },  // 机构类型
    { wch: 12 },  // 认证类型
    { wch: 15 },  // 职位
    { wch: 15 },  // 部门
    { wch: 20 },  // 最近互动时间
    { wch: 8 },   // 互动行为
    { wch: 15 },  // 互动对象
    { wch: 8 },   // 报名场次
    { wch: 8 },   // 参会场次
    { wch: 10 },  // 是否首次参会
    { wch: 40 },  // 报名记录
    { wch: 40 },  // 参会记录
    { wch: 30 },  // 订阅公司
    { wch: 20 },  // 特别关注公司
  ];
  ws['!cols'] = colWidths;
  
  // 添加工作表
  XLSX.utils.book_append_sheet(wb, ws, '用户互动数据');
  
  // 生成文件名
  const defaultFilename = `路演互动用户_${dayjs().format('YYYY-MM-DD')}.xlsx`;
  
  // 下载文件
  XLSX.writeFile(wb, filename || defaultFilename);
}

/**
 * 导出UID列表
 */
export function exportUids(users: UserInteraction[]): string {
  return users.map((u) => u.uid).join('\n');
}
