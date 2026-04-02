import { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Button, message } from 'antd';
import { HomeOutlined, SearchOutlined, BarChartOutlined, ReloadOutlined } from '@ant-design/icons';
import { HomePage } from './pages/HomePage';
import { UserQueryPage } from './pages/UserQueryPage';
import { RankingsPage } from './pages/RankingsPage';
import { useAppStore } from './store';
import { useDataLoader } from './hooks/useDataLoader';
import './App.css';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

type PageType = 'home' | 'query' | 'rankings';

function App() {
  const { manifest } = useAppStore();
  const { loadCompanies, loadIndustryData, loadManifest } = useDataLoader();
  const [messageApi, contextHolder] = message.useMessage();
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  
  // 初始化加载数据
  useEffect(() => {
    loadCompanies();
    loadIndustryData();
    loadManifest();
  }, []);
  
  // 刷新数据
  const handleRefresh = async () => {
    messageApi.loading({ content: '正在刷新数据...', key: 'refresh' });
    await loadManifest();
    await loadCompanies();
    await loadIndustryData();
    messageApi.success({ content: '数据刷新成功', key: 'refresh', duration: 2 });
  };
  
  const menuItems = [
    { key: 'home', icon: <HomeOutlined />, label: '首页' },
    { key: 'query', icon: <SearchOutlined />, label: '用户查询' },
    { key: 'rankings', icon: <BarChartOutlined />, label: '路演榜单' },
  ];
  
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'query':
        return <UserQueryPage />;
      case 'rankings':
        return <RankingsPage />;
      default:
        return <HomePage />;
    }
  };
  
  return (
    <Layout className="app-layout">
      {contextHolder}
      <Header className="app-header">
        <div className="header-left">
          <Title level={4} style={{ margin: 0, color: '#fff', marginRight: 24 }}>
            RSC 路演互动
          </Title>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[currentPage]}
            items={menuItems}
            onClick={({ key }) => setCurrentPage(key as PageType)}
            style={{ border: 'none', background: 'transparent' }}
          />
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
      
      <Content className="app-content">
        {renderPage()}
      </Content>
    </Layout>
  );
}

export default App;
