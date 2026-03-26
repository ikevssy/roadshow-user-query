import { Checkbox, Radio, DatePicker, Typography, Button, Collapse, Drawer, FloatButton, Space } from 'antd';
import { ClearOutlined, FilterOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppStore } from '../../store';
import styles from './index.module.css';

const { Text } = Typography;
const { Panel } = Collapse;

const CERT_TYPE_OPTIONS = [
  { label: '机构投资者', value: '机构投资者' },
  { label: '卖方分析师', value: '卖方分析师' },
  { label: '上市公司', value: '上市公司' },
  { label: '服务机构', value: '服务机构' },
  { label: '金融机构', value: '金融机构' },
  { label: '媒体', value: '媒体' },
  { label: '个人', value: '个人' },
];

interface FilterPanelProps {
  isMobile?: boolean;
}

export function FilterPanel({ isMobile }: FilterPanelProps = {}) {
  const { filters, setFilters, resetFilters, allUsers, filterCollapsed } = useAppStore();
  
  // 获取当前数据中实际存在的机构类型
  const availableOrgTypes = [...new Set(allUsers.map((u) => u.org_type).filter(Boolean))];
  
  // 处理日期选择
  const handleInteractionDateChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      setFilters({ 
        interactionDateRange: [dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')] 
      });
    } else {
      setFilters({ interactionDateRange: null });
    }
  };
  
  const handleApplyDateChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      setFilters({ 
        applyDateRange: [dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')] 
      });
    } else {
      setFilters({ applyDateRange: null });
    }
  };
  
  const handleAttendDateChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      setFilters({ 
        attendDateRange: [dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')] 
      });
    } else {
      setFilters({ attendDateRange: null });
    }
  };
  
  // 转换日期字符串为dayjs对象
  const interactionDates = filters.interactionDateRange 
    ? [dayjs(filters.interactionDateRange[0]), dayjs(filters.interactionDateRange[1])] 
    : null;
    
  const applyDates = filters.applyDateRange 
    ? [dayjs(filters.applyDateRange[0]), dayjs(filters.applyDateRange[1])] 
    : null;
    
  const attendDates = filters.attendDateRange 
    ? [dayjs(filters.attendDateRange[0]), dayjs(filters.attendDateRange[1])] 
    : null;
  
  // 计算已选数量
  const getSelectedCount = () => {
    let count = 0;
    if (filters.certTypes.length > 0) count++;
    if (filters.orgTypes.length > 0) count++;
    if (filters.interactionDateRange) count++;
    if (filters.applyDateRange) count++;
    if (filters.attendDateRange) count++;
    if (filters.isFirstAttend !== null) count++;
    return count;
  };
  
  const selectedCount = getSelectedCount();
  
  const filterContent = (
    <div className={styles.filterContent}>
      <div className={styles.header}>
        <Text strong>筛选条件</Text>
        {selectedCount > 0 && (
          <Button 
            type="link" 
            icon={<ClearOutlined />} 
            onClick={resetFilters}
            size="small"
          >
            重置 ({selectedCount})
          </Button>
        )}
        {isMobile && (
          <Button 
            type="text" 
            icon={<CloseOutlined />} 
            onClick={() => useAppStore.getState().setFilterCollapsed(true)}
            size="small"
          />
        )}
      </div>
      
      <Collapse 
        defaultActiveKey={['cert', 'org', 'time']} 
        ghost
        size="small"
      >
        <Panel header="认证类型" key="cert">
          <Checkbox.Group
            options={CERT_TYPE_OPTIONS}
            value={filters.certTypes}
            onChange={(values) => setFilters({ certTypes: values as string[] })}
            className={styles.checkboxGroup}
          />
        </Panel>
        
        <Panel header="机构类型" key="org">
          <Checkbox.Group
            value={filters.orgTypes}
            onChange={(values) => setFilters({ orgTypes: values as string[] })}
            className={styles.checkboxGroup}
          >
            {availableOrgTypes.map((type) => (
              <Checkbox key={type} value={type}>{type}</Checkbox>
            ))}
          </Checkbox.Group>
        </Panel>
        
        <Panel header="最近互动时间" key="interaction">
          <DatePicker.RangePicker
            value={interactionDates as any}
            onChange={handleInteractionDateChange}
            format="YYYY-MM-DD"
            placeholder={['开始日期', '结束日期']}
            style={{ width: '100%' }}
            size="small"
            allowClear
          />
        </Panel>
        
        <Panel header="最新报名时间" key="apply">
          <DatePicker.RangePicker
            value={applyDates as any}
            onChange={handleApplyDateChange}
            format="YYYY-MM-DD"
            placeholder={['开始日期', '结束日期']}
            style={{ width: '100%' }}
            size="small"
            allowClear
          />
        </Panel>
        
        <Panel header="最新参会时间" key="attend">
          <DatePicker.RangePicker
            value={attendDates as any}
            onChange={handleAttendDateChange}
            format="YYYY-MM-DD"
            placeholder={['开始日期', '结束日期']}
            style={{ width: '100%' }}
            size="small"
            allowClear
          />
        </Panel>
        
        <Panel header="是否首次参会" key="first">
          <Radio.Group
            optionType="button"
            buttonStyle="solid"
            size="small"
            value={filters.isFirstAttend}
            onChange={(e) => setFilters({ isFirstAttend: e.target.value })}
          >
            <Radio.Button value={null}>全部</Radio.Button>
            <Radio.Button value={true}>是</Radio.Button>
            <Radio.Button value={false}>否</Radio.Button>
          </Radio.Group>
        </Panel>
      </Collapse>
    </div>
  );
  
  // 移动端使用底部抽屉
  if (isMobile) {
    return (
      <>
        <FloatButton
          icon={<FilterOutlined />}
          onClick={() => useAppStore.getState().setFilterCollapsed(false)}
          badge={{ count: selectedCount }}
          style={{ right: 24, bottom: 80 }}
        />
        <Drawer
          title="筛选条件"
          placement="bottom"
          open={!filterCollapsed}
          onClose={() => useAppStore.getState().setFilterCollapsed(true)}
          height="70vh"
          footer={
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Button 
                icon={<ClearOutlined />} 
                onClick={resetFilters}
              >
                重置
              </Button>
              <Button 
                type="primary" 
                icon={<CheckOutlined />} 
                onClick={() => useAppStore.getState().setFilterCollapsed(true)}
              >
                确认
              </Button>
            </Space>
          }
        >
          {filterContent}
        </Drawer>
      </>
    );
  }
  
  // 桌面端使用侧边栏
  return (
    <div className={styles.container}>
      {filterContent}
    </div>
  );
}
