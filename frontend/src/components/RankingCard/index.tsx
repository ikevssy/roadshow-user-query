import { Card, Typography, Progress, Badge, Avatar, Button } from 'antd';
import { LinkOutlined, ExportOutlined, TrophyOutlined } from '@ant-design/icons';
import type { RankingApply, RankingEffect, RankingConversion } from '../../types/rankings';
import { useAppStore } from '../../store';
import styles from './index.module.css';

const { Text, Title } = Typography;

type RankingTab = 'apply' | 'effect' | 'conversion';

// 获取公司LOGO
const useCompanyLogo = (oid: number) => {
  const companies = useAppStore(state => state.companies);
  const company = companies.find(c => c.oid === oid);
  return company?.logo_url || null;
};

// 排名徽章
const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) return <Badge count={<TrophyOutlined style={{ color: '#faad14', fontSize: 20 }} />} style={{ backgroundColor: 'transparent' }} />;
  if (rank === 2) return <Badge count="2" style={{ backgroundColor: '#bfbfbf' }} />;
  if (rank === 3) return <Badge count="3" style={{ backgroundColor: '#d48806' }} />;
  return <Badge count={rank} style={{ backgroundColor: '#d9d9d9', color: '#666' }} />;
};

// 进度条颜色
const getProgressColor = (value: number | null) => {
  if (value == null) return '#d9d9d9';
  if (value >= 80) return '#52c41a';
  if (value >= 50) return '#faad14';
  return '#ff4d4f';
};

// 报名分析卡片
const ApplyCard = ({ record, rank, onMeetClick, onCompanyClick }: { record: RankingApply; rank: number; onMeetClick: () => void; onCompanyClick: () => void }) => {
  const logoUrl = useCompanyLogo(record.oid);
  const logoSrc = logoUrl ? (logoUrl.startsWith('http') ? logoUrl : `https://image.roadshowchina.cn${logoUrl}`) : null;
  
  return (
  <Card className={styles.card} hoverable onClick={() => onMeetClick()}>
    <div className={styles.cardHeader}>
      <div className={styles.rankTitle}>
        <RankBadge rank={rank} />
        <Title level={5} className={styles.title} ellipsis={{ tooltip: record.meet_title }}>
          {record.meet_title}
        </Title>
      </div>
      <div className={styles.companyInfo}>
        <Avatar 
          size={40} 
          src={logoSrc}
          style={{ backgroundColor: logoSrc ? 'transparent' : '#1677ff', marginRight: 8 }}
        >
          {!logoSrc && (record.cn_short_name?.charAt(0) || '公')}
        </Avatar>
        <div>
          <Text strong className={styles.companyName} onClick={(e) => { e.stopPropagation(); onCompanyClick(); }}>
            {record.cn_short_name}
          </Text>
          <Text type="secondary" className={styles.stockCode}>{record.stock_codes || '-'}</Text>
        </div>
      </div>
    </div>
    
    <div className={styles.metrics}>
      <div className={styles.metric}>
        <Text type="secondary" className={styles.metricLabel}>报名率</Text>
        <Progress
          percent={record.apply_rate || 0}
          strokeColor={getProgressColor(record.apply_rate)}
          format={() => record.apply_rate != null ? `${record.apply_rate}%` : '-'}
          size="small"
        />
      </div>
      <div className={styles.metric}>
        <Text type="secondary" className={styles.metricLabel}>参会率</Text>
        <Progress
          percent={record.attend_rate || 0}
          strokeColor={getProgressColor(record.attend_rate)}
          format={() => record.attend_rate != null ? `${record.attend_rate}%` : '-'}
          size="small"
        />
      </div>
      <div className={styles.metric}>
        <Text type="secondary" className={styles.metricLabel}>直播参与</Text>
        <Text strong className={styles.metricValue}>{record.live_join_count ?? '-'}</Text>
      </div>
      <div className={styles.metric}>
        <Text type="secondary" className={styles.metricLabel}>人均时长</Text>
        <Text strong className={styles.metricValue}>{record.avg_watch_minutes != null ? `${record.avg_watch_minutes}分钟` : '-'}</Text>
      </div>
    </div>
    
    <div className={styles.actions}>
      <Button
        type="link"
        size="small"
        icon={<LinkOutlined />}
        href={`https://www.roadshowchina.cn/wap/m/meet/detail?mid=${record.mid}`}
        target="_blank"
        onClick={(e) => e.stopPropagation()}
      >
        路演详情
      </Button>
      <Button
        type="link"
        size="small"
        icon={<ExportOutlined />}
        href={`https://m.roadshowchina.cn/wap/s/company/index?oid=${record.oid}`}
        target="_blank"
        onClick={(e) => e.stopPropagation()}
      >
        公司详情
      </Button>
    </div>
  </Card>
  );
};

