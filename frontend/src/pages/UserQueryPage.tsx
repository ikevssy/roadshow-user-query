import { useState } from 'react';
import { Layout, Card, Typography, Space, Button, Tag, message, Progress } from 'antd';
import { SearchOutlined, InfoCircleOutlined, DatabaseOutlined } from '@ant-design/icons';
import { CompanySelector } from '../components/CompanySelector';
import { TimeRangePicker } from '../components/TimeRangePicker';
import { FilterPanel } from '../components/FilterPanel';
import { UserTable } from '../components/UserTable';
import { DetailDrawer } from '../components/DetailDrawer';
import { useAppStore } from '../store';
import { useDataLoader } from '../hooks/useDataLoader';
import type { UserInteraction } from '../types';
import styles from './UserQueryPage.module.css';

const { Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;

type PageMode = 'search' | 'result';

export function UserQueryPage() {
  const { selectedCompanyOids, queryMode, manifest, loading } = useAppStore();
  const { loadUsers } = useDataLoader();
  const [messageApi, contextHolder] = message.useMessage();
  
  const [pageMode, setPageMode] = useState<PageMode>('search');
  const [detailUser, setDetailUser] = useState<UserInteraction | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [progress, setProgress] = useState<{ loaded: number; total: number } | null>(null);
  
  // 查询按钮点击
  const handleSearch = async () => {
    if (queryMode === 'select' && selectedCompanyOids.length === 0) {
      messageApi.warning('请先选择公司或选择"不限"模式');
      return;
    }
    
    setProgress(null);
    await loadUsers((loaded, total) => {
      setProgress({ loaded, total });
    });
    setProgress(null);
    setPageMode('result');
  };
  
  // 返回搜索页
  const handleBack = () => {
    setPageMode('search');
  };
  
  // 查看详情
  const handleViewDetail = (user: UserInteraction) => {
    setDetailUser(user);
    setDetailOpen(true);
  };
  
  // 判断查询按钮是否可用
  const canSearch = queryMode === 'unlimited' || selectedCompanyOids.length > 0;
  
  return (
    <div className={styles.container}>
      {contextHolder}
      
      {pageMode === 'search' ? (
        <div className={styles.searchPage}>
          <Card className={styles.searchCard}>
            <div className={styles.searchHeader}>
              <Title level={3}>用户查询</Title>
              <Paragraph type="secondary" className={styles.searchDesc}>
                通过选择与指定公司互动过的用户，获取UID名单用于路演邀约
              </Paragraph>
            </div>
            
            <Card className={styles.infoCard} size="small">
              <div className={styles.infoSection}>
                <div className={styles.infoTitle}>
                  <InfoCircleOutlined />
                  <Text strong>功能说明</Text>
                </div>
                <div className={styles.infoContent}>
                  <Paragraph style={{ marginBottom: 8 }}>
                    <Text strong>互动行为：</Text>
                    <Space size={[4, 8]} wrap style={{ marginLeft: 8 }}>
                      <Tag color="blue">报名</Tag>
                      <Tag color="green">参会</Tag>
                      <Tag color="orange">订阅</Tag>
                      <Tag color="gold">特别关注</Tag>
                    </Space>
                  </Paragraph>
                  <Paragraph style={{ marginBottom: 8 }}>
                    <Text strong>使用场景：</Text>
                    <Text type="secondary">获取上市公司过往互动的用户名单，进行路演邀约</Text>
                  </Paragraph>
                  <Paragraph style={{ marginBottom: 0 }}>
                    <Text strong>过滤功能：</Text>
                    <Text type="secondary">可过滤近期已报名某公司路演的用户，避免重复邀约</Text>
                  </Paragraph>
                </div>
              </div>
            </Card>
            
            <div className={styles.searchForm}>
              <CompanySelector />
              <TimeRangePicker />
              
              <div className={styles.searchActions}>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  size="large"
                  onClick={handleSearch}
                  disabled={!canSearch}
                  loading={loading}
                >
                  查询互动用户
                </Button>
                {loading && progress && (
                  <div className={styles.progressWrap}>
                    <Progress
                      percent={Math.round((progress.loaded / progress.total) * 100)}
                      size="small"
                      status="active"
                      format={() => `${progress.loaded} / ${progress.total}`}
                    />
                  </div>
                )}
              </div>
            </div>
            
            {manifest && (
              <Card className={styles.dataInfoCard} size="small">
                <div className={styles.infoSection}>
                  <div className={styles.infoTitle}>
                    <DatabaseOutlined />
                    <Text strong>数据信息</Text>
                  </div>
                  <div className={styles.dataInfoGrid}>
                    <div className={styles.dataInfoItem}>
                      <Text type="secondary">数据来源</Text>
                      <Text>RSC路演平台</Text>
                    </div>
                    <div className={styles.dataInfoItem}>
                      <Text type="secondary">更新时间</Text>
                      <Text>{manifest.update_time}</Text>
                    </div>
                    <div className={styles.dataInfoItem}>
                      <Text type="secondary">数据范围</Text>
                      <Text>{manifest.data_start_time} 至今</Text>
                    </div>
                    <div className={styles.dataInfoItem}>
                      <Text type="secondary">已同步公司</Text>
                      <Text>
                        <Text strong>{manifest.synced_companies || manifest.files?.length || 0}</Text> 家有数据
                        <Text type="secondary"> / 共 {manifest.companies_count} 家</Text>
                      </Text>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </Card>
        </div>
      ) : (
        <Layout className={styles.resultLayout}>
          <Sider width={280} theme="light" className={`${styles.resultSider} desktop-only`}>
            <FilterPanel />
          </Sider>
          <div className="mobile-only">
            <FilterPanel isMobile={true} />
          </div>
          <Content className={styles.resultContent}>
            <UserTable 
              onViewDetail={handleViewDetail}
              onBack={handleBack}
            />
          </Content>
        </Layout>
      )}
      
      <DetailDrawer
        user={detailUser}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}
