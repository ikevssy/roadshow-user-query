import { useState, useEffect } from 'react';
import { DatePicker, Button, Typography } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useAppStore } from '../../store';
import { TIME_PRESETS } from '../../types';
import styles from './index.module.css';

const { Text } = Typography;
const { RangePicker } = DatePicker;

export function TimeRangePicker() {
  const { setDateRange } = useAppStore();
  const [dates, setDates] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const [activePreset, setActivePreset] = useState<number | null>(365);
  
  // 初始化默认时间范围（最近1年）
  useEffect(() => {
    handlePreset(365);
  }, []);
  
  // 处理预设选择
  const handlePreset = (days: number) => {
    const end = dayjs();
    const start = end.subtract(days, 'day');
    setDates([start, end]);
    setDateRange([start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD')]);
    setActivePreset(days);
  };
  
  // 处理自定义日期选择
  const handleDateChange = (values: [Dayjs | null, Dayjs | null] | null) => {
    if (values && values[0] && values[1]) {
      setDates(values);
      setDateRange([values[0].format('YYYY-MM-DD'), values[1].format('YYYY-MM-DD')]);
      setActivePreset(null);
    } else {
      setDates([null, null]);
      setDateRange(null);
      setActivePreset(null);
    }
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Text strong>互动时间范围</Text>
      </div>
      
      <RangePicker
        className={styles.picker}
        value={dates}
        onChange={handleDateChange}
        format="YYYY-MM-DD"
        allowClear={false}
        placeholder={['开始日期', '结束日期']}
      />
      
      <div className={styles.presets}>
        {TIME_PRESETS.map((preset) => (
          <Button
            key={preset.value}
            size="small"
            type={activePreset === preset.value ? 'primary' : 'default'}
            onClick={() => handlePreset(preset.value)}
          >
            {preset.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