// 参会效果卡片
const EffectCard = ({ record, rank, onMeetClick, onCompanyClick }: { record: RankingEffect; rank: number; onMeetClick: () => void; onCompanyClick: () => void }) => {
  const logoUrl = useCompanyLogo(record.oid);
  const logoSrc = logoUrl ? (logoUrl.startsWith('http') ? logoUrl : `https://image.roadshowchina.cn${logoUrl}`) : null;
  
  return (
  <Card className={styles.card} hoverable onClick={() => onMeetClick()}>
    <div className={styles.cardHeader}>
      <div className={styles.rankTitle}>
        <RankBadge rank={rank} />
        <Title level={5} className={styles.title} ellipsis={{ tooltip: record.meet_title }}>
          {record.meet_title}
        </Title>
      </div>
      <div className={styles.companyInfo}>
        <Avatar 
          size={40} 
          src={logoSrc}
          style={{ backgroundColor: logoSrc ? 'transparent' : '#1677ff', marginRight: 8 }}
        >
          {!logoSrc && (record.cn_short_name?.charAt(0) || '公')}
        </Avatar>
        <div>
          <Text strong className={styles.companyName} onClick={(e) => { e.stopPropagation(); onCompanyClick(); }}>
            {record.cn_short_name}
          </Text>
          <Text type="secondary" className={styles.stockCode}>{record.stock_codes || '-'}</Text>
        </div>
      </div>
    </div>
    
    <div className={styles.metrics}>
      <div className={styles.metric}>
        <Text type="secondary" className={styles.metricLabel}>总参与人次</Text>
        <Text strong className={styles.metricValue}>{record.total_join_count ?? '-'}</Text>
      </div>
      <div className={styles.metric}>
        <Text type="secondary" className={styles.metricLabel}>直播参与</Text>
        <Text strong className={styles.metricValue}>{record.live_join_count ?? '-'}</Text>
      </div>
      <div className={styles.metric}>
        <Text type="secondary" className={styles.metricLabel}>回看参与</Text>
        <Text strong className={styles.metricValue}>{record.replay_join_count ?? '-'}</Text>
      </div>
      <div className={styles.metric}>
        <Text type="secondary" className={styles.metricLabel}>回看提醒</Text>
        <Text strong className={styles.metricValue}>{record.remind_user_count ?? '-'}</Text>
      </div>
    </div>
    
    <div className={styles.actions}>
      <Button
        type="link"
        size="small"
        icon={<LinkOutlined />}
        href={`https://www.roadshowchina.cn/wap/m/meet/detail?mid=${record.mid}`}
        target="_blank"
        onClick={(e) => e.stopPropagation()}
      >
        路演详情
      </Button>
      <Button
        type="link"
        size="small"
        icon={<ExportOutlined />}
        href={`https://m.roadshowchina.cn/wap/s/company/index?oid=${record.oid}`}
        target="_blank"
        onClick={(e) => e.stopPropagation()}
      >
        公司详情
      </Button>
    </div>
  </Card>
  );
};

