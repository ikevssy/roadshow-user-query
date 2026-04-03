import { Typography, Avatar, Button } from 'antd';
import { FileTextOutlined, LinkOutlined, ExportOutlined } from '@ant-design/icons';
import type { RankingApply, RankingEffect, RankingConversion, RankingTab } from '../../types/rankings';
import styles from './index.module.css';

const { Text } = Typography;

const DEFAULT_LOGO = 'https://image.roadshowchina.cn/Uploads/OrgImgs/2025/12/48810c7576cd4337b8f0d2ffa7c93c1b.png';

interface RankingListProps {
  tab: RankingTab;
  data: (RankingApply | RankingEffect | RankingConversion)[];
  sortField: string;
  sortOrder: 'ascend' | 'descend';
  onDetailClick: (record: RankingApply | RankingEffect | RankingConversion) => void;
}

// 获取LOGO URL
const getLogoUrl = (logoUrl: string | null): string => {
  if (logoUrl && logoUrl.startsWith('http')) return logoUrl;
  if (logoUrl) return `https://image.roadshowchina.cn${logoUrl}`;
  return DEFAULT_LOGO;
};

// 排名徽章
const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) return <span className={styles.badge}>🥇</span>;
  if (rank === 2) return <span className={styles.badge}>🥈</span>;
  if (rank === 3) return <span className={styles.badge}>🥉</span>;
  return <span className={styles.badge}>{rank}</span>;
};

// 获取排序字段名称
const getSortFieldLabel = (_tab: RankingTab, sortField: string): string => {
  const labels: Record<string, string> = {
    pre_apply: '预约报名',
    apply_rate: '报名率',
    live_join: '直播参与',
    avg_time: '人均时长',
    click: '浏览数',
    total_time: '参会时长',
    qa: '提问数',
    skip: '标记不处理',
    total_join: '参与人次',
    replay_join: '回看参与',
    replay_time: '回看时长',
    avg_replay: '人均回看',
    remind: '回看提醒',
    sub: '新增订阅',
    unsub: '取关',
    special: '特别关注',
  };
  return labels[sortField] || '数据';
};

// 获取排序字段值
const getSortFieldValue = (record: RankingApply | RankingEffect | RankingConversion, sortField: string): number => {
  const fieldMap: Record<string, string> = {
    pre_apply: 'pre_apply_times',
    apply_rate: 'apply_rate',
    live_join: 'live_join_count',
    avg_time: 'avg_watch_minutes',
    click: 'click_count',
    total_time: 'total_watch_minutes',
    qa: 'qa_count',
    skip: 'skip_apply_count',
    total_join: 'total_join_count',
    replay_join: 'replay_join_count',
    replay_time: 'replay_watch_minutes',
    avg_replay: 'avg_replay_watch_minutes',
    remind: 'remind_user_count',
    sub: 'sub_user_count',
    unsub: 'unsub_user_count',
    special: 'special_focus_user_count',
  };
  const field = fieldMap[sortField];
  return field ? Number((record as any)[field]) || 0 : 0;
};

// 格式化排序字段值
const formatSortValue = (_tab: RankingTab, sortField: string, value: number): string => {
  if (sortField === 'apply_rate') return `${value}%`;
  if (sortField === 'avg_time' || sortField === 'avg_replay') return `${value}分钟`;
  if (sortField === 'total_time' || sortField === 'replay_time') return `${value}分钟`;
  return String(value);
};

// 格式化次要数据值
const formatSecondaryValue = (field: string, value: number | null): string => {
  if (value == null) return '-';
  if (field === 'avg_watch_minutes' || field === 'avg_replay_watch_minutes') return `${value}分钟`;
  if (field === 'total_watch_minutes' || field === 'replay_watch_minutes') return `${value}分钟`;
  return String(value);
};

// 次要数据配置
const SECONDARY_METRICS: Record<RankingTab, { label: string; field: string }[]> = {
  apply: [
    { label: '浏览', field: 'click_count' },
    { label: '报名人次', field: 'pre_apply_times' },
    { label: '直播参与', field: 'live_join_count' },
  ],
  effect: [
    { label: '直播参与', field: 'live_join_count' },
    { label: '回看参与', field: 'replay_join_count' },
    { label: '人均参会', field: 'avg_watch_minutes' },
    { label: '人均回看', field: 'avg_replay_watch_minutes' },
  ],
  conversion: [
    { label: '参会时长', field: 'total_watch_minutes' },
    { label: '直播参与', field: 'live_join_count' },
    { label: '回看参与', field: 'replay_join_count' },
  ],
};

