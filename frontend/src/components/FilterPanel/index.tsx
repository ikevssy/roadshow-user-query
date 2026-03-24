import { Checkbox, Radio, DatePicker, Divider, Typography, Button } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppStore } from '../../store';
import styles from './index.module.css';

const { Text, Title } = Typography;

const CERT_TYPE_OPTIONS = [
  { label: '机构投资者', value: '机构投资者' },
  { label: '卖方分析师', value: '卖方分析师' },
  { label: '上市公司', value: '上市公司' },
  { label: '服务机构', value: '服务机构' },
  { label: '金融机构', value: '金融机构' },
  { label: '媒体', value: '媒体' },
  { label: '个人', value: '个人' },
];

export function FilterPanel() {
  const { filters, setFilters, resetFilters, allUsers } = useAppStore();
  
  // 获取当前数据中实际存在的机构类型
  const availableOrgTypes = [...new Set(allUsers.map((u) => u.org_type).filter(Boolean))];
  
  // 处理日期选择
  const handleInteractionDateChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      setFilters({ 
        interactionDateRange: [
          dates[0].format('YYYY-MM-DD'), 
          dates[1].format('YYYY-MM-DD')
        ] 
      });
    } else {
      setFilters({ interactionDateRange: null });
    }
  };
  
  const handleApplyDateChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      setFilters({ 
        applyDateRange: [
          dates[0].format('YYYY-MM-DD'), 
          dates[1].format('YYYY-MM-DD')
        ] 
      });
    } else {
      setFilters({ applyDateRange: null });
    }
  };
  
  const handleAttendDateChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      setFilters({ 
        attendDateRange: [
          dates[0].format('YYYY-MM-DD'), 
          dates[1].format('YYYY-MM-DD')
        ] 
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
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={5} style={{ margin: 0 }}>筛选条件</Title>
        <Button 
          type="link" 
          icon={<ClearOutlined />} 
          onClick={resetFilters}
          size="small"
        >
          重置
        </Button>
      </div>
      
      <Divider style={{ margin: '12px 0' }} />
      
      {/* 认证类型 */}
      <div className={styles.section}>
        <Text strong className={styles.label}>认证类型</Text>
        <Checkbox.Group
          options={CERT_TYPE_OPTIONS}
          value={filters.certTypes}
          onChange={(values) => setFilters({ certTypes: values as string[] })}
          className={styles.checkboxGroup}
        />
      </div>
      
      {/* 机构类型 */}
      <div className={styles.section}>
        <Text strong className={styles.label}>机构类型</Text>
        <Checkbox.Group
          value={filters.orgTypes}
          onChange={(values) => setFilters({ orgTypes: values as string[] })}
          className={styles.checkboxGroup}
        >
          {availableOrgTypes.map((type) => (
            <Checkbox key={type} value={type}>{type}</Checkbox>
          ))}
        </Checkbox.Group>
      </div>
      
      {/* 最近互动时间 - 日期选择器 */}
      <div className={styles.section}>
        <Text strong className={styles.label}>最近互动时间</Text>
        <DatePicker.RangePicker
          value={interactionDates as any}
          onChange={handleInteractionDateChange}
          format="YYYY-MM-DD"
          placeholder={['开始日期', '结束日期']}
          style={{ width: '100%' }}
          size="small"
          allowClear
        />
      </div>
      
      {/* 最新报名时间 - 日期选择器 */}
      <div className={styles.section}>
        <Text strong className={styles.label}>最新报名时间</Text>
        <DatePicker.RangePicker
          value={applyDates as any}
          onChange={handleApplyDateChange}
          format="YYYY-MM-DD"
          placeholder={['开始日期', '结束日期']}
          style={{ width: '100%' }}
          size="small"
          allowClear
        />
      </div>
      
      {/* 最新参会时间 - 日期选择器 */}
      <div className={styles.section}>
        <Text strong className={styles.label}>最新参会时间</Text>
        <DatePicker.RangePicker
          value={attendDates as any}
          onChange={handleAttendDateChange}
          format="YYYY-MM-DD"
          placeholder={['开始日期', '结束日期']}
          style={{ width: '100%' }}
          size="small"
          allowClear
        />
      </div>
      
      {/* 是否首次参会 */}
      <div className={styles.section}>
        <Text strong className={styles.label}>是否首次参会</Text>
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
      </div>
    </div>
  );
}
