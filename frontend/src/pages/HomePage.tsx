import { Card, Typography, Row, Col, Button, Space } from 'antd';
import { 
  SearchOutlined, 
  BarChartOutlined, 
  ExportOutlined,
  SyncOutlined,
  FileTextOutlined,
  RocketOutlined,
  RightOutlined
} from '@ant-design/icons';
import styles from './HomePage.module.css';

const { Title, Paragraph, Text } = Typography;

type PageType = 'home' | 'query' | 'rankings';

interface HomePageProps {
  onNavigate: (page: PageType) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroIcon}>
            <RocketOutlined />
          </div>
          <Title level={2} className={styles.heroTitle}>
            RSC 路演互动邀约用户查询系统
          </Title>
          <Text className={styles.heroDesc}>
            一站式路演数据分析与投资者关系管理平台
          </Text>
          <Space size="middle" className={styles.heroActions}>
            <Button type="primary" size="large" icon={<SearchOutlined />} onClick={() => onNavigate('query')}>
              开始查询
            </Button>
            <Button size="large" icon={<BarChartOutlined />} onClick={() => onNavigate('rankings')}>
              查看榜单
            </Button>
          </Space>
        </div>
      </div>

      {/* 核心功能 */}
      <div className={styles.section}>
        <Title level={3} className={styles.sectionTitle}>核心功能</Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Card className={styles.featureCard} hoverable onClick={() => onNavigate('query')}>
              <div className={styles.featureIcon}>
                <SearchOutlined />
              </div>
              <Title level={4}>精准查询</Title>
              <Paragraph type="secondary">
                按公司、行业、时间查询互动用户，多维度筛选定位目标投资者
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className={styles.featureCard} hoverable onClick={() => onNavigate('rankings')}>
              <div className={styles.featureIcon}>
                <BarChartOutlined />
              </div>
              <Title level={4}>数据榜单</Title>
              <Paragraph type="secondary">
                报名榜、参会榜、热门公司榜，可视化展示路演效果
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className={styles.featureCard} hoverable>
              <div className={styles.featureIcon}>
                <ExportOutlined />
              </div>
              <Title level={4}>数据导出</Title>
              <Paragraph type="secondary">
                导出Excel、复制UID，支持后续跟进和深度分析
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </div>

      {/* 最佳实践场景 */}
      <div className={styles.section}>
        <Title level={3} className={styles.sectionTitle}>最佳实践场景</Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card className={styles.practiceCard}>
              <div className={styles.practiceHeader}>
                <div className={styles.practiceIcon}>📈</div>
                <Title level={4}>运营数据监控</Title>
              </div>
              <ul className={styles.practiceList}>
                <li>实时监控各公司路演报名率和参会率</li>
                <li>识别高关注度公司和低效路演</li>
                <li>优化路演排期和资源分配</li>
              </ul>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card className={styles.practiceCard}>
              <div className={styles.practiceHeader}>
                <div className={styles.practiceIcon}>🏢</div>
                <Title level={4}>行业投资者分析</Title>
              </div>
              <ul className={styles.practiceList}>
                <li>追踪医药/科技/消费等行业活跃投资者</li>
                <li>发现新进入的机构投资者</li>
                <li>分析投资者跨公司互动行为</li>
              </ul>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card className={styles.practiceCard}>
              <div className={styles.practiceHeader}>
                <div className={styles.practiceIcon}>🤝</div>
                <Title level={4}>精准邀约策略</Title>
              </div>
              <ul className={styles.practiceList}>
                <li>排除近期已报名用户，避免重复邀约</li>
                <li>根据历史参会数据筛选高意向投资者</li>
                <li>按机构类型定制邀约策略</li>
              </ul>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card className={styles.practiceCard}>
              <div className={styles.practiceHeader}>
                <div className={styles.practiceIcon}>📊</div>
                <Title level={4}>市场热度分析</Title>
              </div>
              <ul className={styles.practiceList}>
                <li>通过榜单数据识别市场关注热点</li>
                <li>追踪行业轮动和资金流向</li>
                <li>发现潜在投资机会</li>
              </ul>
            </Card>
          </Col>
        </Row>
      </div>

      {/* 快速入口 */}
      <div className={styles.section}>
        <Title level={3} className={styles.sectionTitle}>快速开始</Title>
        <Row gutter={[16, 16]}>
          <Col xs={12} md={6}>
            <Card className={styles.quickCard} hoverable onClick={() => onNavigate('query')}>
              <div className={styles.quickIcon}>🔍</div>
              <Text strong>用户查询</Text>
              <RightOutlined className={styles.quickArrow} />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card className={styles.quickCard} hoverable onClick={() => onNavigate('rankings')}>
              <div className={styles.quickIcon}>📈</div>
              <Text strong>报名榜</Text>
              <RightOutlined className={styles.quickArrow} />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card className={styles.quickCard} hoverable onClick={() => onNavigate('rankings')}>
              <div className={styles.quickIcon}>📊</div>
              <Text strong>参会榜</Text>
              <RightOutlined className={styles.quickArrow} />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card className={styles.quickCard} hoverable onClick={() => onNavigate('rankings')}>
              <div className={styles.quickIcon}>🏆</div>
              <Text strong>热门公司</Text>
              <RightOutlined className={styles.quickArrow} />
            </Card>
          </Col>
        </Row>
      </div>

      {/* 数据概览 */}
      <div className={styles.section}>
        <Card className={styles.statsCard}>
          <Title level={4} className={styles.statsTitle}>平台数据概览</Title>
          <Row gutter={[24, 24]}>
            <Col xs={12} md={6}>
              <div className={styles.statItem}>
                <div className={styles.statValue}>52,000+</div>
                <Text type="secondary">覆盖公司</Text>
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className={styles.statItem}>
                <div className={styles.statValue}>2,100+</div>
                <Text type="secondary">有数据公司</Text>
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className={styles.statItem}>
                <div className={styles.statValue}>2023.1</div>
                <Text type="secondary">数据起始</Text>
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className={styles.statItem}>
                <div className={styles.statValue}>每日2次</div>
                <Text type="secondary">自动同步</Text>
              </div>
            </Col>
          </Row>
        </Card>
      </div>

      {/* 使用说明 */}
      <div className={styles.section}>
        <Card className={styles.guideCard} title={<><FileTextOutlined /> 使用说明</>}>
          <Row gutter={[32, 24]}>
            <Col xs={24} md={8}>
              <div className={styles.guideSection}>
                <Title level={5}><SearchOutlined /> 用户查询</Title>
                <ul className={styles.guideList}>
                  <li>选择目标公司（支持按行业筛选）</li>
                  <li>设置互动时间范围</li>
                  <li>查询与该公司互动过的用户名单</li>
                  <li>支持多维度筛选：认证类型、机构类型等</li>
                  <li>支持排除近期已报名用户，避免重复邀约</li>
                  <li>导出Excel或复制UID用于后续跟进</li>
                </ul>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className={styles.guideSection}>
                <Title level={5}><BarChartOutlined /> 路演榜单</Title>
                <ul className={styles.guideList}>
                  <li>报名榜：查看路演报名效果排行</li>
                  <li>参会榜：查看路演参会效果排行</li>
                  <li>热门公司榜：查看公司转化效果排行</li>
                  <li>支持多种时间范围筛选</li>
                  <li>支持多维度排序切换</li>
                  <li>点击标题跳转路演/公司详情</li>
                </ul>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className={styles.guideSection}>
                <Title level={5}><SyncOutlined /> 数据更新</Title>
                <ul className={styles.guideList}>
                  <li>数据每天自动同步2次（凌晨1点、下午8点）</li>
                  <li>数据范围：2023年1月至今</li>
                  <li>覆盖52,000+家公司，2,100+家有数据公司</li>
                  <li>榜单数据实时计算，支持动态排序</li>
                </ul>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
}
