import { useState, useEffect } from 'react';
import { Tabs, Card, Typography, Space, Button, Segmented } from 'antd';
import { ReloadOutlined, AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import type { RankingTab, RankingApply, RankingEffect, RankingConversion } from '../types/rankings';
import { RankingTable } from '../components/RankingTable';
import { RankingCard } from '../components/RankingCard';
import { RankingDetail } from '../components/RankingDetail';
import styles from './RankingsPage.module.css';

const { Title } = Typography;

export function RankingsPage() {
  const [activeTab, setActiveTab] = useState<RankingTab>('apply');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [applyData, setApplyData] = useState<RankingApply[]>([]);
  const [effectData, setEffectData] = useState<RankingEffect[]>([]);
  const [conversionData, setConversionData] = useState<RankingConversion[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<RankingApply | RankingEffect | RankingConversion | null>(null);

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

  const handleMeetClick = (record: RankingApply | RankingEffect | RankingConversion) => {
    setDetailData(record);
    setDetailOpen(true);
  };

  const handleCompanyClick = (record: RankingApply | RankingEffect | RankingConversion) => {
    setDetailData(record);
    setDetailOpen(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={3} style={{ margin: 0 }}>路演榜单</Title>
        <Space>
          <Segmented
            options={[
              { label: '卡片', value: 'card', icon: <AppstoreOutlined /> },
              { label: '表格', value: 'table', icon: <UnorderedListOutlined /> },
            ]}
            value={viewMode}
            onChange={(val) => setViewMode(val as 'card' | 'table')}
          />
          <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
            刷新
          </Button>
        </Space>
      </div>

      <Card className={styles.card}>
        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key as RankingTab)}>
          <Tabs.TabPane tab="路演报名分析" key="apply">
            {viewMode === 'card' ? (
              <RankingCard
                tab="apply"
                data={applyData}
                loading={loading}
                onMeetClick={handleMeetClick}
                onCompanyClick={handleCompanyClick}
              />
            ) : (
              <RankingTable
                tab="apply"
                data={applyData}
                loading={loading}
                onMeetClick={handleMeetClick}
                onCompanyClick={handleCompanyClick}
              />
            )}
          </Tabs.TabPane>
          <Tabs.TabPane tab="路演参会效果分析" key="effect">
            {viewMode === 'card' ? (
              <RankingCard
                tab="effect"
                data={effectData}
                loading={loading}
                onMeetClick={handleMeetClick}
                onCompanyClick={handleCompanyClick}
              />
            ) : (
              <RankingTable
                tab="effect"
                data={effectData}
                loading={loading}
                onMeetClick={handleMeetClick}
                onCompanyClick={handleCompanyClick}
              />
            )}
          </Tabs.TabPane>
          <Tabs.TabPane tab="公司路演转化效果分析" key="conversion">
            {viewMode === 'card' ? (
              <RankingCard
                tab="conversion"
                data={conversionData}
                loading={loading}
                onMeetClick={handleMeetClick}
                onCompanyClick={handleCompanyClick}
              />
            ) : (
              <RankingTable
                tab="conversion"
                data={conversionData}
                loading={loading}
                onMeetClick={handleMeetClick}
                onCompanyClick={handleCompanyClick}
              />
            )}
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
