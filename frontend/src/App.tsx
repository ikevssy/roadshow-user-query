import { useState, useEffect } from 'react';
import { Layout, Card, Typography, Space, Button, Tag, message } from 'antd';
import { SearchOutlined, ReloadOutlined, InfoCircleOutlined, DatabaseOutlined } from '@ant-design/icons';
import { CompanySelector } from './components/CompanySelector';
import { TimeRangePicker } from './components/TimeRangePicker';
import { FilterPanel } from './components/FilterPanel';
import { UserTable } from './components/UserTable';
import { DetailDrawer } from './components/DetailDrawer';
import { useAppStore } from './store';
import { useDataLoader } from './hooks/useDataLoader';
import type { UserInteraction } from './types';
import './App.css';

const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

type PageMode = 'search' | 'result';

function App() {
  const { 
    selectedCompanyOids, 
    queryMode,
    manifest, 
    loading,
  } = useAppStore();
  
  const { loadCompanies, loadIndustryData, loadManifest, loadUsers } = useDataLoader();
  const [messageApi, contextHolder] = message.useMessage();
  
  const [pageMode, setPageMode] = useState<PageMode>('search');
  const [detailUser, setDetailUser] = useState<UserInteraction | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  
  // 初始化加载数据
  useEffect(() => {
    loadCompanies();
    loadIndustryData();
    loadManifest();
  }, []);
  
  // 查询按钮点击
  const handleSearch = async () => {
    if (queryMode === 'select' && selectedCompanyOids.length === 0) {
      messageApi.warning('请先选择公司或选择"不限"模式');
      return;
    }
    
    await loadUsers();
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
  
  // 刷新数据
  const handleRefresh = async () => {
    messageApi.loading({ content: '正在刷新数据...', key: 'refresh' });
    await loadManifest();
    await loadCompanies();
    await loadIndustryData();
    messageApi.success({ content: '数据刷新成功', key: 'refresh', duration: 2 });
  };
  
  // 判断查询按钮是否可用
  const canSearch = queryMode === 'unlimited' || selectedCompanyOids.length > 0;
  
  return (
    <Layout className="app-layout">
      {contextHolder}
      <Header className="app-header">
        <div className="header-left">
          <Title level={4} style={{ margin: 0, color: '#fff' }}>
            RSC 路演互动邀约用户查询
          </Title>
        </div>
        <div className="header-right">
          {manifest && (
            <Text className="update-time" style={{ color: 'rgba(255,255,255,0.65)' }}>
              数据更新: {manifest.update_time}
            </Text>
          )}
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            style={{ marginLeft: 8 }}
            size="small"
          >
            刷新
          </Button>
        </div>
      </Header>
      
      <Layout className="app-content">
        {pageMode === 'search' ? (
          <Content className="search-page">
            <Card className="search-card">
              <div className="search-header">
                <Title level={3}>RSC 路演互动邀约用户查询</Title>
                <Paragraph type="secondary" className="search-desc">
                  通过选择与指定公司互动过的用户，获取UID名单用于路演邀约
                </Paragraph>
              </div>
              
              <Card className="info-card" size="small">
                <div className="info-section">
                  <div className="info-title">
                    <InfoCircleOutlined />
                    <Text strong>功能说明</Text>
                  </div>
                  <div className="info-content">
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
              
              <div className="search-form">
                <CompanySelector />
                <TimeRangePicker />
                
                {/* 不限模式时显示筛选条件 */}
                {queryMode === 'unlimited' && (
                  <Card className="filter-in-search-card" size="small" style={{ marginTop: 16, marginBottom: 16 }}>
                    <FilterPanel />
                  </Card>
                )}
                
                <div className="search-actions">
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
                </div>
              </div>
              
              {manifest && (
                <Card className="data-info-card" size="small">
                  <div className="info-section">
                    <div className="info-title">
                      <DatabaseOutlined />
                      <Text strong>数据信息</Text>
                    </div>
                    <div className="data-info-grid">
                      <div className="data-info-item">
                        <Text type="secondary">数据来源</Text>
                        <Text>RSC路演平台</Text>
                      </div>
                      <div className="data-info-item">
                        <Text type="secondary">更新时间</Text>
                        <Text>{manifest.update_time}</Text>
                      </div>
                      <div className="data-info-item">
                        <Text type="secondary">数据范围</Text>
                        <Text>{manifest.data_start_time} 至今</Text>
                      </div>
                      <div className="data-info-item">
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
          </Content>
        ) : (
          <Layout className="result-layout">
            {/* 桌面端显示侧边栏 */}
            <Sider width={280} theme="light" className="result-sider desktop-only">
              <FilterPanel />
            </Sider>
            {/* 移动端显示浮动按钮和抽屉 */}
            <div className="mobile-only">
              <FilterPanel isMobile={true} />
            </div>
            <Content className="result-content">
              <UserTable 
                onViewDetail={handleViewDetail}
                onBack={handleBack}
              />
            </Content>
          </Layout>
        )}
      </Layout>
      
      <DetailDrawer
        user={detailUser}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </Layout>
  );
}

export default App;