// 转化效果卡片
const ConversionCard = ({ record, rank, onCompanyClick }: { record: RankingConversion; rank: number; onCompanyClick: () => void }) => {
  const logoUrl = useCompanyLogo(record.oid);
  const logoSrc = logoUrl ? (logoUrl.startsWith('http') ? logoUrl : `https://image.roadshowchina.cn${logoUrl}`) : null;
  
  return (
  <Card className={styles.card} hoverable>
    <div className={styles.cardHeader}>
      <div className={styles.rankTitle}>
        <RankBadge rank={rank} />
        <div className={styles.companyInfo}>
          <Avatar 
            size={40} 
            src={logoSrc}
            style={{ backgroundColor: logoSrc ? 'transparent' : '#1677ff', marginRight: 8 }}
          >
            {!logoSrc && (record.cn_short_name?.charAt(0) || '公')}
          </Avatar>
          <div>
            <Text strong className={styles.companyName} onClick={(e) => { e.stopPropagation(); onCompanyClick(); }}>
              {record.cn_short_name}
            </Text>
            <Text type="secondary" className={styles.stockCode}>{record.stock_codes || '-'}</Text>
          </div>
        </div>
      </div>
    </div>
    
    <div className={styles.metrics}>
      <div className={styles.metric}>
        <Text type="secondary" className={styles.metricLabel}>总参与人次</Text>
        <Text strong className={styles.metricValue}>{record.total_join_count ?? '-'}</Text>
      </div>
      <div className={styles.metric}>
        <Text type="secondary" className={styles.metricLabel}>新增订阅</Text>
        <Text strong className={styles.metricValue} style={{ color: '#52c41a' }}>{record.sub_user_count ?? '-'}</Text>
      </div>
      <div className={styles.metric}>
        <Text type="secondary" className={styles.metricLabel}>取关</Text>
        <Text strong className={styles.metricValue} style={{ color: '#ff4d4f' }}>{record.unsub_user_count ?? '-'}</Text>
      </div>
      <div className={styles.metric}>
        <Text type="secondary" className={styles.metricLabel}>特别关注</Text>
        <Text strong className={styles.metricValue}>{record.special_focus_user_count ?? '-'}</Text>
      </div>
    </div>
    
    <div className={styles.actions}>
      <Button
        type="link"
        size="small"
        icon={<ExportOutlined />}
        href={`https://m.roadshowchina.cn/wap/s/company/index?oid=${record.oid}`}
        target="_blank"
        onClick={(e) => e.stopPropagation()}
      >
        公司详情
      </Button>
    </div>
  </Card>
  );
};

export function RankingCard({ tab, data, loading, onMeetClick, onCompanyClick }: {
  tab: RankingTab;
  data: (RankingApply | RankingEffect | RankingConversion)[];
  loading: boolean;
  onMeetClick: (record: RankingApply | RankingEffect | RankingConversion) => void;
  onCompanyClick: (record: RankingApply | RankingEffect | RankingConversion) => void;
}) {
  if (data.length === 0 && !loading) {
    return (
      <div className={styles.empty}>
        <Text type="secondary">暂无数据</Text>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {data.map((record: RankingApply | RankingEffect | RankingConversion, index: number) => {
        switch (tab) {
          case 'apply':
            return (
              <ApplyCard
                key={index}
                record={record as RankingApply}
                rank={index + 1}
                onMeetClick={() => onMeetClick(record)}
                onCompanyClick={() => onCompanyClick(record)}
              />
            );
          case 'effect':
            return (
              <EffectCard
                key={index}
                record={record as RankingEffect}
                rank={index + 1}
                onMeetClick={() => onMeetClick(record)}
                onCompanyClick={() => onCompanyClick(record)}
              />
            );
          case 'conversion':
            return (
              <ConversionCard
                key={index}
                record={record as RankingConversion}
                rank={index + 1}
                onCompanyClick={() => onCompanyClick(record)}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
