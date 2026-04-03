import { List, Typography, Progress, Avatar, Button } from 'antd';
import { FileTextOutlined, LinkOutlined, ExportOutlined } from '@ant-design/icons';
import type { RankingApply, RankingEffect, RankingConversion, RankingTab } from '../../types/rankings';
import styles from './index.module.css';

const { Text } = Typography;

const DEFAULT_LOGO = 'https://image.roadshowchina.cn/Uploads/OrgImgs/2025/12/48810c7576cd4337b8f0d2ffa7c93c1b.png';

interface RankingListProps {
  tab: RankingTab;
  data: (RankingApply | RankingEffect | RankingConversion)[];
  onDetailClick: (record: RankingApply | RankingEffect | RankingConversion) => void;
}

// 获取LOGO URL
const getLogoUrl = (): string => {
  return DEFAULT_LOGO;
};

// 排名徽章
const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) return <span className={styles.badge}>🥇</span>;
  if (rank === 2) return <span className={styles.badge}>🥈</span>;
  if (rank === 3) return <span className={styles.badge}>🥉</span>;
  return <span className={styles.badge}>{rank}</span>;
};

// 进度条颜色
const getProgressColor = (value: number | null): string => {
  if (value == null) return '#d9d9d9';
  if (value >= 80) return '#52c41a';
  if (value >= 50) return '#faad14';
  return '#ff4d4f';
};

// 报名榜列表项
const ApplyItem = ({ record, rank, onDetailClick }: { record: RankingApply; rank: number; onDetailClick: () => void }) => (
  <div className={styles.item}>
    <div className={styles.header}>
      <RankBadge rank={rank} />
      <Avatar size={40} src={getLogoUrl()} className={styles.logo} />
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
    </div>
    
    <div className={styles.progress}>
      <Text type="secondary">报名率</Text>
      <Progress
        percent={record.apply_rate || 0}
        strokeColor={getProgressColor(record.apply_rate)}
        format={() => record.apply_rate != null ? `${record.apply_rate}%` : '-'}
        size="small"
      />
    </div>
    
    <div className={styles.metrics}>
      <span>预约报名 <Text strong>{record.pre_apply_times ?? '-'}</Text></span>
      <span>直播参与 <Text strong>{record.live_join_count ?? '-'}</Text></span>
      <span>人均时长 <Text strong>{record.avg_watch_minutes != null ? `${record.avg_watch_minutes}分钟` : '-'}</Text></span>
    </div>
    
    <div className={styles.actions}>
      <Button type="link" size="small" icon={<FileTextOutlined />} onClick={onDetailClick}>详情</Button>
      <Button type="link" size="small" icon={<LinkOutlined />} href={`https://www.roadshowchina.cn/wap/m/meet/detail?mid=${record.mid}`} target="_blank">路演</Button>
      <Button type="link" size="small" icon={<ExportOutlined />} href={`https://m.roadshowchina.cn/wap/s/company/index?oid=${record.oid}`} target="_blank">公司</Button>
    </div>
  </div>
);

// 参会榜列表项
const EffectItem = ({ record, rank, onDetailClick }: { record: RankingEffect; rank: number; onDetailClick: () => void }) => (
  <div className={styles.item}>
    <div className={styles.header}>
      <RankBadge rank={rank} />
      <Avatar size={40} src={getLogoUrl()} className={styles.logo} />
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
    </div>
    
    <div className={styles.progress}>
      <Text type="secondary">参会时长</Text>
      <Progress
        percent={Math.min((record.total_watch_minutes || 0) / 10, 100)}
        strokeColor="#1677ff"
        format={() => record.total_watch_minutes != null ? `${record.total_watch_minutes}分钟` : '-'}
        size="small"
      />
    </div>
    
    <div className={styles.metrics}>
      <span>预约报名 <Text strong>{record.pre_apply_times ?? '-'}</Text></span>
      <span>人均时长 <Text strong>{record.avg_watch_minutes != null ? `${record.avg_watch_minutes}分钟` : '-'}</Text></span>
      <span>提问数 <Text strong>{record.qa_count ?? '-'}</Text></span>
    </div>
    
    <div className={styles.actions}>
      <Button type="link" size="small" icon={<FileTextOutlined />} onClick={onDetailClick}>详情</Button>
      <Button type="link" size="small" icon={<LinkOutlined />} href={`https://www.roadshowchina.cn/wap/m/meet/detail?mid=${record.mid}`} target="_blank">路演</Button>
      <Button type="link" size="small" icon={<ExportOutlined />} href={`https://m.roadshowchina.cn/wap/s/company/index?oid=${record.oid}`} target="_blank">公司</Button>
    </div>
  </div>
);

// 热门公司榜列表项
const ConversionItem = ({ record, rank, onDetailClick }: { record: RankingConversion; rank: number; onDetailClick: () => void }) => (
  <div className={styles.item}>
    <div className={styles.header}>
      <RankBadge rank={rank} />
      <Avatar size={40} src={getLogoUrl()} className={styles.logo} />
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
    </div>
    
    <div className={styles.progress}>
      <Text type="secondary">新增订阅</Text>
      <Progress
        percent={Math.min((record.sub_user_count || 0) * 2, 100)}
        strokeColor="#52c41a"
        format={() => record.sub_user_count != null ? `${record.sub_user_count}人` : '-'}
        size="small"
      />
    </div>
    
    <div className={styles.metrics}>
      <span>人均时长 <Text strong>{record.avg_watch_minutes != null ? `${record.avg_watch_minutes}分钟` : '-'}</Text></span>
      <span>直播参与 <Text strong>{record.live_join_count ?? '-'}</Text></span>
      <span>回看参与 <Text strong>{record.replay_join_count ?? '-'}</Text></span>
      <span>提问数 <Text strong>{record.qa_count ?? '-'}</Text></span>
      <span>特别关注 <Text strong>{record.special_focus_user_count ?? '-'}</Text></span>
    </div>
    
    <div className={styles.actions}>
      <Button type="link" size="small" icon={<FileTextOutlined />} onClick={onDetailClick}>详情</Button>
      <Button type="link" size="small" icon={<ExportOutlined />} href={`https://m.roadshowchina.cn/wap/s/company/index?oid=${record.oid}`} target="_blank">公司</Button>
    </div>
  </div>
);

export function RankingList({ tab, data, onDetailClick }: RankingListProps) {
  if (data.length === 0) {
    return <div className={styles.empty}><Text type="secondary">暂无数据</Text></div>;
  }

  return (
    <List
      dataSource={data}
      renderItem={(record: RankingApply | RankingEffect | RankingConversion, index) => {
        switch (tab) {
          case 'apply':
            return <ApplyItem record={record as RankingApply} rank={index + 1} onDetailClick={() => onDetailClick(record)} />;
          case 'effect':
            return <EffectItem record={record as RankingEffect} rank={index + 1} onDetailClick={() => onDetailClick(record)} />;
          case 'conversion':
            return <ConversionItem record={record as RankingConversion} rank={index + 1} onDetailClick={() => onDetailClick(record)} />;
          default:
            return null;
        }
      }}
    />
  );
}
