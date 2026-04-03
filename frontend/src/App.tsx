import { useState, useEffect } from 'react';
import { Layout, Menu, Typography } from 'antd';
import { HomeOutlined, SearchOutlined, BarChartOutlined } from '@ant-design/icons';
import { HomePage } from './pages/HomePage';
import { UserQueryPage } from './pages/UserQueryPage';
import { RankingsPage } from './pages/RankingsPage';
import { useAppStore } from './store';
import { useDataLoader } from './hooks/useDataLoader';
import './App.css';

const { Header, Content } = Layout;
const { Title } = Typography;

type PageType = 'home' | 'query' | 'rankings';

function App() {
  const { manifest } = useAppStore();
  const { loadCompanies, loadIndustryData, loadManifest } = useDataLoader();
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  
  // 初始化加载数据
  useEffect(() => {
    loadCompanies();
    loadIndustryData();
    loadManifest();
  }, []);
  
  const menuItems = [
    { key: 'home', icon: <HomeOutlined />, label: '首页' },
    { key: 'query', icon: <SearchOutlined />, label: '用户查询' },
    { key: 'rankings', icon: <BarChartOutlined />, label: '路演榜单' },
  ];
  
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} updateTime={manifest?.update_time} />;
      case 'query':
        return <UserQueryPage />;
      case 'rankings':
        return <RankingsPage />;
      default:
        return <HomePage onNavigate={setCurrentPage} updateTime={manifest?.update_time} />;
    }
  };
  
  return (
    <Layout className="app-layout">
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
      </Header>
      
      <Content className="app-content">
        {renderPage()}
      </Content>
    </Layout>
  );
}

export default App;
