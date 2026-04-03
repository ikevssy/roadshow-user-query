import { useState, useEffect } from 'react';
import { Tabs, Card, Typography, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { RankingTab, RankingApply, RankingEffect, RankingConversion } from '../types/rankings';
import { SortTabs } from '../components/SortTabs';
import { RankingList } from '../components/RankingList';
import { RankingDetail } from '../components/RankingDetail';
import styles from './RankingsPage.module.css';

const { Title } = Typography;

const SORT_CONFIGS = {
  apply: [
    { key: 'apply_rate', label: '报名率', field: 'apply_rate' },
    { key: 'pre_apply', label: '预约报名', field: 'pre_apply_times' },
    { key: 'live_join', label: '直播参与', field: 'live_join_count' },
    { key: 'avg_time', label: '人均时长', field: 'avg_watch_minutes' },
  ],
  effect: [
    { key: 'total_time', label: '参会时长', field: 'total_watch_minutes' },
    { key: 'pre_apply', label: '预约报名', field: 'pre_apply_times' },
    { key: 'avg_time', label: '人均时长', field: 'avg_watch_minutes' },
    { key: 'qa_count', label: '提问数', field: 'qa_count' },
  ],
  conversion: [
    { key: 'sub_count', label: '新增订阅', field: 'sub_user_count' },
    { key: 'avg_time', label: '人均时长', field: 'avg_watch_minutes' },
    { key: 'live_join', label: '直播参与', field: 'live_join_count' },
    { key: 'replay_join', label: '回看参与', field: 'replay_join_count' },
    { key: 'qa_count', label: '提问数', field: 'qa_count' },
    { key: 'special', label: '特别关注', field: 'special_focus_user_count' },
  ],
};

export function RankingsPage() {
  const [activeTab, setActiveTab] = useState<RankingTab>('apply');
  const [applyData, setApplyData] = useState<RankingApply[]>([]);
  const [effectData, setEffectData] = useState<RankingEffect[]>([]);
  const [conversionData, setConversionData] = useState<RankingConversion[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<RankingApply | RankingEffect | RankingConversion | null>(null);
  const [sortField, setSortField] = useState('apply_rate');
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend'>('descend');

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
    // 切换Tab时重置排序
    switch (activeTab) {
      case 'apply': setSortField('apply_rate'); break;
      case 'effect': setSortField('total_time'); break;
      case 'conversion': setSortField('sub_count'); break;
    }
    setSortOrder('descend');
  }, [activeTab]);

  const handleDetailClick = (record: RankingApply | RankingEffect | RankingConversion) => {
    setDetailData(record);
    setDetailOpen(true);
  };

  const handleSortChange = (key: string, order: 'ascend' | 'descend') => {
    setSortField(key);
    setSortOrder(order);
  };

  const getSortedData = () => {
    let data: (RankingApply | RankingEffect | RankingConversion)[] = [];
    switch (activeTab) {
      case 'apply': data = [...applyData]; break;
      case 'effect': data = [...effectData]; break;
      case 'conversion': data = [...conversionData]; break;
    }

    const config = SORT_CONFIGS[activeTab].find(c => c.key === sortField);
    if (config) {
      data.sort((a, b) => {
        const aVal = (a as any)[config.field] || 0;
        const bVal = (b as any)[config.field] || 0;
        return sortOrder === 'descend' ? bVal - aVal : aVal - bVal;
      });
    }

    return data;
  };

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
            <RankingList
              tab="apply"
              data={getSortedData()}
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
            <RankingList
              tab="effect"
              data={getSortedData()}
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
            <RankingList
              tab="conversion"
              data={getSortedData()}
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