// 报名榜列表项
const ApplyItem = ({ record, rank, sortField, onDetailClick }: { record: RankingApply; rank: number; sortField: string; onDetailClick: () => void }) => {
  const sortValue = getSortFieldValue(record, sortField);
  const secondary = SECONDARY_METRICS.apply;

  return (
    <div className={styles.item}>
      <div className={styles.header}>
        <RankBadge rank={rank} />
        <Avatar size={40} src={getLogoUrl(record.logo_url)} className={styles.logo} />
        <div className={styles.titleSection}>
          <a
            href={`https://www.roadshowchina.cn/wap/m/meet/detail?mid=${record.mid}`}
            target="_blank"
            rel="noreferrer"
            className={styles.title}
          >
            {record.meet_title}
          </a>
          <a
            href={`https://m.roadshowchina.cn/wap/s/company/index?oid=${record.oid}`}
            target="_blank"
            rel="noreferrer"
            className={styles.company}
          >
            {record.cn_short_name} <Text type="secondary">{record.stock_codes || ''}</Text>
          </a>
        </div>
        <div className={styles.actions}>
          <Button type="link" size="small" icon={<FileTextOutlined />} onClick={onDetailClick}>详情</Button>
          <Button type="link" size="small" icon={<LinkOutlined />} href={`https://www.roadshowchina.cn/wap/m/meet/detail?mid=${record.mid}`} target="_blank">路演</Button>
          <Button type="link" size="small" icon={<ExportOutlined />} href={`https://m.roadshowchina.cn/wap/s/company/index?oid=${record.oid}`} target="_blank">公司</Button>
        </div>
      </div>

      <div className={styles.barSection}>
        <Text className={styles.barLabel}>{getSortFieldLabel('apply', sortField)}</Text>
        <div className={styles.barContainer}>
          <div className={styles.bar} style={{ width: '100%' }} />
          <Text className={styles.barValue}>{formatSortValue('apply', sortField, sortValue)}</Text>
        </div>
      </div>

      <div className={styles.secondary}>
        {secondary.map(m => (
          <span key={m.field}>{m.label} <Text strong>{formatSecondaryValue(m.field, (record as any)[m.field])}</Text></span>
        ))}
      </div>
    </div>
  );
};

// 参会榜列表项
const EffectItem = ({ record, rank, sortField, onDetailClick }: { record: RankingEffect; rank: number; sortField: string; onDetailClick: () => void }) => {
  const sortValue = getSortFieldValue(record, sortField);
  const secondary = SECONDARY_METRICS.effect;

  return (
    <div className={styles.item}>
      <div className={styles.header}>
        <RankBadge rank={rank} />
        <Avatar size={40} src={getLogoUrl(record.logo_url)} className={styles.logo} />
        <div className={styles.titleSection}>
          <a
            href={`https://www.roadshowchina.cn/wap/m/meet/detail?mid=${record.mid}`}
            target="_blank"
            rel="noreferrer"
            className={styles.title}
          >
            {record.meet_title}
          </a>
          <a
            href={`https://m.roadshowchina.cn/wap/s/company/index?oid=${record.oid}`}
            target="_blank"
            rel="noreferrer"
            className={styles.company}
          >
            {record.cn_short_name} <Text type="secondary">{record.stock_codes || ''}</Text>
          </a>
        </div>
        <div className={styles.actions}>
          <Button type="link" size="small" icon={<FileTextOutlined />} onClick={onDetailClick}>详情</Button>
          <Button type="link" size="small" icon={<LinkOutlined />} href={`https://www.roadshowchina.cn/wap/m/meet/detail?mid=${record.mid}`} target="_blank">路演</Button>
          <Button type="link" size="small" icon={<ExportOutlined />} href={`https://m.roadshowchina.cn/wap/s/company/index?oid=${record.oid}`} target="_blank">公司</Button>
        </div>
      </div>

      <div className={styles.barSection}>
        <Text className={styles.barLabel}>{getSortFieldLabel('effect', sortField)}</Text>
        <div className={styles.barContainer}>
          <div className={styles.bar} style={{ width: '100%' }} />
          <Text className={styles.barValue}>{formatSortValue('effect', sortField, sortValue)}</Text>
        </div>
      </div>

      <div className={styles.secondary}>
        {secondary.map(m => (
          <span key={m.field}>{m.label} <Text strong>{formatSecondaryValue(m.field, (record as any)[m.field])}</Text></span>
        ))}
      </div>
    </div>
  );
};

