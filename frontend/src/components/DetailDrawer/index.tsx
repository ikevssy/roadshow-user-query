import { Drawer, Descriptions, Tag, Typography, Divider, Timeline, Empty } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import type { UserInteraction } from '../../types';
import styles from './index.module.css';

const { Text, Title } = Typography;

interface DetailDrawerProps {
  user: UserInteraction | null;
  open: boolean;
  onClose: () => void;
}

export function DetailDrawer({ user, open, onClose }: DetailDrawerProps) {
  if (!user) return null;
  
  return (
    <Drawer
      title="用户详情"
      placement="right"
      width={520}
      open={open}
      onClose={onClose}
      destroyOnClose
    >
      <div className={styles.content}>
        {/* 基本信息 */}
        <Descriptions title="基本信息" column={1} bordered size="small">
          <Descriptions.Item label="UID">{user.uid}</Descriptions.Item>
          <Descriptions.Item label="姓名">{user.name}</Descriptions.Item>
          <Descriptions.Item label="机构">{user.org_name}</Descriptions.Item>
          <Descriptions.Item label="机构类型">{user.org_type || '-'}</Descriptions.Item>
          <Descriptions.Item label="认证类型">
            <Tag>{user.cert_type}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="职位">{user.position || '-'}</Descriptions.Item>
          <Descriptions.Item label="部门">{user.department || '-'}</Descriptions.Item>
          <Descriptions.Item label="是否首次参会">
            {user.is_first_attend ? (
              <Tag color="green">是</Tag>
            ) : (
              <Tag>否</Tag>
            )}
          </Descriptions.Item>
        </Descriptions>
        
        {/* 报名记录 */}
        <div style={{ marginTop: 24, marginBottom: 8 }}>
          <Title level={5} style={{ margin: 0 }}>
            报名记录 ({user.apply_count}场)
          </Title>
        </div>
        
        {user.apply_records.length > 0 ? (
          <Timeline
            items={user.apply_records.slice(0, 20).map((record) => ({
              dot: <ClockCircleOutlined />,
              children: (
                <div className={styles.timelineItem}>
                  <Text type="secondary">{record.time}</Text>
                  <Text>{record.meet_title}</Text>
                </div>
              ),
            }))}
          />
        ) : (
          <Empty description="暂无报名记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
        
        {/* 参会记录 */}
        <Divider />
        <div style={{ marginBottom: 8 }}>
          <Title level={5} style={{ margin: 0 }}>
            参会记录 ({user.attend_count}场)
          </Title>
        </div>
        
        {user.attend_records.length > 0 ? (
          <Timeline
            items={user.attend_records.slice(0, 20).map((record) => ({
              dot: <ClockCircleOutlined />,
              children: (
                <div className={styles.timelineItem}>
                  <Text type="secondary">{record.time}</Text>
                  <Text>{record.meet_title}</Text>
                  <Tag>{record.duration}分钟</Tag>
                </div>
              ),
            }))}
          />
        ) : (
          <Empty description="暂无参会记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
        
        {/* 订阅公司明细 */}
        <Divider />
        <div style={{ marginBottom: 8 }}>
          <Title level={5} style={{ margin: 0 }}>
            订阅公司明细 ({user.subscribed_companies.length}家)
          </Title>
        </div>
        
        {user.subscribed_companies.length > 0 ? (
          <div className={styles.companyList}>
            {user.subscribed_companies.map((item, index) => (
              <div key={index} className={styles.companyItem}>
                <Text>{item.company}</Text>
                <Text type="secondary">{item.time}</Text>
              </div>
            ))}
          </div>
        ) : (
          <Empty description="未订阅公司" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
        
        {/* 特别关注公司 */}
        <Divider />
        <div style={{ marginBottom: 8 }}>
          <Title level={5} style={{ margin: 0 }}>特别关注公司</Title>
        </div>
        
        {user.special_companies ? (
          <div className={styles.tagList}>
            {user.special_companies.split(',').map((company, index) => (
              <Tag key={index} color="gold">{company.trim()}</Tag>
            ))}
          </div>
        ) : (
          <Empty description="无特别关注" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </div>
    </Drawer>
  );
}
