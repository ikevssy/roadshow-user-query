import { useState, useMemo } from 'react';
import { Table, Input, Button, Tag, Typography, Tooltip, message, Modal, Card, Select, Space } from 'antd';
import { 
  SearchOutlined, 
  DownloadOutlined, 
  ArrowLeftOutlined,
  CopyOutlined,
  FilterOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import type { ColumnsType, TableProps } from 'antd/es/table';
import type { TableRowSelection } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import { useAppStore } from '../../store';
import type { UserInteraction } from '../../types';
import { filterUsers, sortUsers, copyToClipboard } from '../../utils/filter';
import { exportToExcel, exportUids } from '../../utils/export';
import styles from './index.module.css';

const { Text } = Typography;

interface UserTableProps {
  onViewDetail: (user: UserInteraction) => void;
  onBack: () => void;
}

export function UserTable({ onViewDetail, onBack }: UserTableProps) {
  const {
    allUsers,
    filters,
    quickFilter,
    searchText,
    setSearchText,
    setQuickFilter,
    selectedCompanyOids,
    companies,
    loading,
    dateRange,
  } = useAppStore();
  
  const [sortField, setSortField] = useState<string>('last_interaction_time');
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | null>('descend');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  
  // 获取选中的公司列表（用于快速过滤下拉）
  const selectedCompanies = useMemo(() => {
    return selectedCompanyOids
      .map((oid) => companies.find((c) => c.oid === oid))
      .filter(Boolean);
  }, [companies, selectedCompanyOids]);
  
  // 过滤和排序后的数据
  const processedData = useMemo(() => {
    let data = filterUsers(allUsers, filters, quickFilter, searchText, dateRange);
    data = sortUsers(data, sortField, sortOrder);
    return data;
  }, [allUsers, filters, quickFilter, searchText, dateRange, sortField, sortOrder]);
  
  // 返回按钮 - 弹出确认框
  const handleBack = () => {
    Modal.confirm({
      title: '确认返回',
      icon: <ExclamationCircleOutlined />,
      content: '返回后当前筛选条件将被重置，确认继续？',
      okText: '确认返回',
      cancelText: '取消',
      onOk: () => onBack(),
    });
  };
  
  // 处理表格变化（排序）
  const handleTableChange: TableProps<UserInteraction>['onChange'] = (_, __, sorter) => {
    if (sorter && !Array.isArray(sorter)) {
      setSortField(sorter.field as string);
      setSortOrder(sorter.order ?? null);
    }
  };
  
  // 导出Excel
  const handleExport = () => {
    exportToExcel(processedData);
    messageApi.success(`已导出 ${processedData.length} 条数据`);
  };
  
  // 复制UID
  const handleCopyUids = async () => {
    const uids = exportUids(processedData);
    const success = await copyToClipboard(uids);
    if (success) {
      messageApi.success(`已复制 ${processedData.length} 个UID`);
    } else {
      messageApi.error('复制失败');
    }
  };
  
  // 复制单个UID
  const handleCopySingleUid = async (uid: string) => {
    const success = await copyToClipboard(uid);
    if (success) {
      messageApi.success('UID已复制');
    }
  };
  
  // 复制选中的UID
  const handleCopySelectedUids = async () => {
    if (selectedRowKeys.length === 0) {
      messageApi.warning('请先选择要复制的记录');
      return;
    }
    const uids = selectedRowKeys.join('\n');
    const success = await copyToClipboard(uids);
    if (success) {
      messageApi.success(`已复制 ${selectedRowKeys.length} 个UID`);
    } else {
      messageApi.error('复制失败');
    }
  };
  
  // 导出选中的数据
  const handleExportSelected = () => {
    if (selectedRowKeys.length === 0) {
      messageApi.warning('请先选择要导出的记录');
      return;
    }
    const selectedUsers = processedData.filter(u => selectedRowKeys.includes(u.uid));
    exportToExcel(selectedUsers);
    messageApi.success(`已导出 ${selectedUsers.length} 条数据`);
  };
  
  // 清空选择
  const handleClearSelection = () => {
    setSelectedRowKeys([]);
  };
  
  // 行选择配置
  const rowSelection: TableRowSelection<UserInteraction> = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
  };
  
  // 表格列定义
  const columns: ColumnsType<UserInteraction> = [
    {
      title: 'UID',
      dataIndex: 'uid',
      key: 'uid',
      width: 100,
      fixed: 'left' as const,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="搜索UID"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 120, marginBottom: 8, display: 'block' }}
          />
        </div>
      ),
      filterIcon: () => <SearchOutlined />,
      onFilter: (value, record) => record.uid.toLowerCase().includes(String(value).toLowerCase()),
      render: (uid, record) => (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Tooltip title="点击查看详情">
            <a onClick={() => onViewDetail(record)} className={styles.uidLink}>
              {uid}
            </a>
          </Tooltip>
          <Tooltip title="复制UID">
            <CopyOutlined 
              onClick={(e) => { e.stopPropagation(); handleCopySingleUid(uid); }} 
              style={{ fontSize: 12, color: '#999', cursor: 'pointer' }}
            />
          </Tooltip>
        </div>
      ),
    },
    {
      title: '姓名',
      key: 'name',
      width: 150,
      sorter: true,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="搜索姓名"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 120, marginBottom: 8, display: 'block' }}
          />
        </div>
      ),
      filterIcon: () => <SearchOutlined />,
      onFilter: (value, record) => 
        record.name.toLowerCase().includes(String(value).toLowerCase()) ||
        record.org_name.toLowerCase().includes(String(value).toLowerCase()),
      render: (_, record) => (
        <div className={styles.nameCell}>
          <Text strong>{record.name}</Text>
          <Text type="secondary" className={styles.subText}>{record.org_name}</Text>
        </div>
      ),
    },
    {
      title: '机构类型',
      dataIndex: 'org_type',
      key: 'org_type',
      width: 120,
      filters: [...new Set(allUsers.map((u) => u.org_type).filter(Boolean))].map(
        (type) => ({ text: type, value: type })
      ),
      onFilter: (value, record) => record.org_type === value,
    },
    {
      title: '职位',
      key: 'position',
      width: 140,
      render: (_, record) => (
        <div className={styles.nameCell}>
          <Text>{record.position || '-'}</Text>
          <Text type="secondary" className={styles.subText}>{record.department || '-'}</Text>
        </div>
      ),
    },
    {
      title: '最近互动时间',
      dataIndex: 'last_interaction_time',
      key: 'last_interaction_time',
      width: 160,
      sorter: true,
      defaultSortOrder: 'descend' as const,
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '互动对象',
      key: 'interaction',
      width: 130,
      render: (_, record) => (
        <div className={styles.nameCell}>
          <Tag color={
            record.last_interaction_behavior === '报名' ? 'blue' :
            record.last_interaction_behavior === '参会' ? 'green' :
            record.last_interaction_behavior === '订阅' ? 'orange' :
            record.last_interaction_behavior === '特关' ? 'gold' :
            'default'
          }>
            {record.last_interaction_behavior}
          </Tag>
          <Text type="secondary" className={styles.subText} ellipsis>
            {record.interaction_company}
          </Text>
        </div>
      ),
    },
    {
      title: '报名',
      dataIndex: 'apply_count',
      key: 'apply_count',
      width: 60,
      sorter: true,
      align: 'center' as const,
    },
    {
      title: '参会',
      dataIndex: 'attend_count',
      key: 'attend_count',
      width: 60,
      sorter: true,
      align: 'center' as const,
    },
    {
      title: '订阅公司',
      key: 'subscribed_companies',
      width: 180,
      ellipsis: { showTitle: false },
      render: (_, record) => {
        if (record.subscribed_companies.length === 0) {
          return <Text type="secondary">未订阅</Text>;
        }
        const companyNames = record.subscribed_companies.map((s) => s.company).join(', ');
        return (
          <Tooltip title={companyNames}>
            <Text ellipsis>{companyNames}</Text>
          </Tooltip>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right' as const,
      render: (_, record) => (
        <a onClick={() => onViewDetail(record)}>详情</a>
      ),
    },
  ];
  
  // 计算过滤后的排除数量
  const excludedCount = quickFilter.companyOid 
    ? allUsers.filter(u => {
        const cutoff = dayjs().subtract(quickFilter.days, 'day');
        return u.apply_records.some(r => dayjs(r.time).isAfter(cutoff));
      }).length
    : 0;
  
  return (
    <div className={styles.container}>
      {contextHolder}
      
      {/* 返回按钮 - 放在最上方，带背景 */}
      <div className={styles.toolbarLeft}>
        <button 
          className={styles.backBtn}
          onClick={handleBack}
        >
          <ArrowLeftOutlined />
          <span>返回查询</span>
        </button>
        <Text type="secondary">
          共 <Text strong>{processedData.length}</Text> 条记录
          {excludedCount > 0 && (
            <>，已排除 <Text strong type="warning">{excludedCount}</Text> 条</>
          )}
        </Text>
      </div>
      
      {/* 过滤功能 - 突出显示 */}
      <Card className={styles.filterCard} size="small">
        <div className={styles.filterHeader}>
          <FilterOutlined />
          <Text strong style={{ color: '#d46b08' }}>排除已报名用户（避免重复邀约）</Text>
        </div>
        <div className={styles.filterContent}>
          <Text className={styles.filterLabel}>排除近</Text>
          <Select
            value={quickFilter.days}
            onChange={(value) => setQuickFilter({ days: value })}
            size="small"
            style={{ width: 80 }}
          >
            <Select.Option value={3}>3天</Select.Option>
            <Select.Option value={7}>7天</Select.Option>
            <Select.Option value={15}>15天</Select.Option>
            <Select.Option value={30}>30天</Select.Option>
          </Select>
          <Text className={styles.filterLabel}>已报名</Text>
          <Select
            value={quickFilter.companyOid}
            onChange={(value) => setQuickFilter({ companyOid: value })}
            size="small"
            style={{ width: 150 }}
            placeholder="选择公司"
            allowClear
          >
            {selectedCompanies.map((c) => (
              <Select.Option key={c!.oid} value={c!.oid}>{c!.cn_short_name}</Select.Option>
            ))}
          </Select>
          <Text className={styles.filterLabel}>路演的用户</Text>
        </div>
      </Card>
      
      {/* 顶部工具栏 */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarRight}>
          <Input
            placeholder="搜索UID、姓名、机构..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: 220 }}
          />
          
          {selectedRowKeys.length > 0 ? (
            <Space>
              <Text type="secondary">已选 <Text strong>{selectedRowKeys.length}</Text> 条</Text>
              <Button icon={<CopyOutlined />} onClick={handleCopySelectedUids}>
                复制选中UID
              </Button>
              <Button icon={<DownloadOutlined />} onClick={handleExportSelected}>
                导出选中
              </Button>
              <Button icon={<DeleteOutlined />} onClick={handleClearSelection}>
                清空选择
              </Button>
            </Space>
          ) : (
            <Space>
              <Button icon={<CopyOutlined />} onClick={handleCopyUids}>
                复制全部UID
              </Button>
              <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
                导出全部
              </Button>
            </Space>
          )}
        </div>
      </div>
      
      {/* 数据表格 */}
      <div className={styles.tableWrapper}>
        <Table<UserInteraction>
          rowSelection={rowSelection}
          columns={columns}
          dataSource={processedData}
          rowKey="uid"
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: 1200, y: 'calc(100vh - 420px)' }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            pageSizeOptions: ['50', '100', '200', '500'],
            defaultPageSize: 50,
          }}
          size="small"
          sticky
        />
      </div>
    </div>
  );
}
