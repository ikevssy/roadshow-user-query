import { useState, useEffect, useMemo } from 'react';
import { Tabs, Card, Typography, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { RankingTab, RankingApply, RankingEffect, RankingConversion, SortOption } from '../types/rankings';
import { SortTabs } from '../components/SortTabs';
import { TimeRangeFilter } from '../components/TimeRangeFilter';
import { RankingList } from '../components/RankingList';
import { RankingDetail } from '../components/RankingDetail';
import styles from './RankingsPage.module.css';

const { Title } = Typography;

const SORT_CONFIGS: Record<RankingTab, SortOption[]> = {
  apply: [
    { key: 'pre_apply', label: '预约报名', field: 'pre_apply_times' },
    { key: 'apply_rate', label: '报名率', field: 'apply_rate' },
    { key: 'live_join', label: '直播参与', field: 'live_join_count' },
    { key: 'avg_time', label: '人均时长', field: 'avg_watch_minutes' },
    { key: 'click', label: '浏览数', field: 'click_count' },
    { key: 'total_time', label: '参会时长', field: 'total_watch_minutes' },
    { key: 'qa', label: '提问数', field: 'qa_count' },
    { key: 'skip', label: '标记不处理', field: 'skip_apply_count' },
  ],
  effect: [
    { key: 'total_time', label: '参会时长', field: 'total_watch_minutes' },
    { key: 'total_join', label: '参与人次', field: 'total_join_count' },
    { key: 'avg_time', label: '人均时长', field: 'avg_watch_minutes' },
    { key: 'live_join', label: '直播参与', field: 'live_join_count' },
    { key: 'replay_join', label: '回看参与', field: 'replay_join_count' },
    { key: 'replay_time', label: '回看时长', field: 'replay_watch_minutes' },
    { key: 'avg_replay', label: '人均回看', field: 'avg_replay_watch_minutes' },
    { key: 'pre_apply', label: '预约报名', field: 'pre_apply_times' },
    { key: 'remind', label: '回看提醒', field: 'remind_user_count' },
    { key: 'qa', label: '提问数', field: 'qa_count' },
  ],
  conversion: [
    { key: 'sub', label: '新增订阅', field: 'sub_user_count' },
    { key: 'total_time', label: '参会时长', field: 'total_watch_minutes' },
    { key: 'total_join', label: '参与人次', field: 'total_join_count' },
    { key: 'avg_time', label: '人均时长', field: 'avg_watch_minutes' },
    { key: 'live_join', label: '直播参与', field: 'live_join_count' },
    { key: 'replay_join', label: '回看参与', field: 'replay_join_count' },
    { key: 'qa', label: '提问数', field: 'qa_count' },
    { key: 'unsub', label: '取关', field: 'unsub_user_count' },
    { key: 'special', label: '特别关注', field: 'special_focus_user_count' },
  ],
};

const DEFAULT_TIME_RANGE: Record<RankingTab, string> = {
  apply: '7d',
  effect: '7d',
  conversion: '15d',
};

export function RankingsPage() {
  const [activeTab, setActiveTab] = useState<RankingTab>('apply');
  const [applyData, setApplyData] = useState<RankingApply[]>([]);
  const [effectData, setEffectData] = useState<RankingEffect[]>([]);
  const [conversionData, setConversionData] = useState<RankingConversion[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<RankingApply | RankingEffect | RankingConversion | null>(null);
  const [sortField, setSortField] = useState('pre_apply');
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend'>('descend');
  const [timeRange, setTimeRange] = useState('7d');

  // 添加调试日志
  console.log('[Rankings] timeRange:', timeRange, 'activeTab:', activeTab);

  const loadData = async () => {
    setLoading(true);
    try {
      const [applyRes, effectRes, conversionRes] = await Promise.all([
        fetch('/data/rankings_apply.json').then(r => r.json()),
        fetch('/data/rankings_effect.json').then(r => r.json()),
        fetch('/data/rankings_conversion.json').then(r => r.json()),
      ]);
      setApplyData(applyRes || []);
      setEffectData(effectRes || []);
      setConversionData(conversionRes || []);
    } catch (error) {
      console.error('加载榜单数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // 切换Tab时重置排序和时间范围
    setSortField(SORT_CONFIGS[activeTab][0].key);
    setSortOrder('descend');
    setTimeRange(DEFAULT_TIME_RANGE[activeTab]);
  }, [activeTab]);

  const handleDetailClick = (record: RankingApply | RankingEffect | RankingConversion) => {
    setDetailData(record);
    setDetailOpen(true);
  };

  const handleSortChange = (key: string, order: 'ascend' | 'descend') => {
    setSortField(key);
    setSortOrder(order);
  };

  // 时间过滤
  const filterByTimeRange = (data: (RankingApply | RankingEffect | RankingConversion)[]) => {
    // 热门公司榜没有start_time字段，跳过时间过滤
    if (activeTab === 'conversion') return data;
    if (data.length === 0) return data;

    const now = dayjs();
    let start: dayjs.Dayjs, end: dayjs.Dayjs;

    switch (timeRange) {
      case '7d':
        start = now.subtract(7, 'day').startOf('day');
        end = now.endOf('day');
        break;
      case '15d':
        start = now.subtract(15, 'day').startOf('day');
        end = now.endOf('day');
        break;
      case '30d':
        start = now.subtract(30, 'day').startOf('day');
        end = now.endOf('day');
        break;
      case 'lastWeek':
        start = now.subtract(1, 'week').startOf('week');
        end = now.subtract(1, 'week').endOf('week');
        break;
      case 'thisWeek':
        start = now.startOf('week');
        end = now.endOf('week');
        break;
      case 'lastMonth':
        start = now.subtract(1, 'month').startOf('month');
        end = now.subtract(1, 'month').endOf('month');
        break;
      case 'thisMonth':
        start = now.startOf('month');
        end = now.endOf('month');
        break;
      default:
        return data;
    }

    return data.filter(item => {
      const st = (item as any).start_time;
      if (!st) return true;
      const itemTime = dayjs(st);
      if (!itemTime.isValid()) return true;
      const inRange = (itemTime.isAfter(start) || itemTime.isSame(start)) && (itemTime.isBefore(end) || itemTime.isSame(end));
      return inRange;
    });
  };

  const getSortedData = () => {
    let data: (RankingApply | RankingEffect | RankingConversion)[] = [];
    switch (activeTab) {
      case 'apply': data = [...applyData]; break;
      case 'effect': data = [...effectData]; break;
      case 'conversion': data = [...conversionData]; break;
    }
    console.log('[Rankings] getSortedData - before filter:', data.length, 'timeRange:', timeRange);

    // 时间过滤
    data = filterByTimeRange(data);
    console.log('[Rankings] getSortedData - after filter:', data.length);

    // 排序
    const config = SORT_CONFIGS[activeTab].find(c => c.key === sortField);
    if (config) {
      data.sort((a, b) => {
        const aVal = Number((a as any)[config.field]) || 0;
        const bVal = Number((b as any)[config.field]) || 0;
        return sortOrder === 'descend' ? bVal - aVal : aVal - bVal;
      });
    }

    return data;
  };

  const sortedData = useMemo(() => {
    console.log('[Rankings] getSortedData called:', { activeTab, sortField, sortOrder, timeRange, applyDataLen: applyData.length });
    return getSortedData();
  }, [activeTab, sortField, sortOrder, timeRange, applyData, effectData, conversionData]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={3} style={{ margin: 0 }}>路演榜单</Title>
        <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>刷新</Button>
      </div>

      <Card className={styles.card}>
        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key as RankingTab)}>
          <Tabs.TabPane tab="报名榜" key="apply">
            <SortTabs
              options={SORT_CONFIGS.apply}
              activeKey={sortField}
              sortOrder={sortOrder}
              onChange={handleSortChange}
            />
            <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
            <RankingList
              tab="apply"
              data={sortedData}
              sortField={sortField}
              sortOrder={sortOrder}
              onDetailClick={handleDetailClick}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="参会榜" key="effect">
            <SortTabs
              options={SORT_CONFIGS.effect}
              activeKey={sortField}
              sortOrder={sortOrder}
              onChange={handleSortChange}
            />
            <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
            <RankingList
              tab="effect"
              data={sortedData}
              sortField={sortField}
              sortOrder={sortOrder}
              onDetailClick={handleDetailClick}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="热门公司榜" key="conversion">
            <SortTabs
              options={SORT_CONFIGS.conversion}
              activeKey={sortField}
              sortOrder={sortOrder}
              onChange={handleSortChange}
            />
            <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
            <RankingList
              tab="conversion"
              data={sortedData}
              sortField={sortField}
              sortOrder={sortOrder}
              onDetailClick={handleDetailClick}
            />
          </Tabs.TabPane>
        </Tabs>
      </Card>

      <RankingDetail
        tab={activeTab}
        data={detailData}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}
