import { Card, Typography, Row, Col } from 'antd';
import { 
  SearchOutlined, 
  BarChartOutlined, 
  ExportOutlined,
  SyncOutlined,
  FileTextOutlined 
} from '@ant-design/icons';
import styles from './HomePage.module.css';

const { Title, Paragraph, Text } = Typography;

export function HomePage() {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <Title level={2} className={styles.heroTitle}>
          RSC 路演互动邀约用户查询系统
        </Title>
        <Text className={styles.heroDesc}>
          一站式路演数据分析与用户邀约管理平台
        </Text>
      </div>

      {/* Features */}
      <Row gutter={[24, 24]} className={styles.features}>
        <Col xs={24} md={8}>
          <Card className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <SearchOutlined />
            </div>
            <Title level={4}>精准查询</Title>
            <Paragraph type="secondary">
              支持按公司、行业、时间范围精准查询互动用户，多维度筛选，快速定位目标用户
            </Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <BarChartOutlined />
            </div>
            <Title level={4}>数据可视化</Title>
            <Paragraph type="secondary">
              路演榜单多维度展示，支持排序和筛选，快速了解路演效果和公司转化情况
            </Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <ExportOutlined />
            </div>
            <Title level={4}>数据导出</Title>
            <Paragraph type="secondary">
              支持导出Excel和复制UID，方便后续跟进和数据分析
            </Paragraph>
          </Card>
        </Col>
      </Row>

      {/* Usage Guide */}
      <Card className={styles.guideCard} title={<><FileTextOutlined /> 使用说明</>}>
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

        <div className={styles.guideSection}>
          <Title level={5}><BarChartOutlined /> 路演榜单</Title>
          <ul className={styles.guideList}>
            <li>查看近7天路演报名分析排行榜</li>
            <li>查看近7天路演参会效果分析排行榜</li>
            <li>查看近15天公司路演转化效果分析排行榜</li>
            <li>支持自定义时间范围（最多60天）</li>
            <li>点击表头切换排序方式</li>
            <li>点击路演标题查看详细信息</li>
            <li>快速跳转路演详情或公司详情页面</li>
          </ul>
        </div>

        <div className={styles.guideSection}>
          <Title level={5}><SyncOutlined /> 数据更新</Title>
          <ul className={styles.guideList}>
            <li>数据每天自动同步2次（凌晨1点、下午8点）</li>
            <li>数据范围：2023年1月至今</li>
            <li>覆盖52,000+家公司，2,100+家有数据公司</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
