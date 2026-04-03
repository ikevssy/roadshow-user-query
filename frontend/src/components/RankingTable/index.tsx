import { Table, Typography, Space, Button, Tag, Empty } from 'antd';
import { LinkOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { RankingApply, RankingEffect, RankingConversion, RankingTab } from '../../types/rankings';
import styles from './index.module.css';

const { Text } = Typography;

interface RankingTableProps {
  tab: RankingTab;
  data: (RankingApply | RankingEffect | RankingConversion)[];
  loading: boolean;
  onMeetClick: (record: RankingApply | RankingEffect | RankingConversion) => void;
  onCompanyClick: (record: RankingApply | RankingEffect | RankingConversion) => void;
}

export function RankingTable({ tab, data, loading, onMeetClick, onCompanyClick }: RankingTableProps) {
  // 榜单1：报名分析列
  const applyColumns: ColumnsType<RankingApply> = [
    {
      title: '排名',
      key: 'rank',
      width: 60,
      render: (_, __, index) => (
        <Tag color={index < 3 ? 'gold' : 'default'} style={{ width: 30, textAlign: 'center' }}>
          {index + 1}
        </Tag>
      ),
    },
    {
      title: '路演标题',
      dataIndex: 'meet_title',
      key: 'meet_title',
      ellipsis: true,
      render: (text, record) => (
        <a onClick={() => onMeetClick(record)} className={styles.link}>
          {text}
        </a>
      ),
    },
    {
      title: '公司',
      dataIndex: 'cn_short_name',
      key: 'cn_short_name',
      width: 120,
      render: (text, record) => (
        <a onClick={() => onCompanyClick(record)} className={styles.link}>
          {text}
        </a>
      ),
    },
    {
      title: '股票代码',
      dataIndex: 'stock_codes',
      key: 'stock_codes',
      width: 100,
      render: (text) => <Text type="secondary" style={{ fontSize: 12 }}>{text || '-'}</Text>,
    },
    {
      title: '浏览数',
      dataIndex: 'click_count',
      key: 'click_count',
      width: 80,
      sorter: (a, b) => (a.click_count || 0) - (b.click_count || 0),
      render: (val) => val ?? '-',
    },
    {
      title: '预约报名',
      dataIndex: 'pre_apply_times',
      key: 'pre_apply_times',
      width: 80,
      render: (val) => val ?? '-',
    },
    {
      title: '报名率%',
      dataIndex: 'apply_rate',
      key: 'apply_rate',
      width: 90,
      sorter: (a, b) => (a.apply_rate || 0) - (b.apply_rate || 0),
      defaultSortOrder: 'descend',
      render: (val) => val != null ? `${val}%` : '-',
    },
    {
      title: '直播参与',
      dataIndex: 'live_join_count',
      key: 'live_join_count',
      width: 80,
      render: (val) => val ?? '-',
    },
    {
      title: '参会率%',
      dataIndex: 'attend_rate',
      key: 'attend_rate',
      width: 90,
      sorter: (a, b) => (a.attend_rate || 0) - (b.attend_rate || 0),
      render: (val) => val != null ? `${val}%` : '-',
    },
    {
      title: '人均时长',
      dataIndex: 'avg_watch_minutes',
      key: 'avg_watch_minutes',
      width: 90,
      render: (val) => val != null ? `${val}分钟` : '-',
    },
    {
      title: '提问数',
      dataIndex: 'qa_count',
      key: 'qa_count',
      width: 70,
      render: (val) => val ?? '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right' as const,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<LinkOutlined />}
            href={`https://www.roadshowchina.cn/wap/m/meet/detail?mid=${record.mid}`}
            target="_blank"
          >
            路演详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            href={`https://m.roadshowchina.cn/wap/s/company/index?oid=${record.oid}`}
            target="_blank"
          >
            公司
          </Button>
        </Space>
      ),
    },
  ];

  // 榜单2：参会效果列
  const effectColumns: ColumnsType<RankingEffect> = [
    {
      title: '排名',
      key: 'rank',
      width: 60,
      render: (_, __, index) => (
        <Tag color={index < 3 ? 'gold' : 'default'} style={{ width: 30, textAlign: 'center' }}>
          {index + 1}
        </Tag>
      ),
    },
    {
      title: '路演标题',
      dataIndex: 'meet_title',
      key: 'meet_title',
      ellipsis: true,
      render: (text, record) => (
        <a onClick={() => onMeetClick(record)} className={styles.link}>
          {text}
        </a>
      ),
    },
    {
      title: '公司',
      dataIndex: 'cn_short_name',
      key: 'cn_short_name',
      width: 120,
      render: (text, record) => (
        <a onClick={() => onCompanyClick(record)} className={styles.link}>
          {text}
        </a>
      ),
    },
    {
      title: '股票代码',
      dataIndex: 'stock_codes',
      key: 'stock_codes',
      width: 100,
      render: (text) => <Text type="secondary" style={{ fontSize: 12 }}>{text || '-'}</Text>,
    },
    {
      title: '参会时长',
      dataIndex: 'total_watch_minutes',
      key: 'total_watch_minutes',
      width: 110,
      sorter: (a, b) => (a.total_watch_minutes || 0) - (b.total_watch_minutes || 0),
      defaultSortOrder: 'descend',
      render: (val) => val != null ? `${val}分钟` : '-',
    },
    {
      title: '总参与人次',
      dataIndex: 'total_join_count',
      key: 'total_join_count',
      width: 100,
      sorter: (a, b) => (a.total_join_count || 0) - (b.total_join_count || 0),
      render: (val) => val ?? '-',
    },
    {
      title: '人均时长',
      dataIndex: 'avg_watch_minutes',
      key: 'avg_watch_minutes',
      width: 90,
      render: (val) => val != null ? `${val}分钟` : '-',
    },
    {
      title: '直播参与',
      dataIndex: 'live_join_count',
      key: 'live_join_count',
      width: 90,
      sorter: (a, b) => (a.live_join_count || 0) - (b.live_join_count || 0),
      render: (val) => val ?? '-',
    },
    {
      title: '回看参与',
      dataIndex: 'replay_join_count',
      key: 'replay_join_count',
      width: 90,
      sorter: (a, b) => (a.replay_join_count || 0) - (b.replay_join_count || 0),
      render: (val) => val ?? '-',
    },
    {
      title: '回看提醒',
      dataIndex: 'remind_user_count',
      key: 'remind_user_count',
      width: 90,
      sorter: (a, b) => (a.remind_user_count || 0) - (b.remind_user_count || 0),
      render: (val) => val ?? '-',
    },
    {
      title: '预约报名',
      dataIndex: 'pre_apply_times',
      key: 'pre_apply_times',
      width: 90,
      render: (val) => val ?? '-',
    },
    {
      title: '提问数',
      dataIndex: 'qa_count',
      key: 'qa_count',
      width: 70,
      render: (val) => val ?? '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right' as const,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<LinkOutlined />}
            href={`https://www.roadshowchina.cn/wap/m/meet/detail?mid=${record.mid}`}
            target="_blank"
          >
            路演详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            href={`https://m.roadshowchina.cn/wap/s/company/index?oid=${record.oid}`}
            target="_blank"
          >
            公司
          </Button>
        </Space>
      ),
    },
  ];

  // 榜单3：转化效果列
  const conversionColumns: ColumnsType<RankingConversion> = [
    {
      title: '排名',
      key: 'rank',
      width: 60,
      render: (_, __, index) => (
        <Tag color={index < 3 ? 'gold' : 'default'} style={{ width: 30, textAlign: 'center' }}>
          {index + 1}
        </Tag>
      ),
    },
    {
      title: '公司',
      dataIndex: 'cn_short_name',
      key: 'cn_short_name',
      width: 140,
      render: (text, record) => (
        <a onClick={() => onCompanyClick(record)} className={styles.link}>
          {text}
        </a>
      ),
    },
    {
      title: '股票代码',
      dataIndex: 'stock_codes',
      key: 'stock_codes',
      width: 100,
      render: (text) => <Text type="secondary" style={{ fontSize: 12 }}>{text || '-'}</Text>,
    },
    {
      title: '参会时长',
      dataIndex: 'total_watch_minutes',
      key: 'total_watch_minutes',
      width: 110,
      sorter: (a, b) => (a.total_watch_minutes || 0) - (b.total_watch_minutes || 0),
      render: (val) => val != null ? `${val}分钟` : '-',
    },
    {
      title: '参与人次',
      dataIndex: 'total_join_count',
      key: 'total_join_count',
      width: 100,
      sorter: (a, b) => (a.total_join_count || 0) - (b.total_join_count || 0),
      render: (val) => val ?? '-',
    },
    {
      title: '人均时长',
      dataIndex: 'avg_watch_minutes',
      key: 'avg_watch_minutes',
      width: 90,
      render: (val) => val != null ? `${val}分钟` : '-',
    },
    {
      title: '直播参与',
      dataIndex: 'live_join_count',
      key: 'live_join_count',
      width: 90,
      render: (val) => val ?? '-',
    },
    {
      title: '回看参与',
      dataIndex: 'replay_join_count',
      key: 'replay_join_count',
      width: 90,
      render: (val) => val ?? '-',
    },
    {
      title: '提问数',
      dataIndex: 'qa_count',
      key: 'qa_count',
      width: 70,
      render: (val) => val ?? '-',
    },
    {
      title: '新增订阅',
      dataIndex: 'sub_user_count',
      key: 'sub_user_count',
      width: 90,
      sorter: (a, b) => (a.sub_user_count || 0) - (b.sub_user_count || 0),
      defaultSortOrder: 'descend',
      render: (val) => val ?? '-',
    },
    {
      title: '取关',
      dataIndex: 'unsub_user_count',
      key: 'unsub_user_count',
      width: 70,
      sorter: (a, b) => (a.unsub_user_count || 0) - (b.unsub_user_count || 0),
      render: (val) => val ?? '-',
    },
    {
      title: '特别关注',
      dataIndex: 'special_focus_user_count',
      key: 'special_focus_user_count',
      width: 90,
      render: (val) => val ?? '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right' as const,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          href={`https://m.roadshowchina.cn/wap/s/company/index?oid=${record.oid}`}
          target="_blank"
        >
          公司详情
        </Button>
      ),
    },
  ];

  const getColumns = () => {
    switch (tab) {
      case 'apply':
        return applyColumns;
      case 'effect':
        return effectColumns;
      case 'conversion':
        return conversionColumns;
      default:
        return [];
    }
  };

  if (data.length === 0 && !loading) {
    return (
      <div className={styles.empty}>
        <Empty description="暂无数据" />
      </div>
    );
  }

  return (
    <Table
      columns={getColumns() as any}
      dataSource={data}
      rowKey={(record) => ('mid' in record ? `mid-${record.mid}` : `oid-${record.oid}`)}
      loading={loading}
      scroll={{ x: 1200 }}
      pagination={false}
      size="small"
      className={styles.table}
    />
  );
}