// 热门公司榜列表项
const ConversionItem = ({ record, rank, sortField, onDetailClick }: { record: RankingConversion; rank: number; sortField: string; onDetailClick: () => void }) => {
  const sortValue = getSortFieldValue(record, sortField);
  const secondary = SECONDARY_METRICS.conversion;

  return (
    <div className={styles.item}>
      <div className={styles.header}>
        <RankBadge rank={rank} />
        <Avatar size={40} src={getLogoUrl(record.logo_url)} className={styles.logo} />
        <div className={styles.titleSection}>
          <a
            href={`https://m.roadshowchina.cn/wap/s/company/index?oid=${record.oid}`}
            target="_blank"
            rel="noreferrer"
            className={styles.title}
          >
            {record.cn_short_name}
          </a>
          <Text type="secondary" className={styles.stock}>{record.stock_codes || ''}</Text>
        </div>
        <div className={styles.actions}>
          <Button type="link" size="small" icon={<FileTextOutlined />} onClick={onDetailClick}>详情</Button>
          <Button type="link" size="small" icon={<ExportOutlined />} href={`https://m.roadshowchina.cn/wap/s/company/index?oid=${record.oid}`} target="_blank">公司</Button>
        </div>
      </div>

      <div className={styles.barSection}>
        <Text className={styles.barLabel}>{getSortFieldLabel('conversion', sortField)}</Text>
        <div className={styles.barContainer}>
          <div className={styles.bar} style={{ width: '100%' }} />
          <Text className={styles.barValue}>{formatSortValue('conversion', sortField, sortValue)}</Text>
        </div>
      </div>

      <div className={styles.secondary}>
        {secondary.map(m => (
          <span key={m.field}>{m.label} <Text strong>{formatSecondaryValue(m.field, (record as any)[m.field])}</Text></span>
        ))}
      </div>
    </div>
  );
};

export function RankingList({ tab, data, sortField, onDetailClick }: RankingListProps) {
  if (data.length === 0) {
    return <div className={styles.empty}><Text type="secondary">暂无数据</Text></div>;
  }

  // 计算最大值（第一名）
  const maxValue = data.length > 0 ? getSortFieldValue(data[0], sortField) : 1;

  return (
    <div className={styles.list}>
      {data.map((record: RankingApply | RankingEffect | RankingConversion, index) => {
        const sortValue = getSortFieldValue(record, sortField);
        const barWidth = maxValue > 0 ? (sortValue / maxValue) * 100 : 0;

        switch (tab) {
          case 'apply':
            return (
              <div key={index} className={styles.itemWrapper}>
                <ApplyItem record={record as RankingApply} rank={index + 1} sortField={sortField} onDetailClick={() => onDetailClick(record)} />
                <div className={styles.barOverlay}>
                  <div className={styles.barFill} style={{ width: `${barWidth}%` }} />
                </div>
              </div>
            );
          case 'effect':
            return (
              <div key={index} className={styles.itemWrapper}>
                <EffectItem record={record as RankingEffect} rank={index + 1} sortField={sortField} onDetailClick={() => onDetailClick(record)} />
                <div className={styles.barOverlay}>
                  <div className={styles.barFill} style={{ width: `${barWidth}%` }} />
                </div>
              </div>
            );
          case 'conversion':
            return (
              <div key={index} className={styles.itemWrapper}>
                <ConversionItem record={record as RankingConversion} rank={index + 1} sortField={sortField} onDetailClick={() => onDetailClick(record)} />
                <div className={styles.barOverlay}>
                  <div className={styles.barFill} style={{ width: `${barWidth}%` }} />
                </div>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
