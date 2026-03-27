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
  const [activePreset, setActivePreset] = useState<number | null>(7); // 默认选中7天
  
  // 初始化默认时间范围（最近7天）
  useEffect(() => {
    handlePreset(7);
  }, []);
  
  // 处理预设选择
  const handlePreset = (days: number) => {
    let start: Dayjs;
    let end: Dayjs;
    
    if (days === 0) {
      // 今天
      start = dayjs().startOf('day');
      end = dayjs().endOf('day');
    } else if (days === -1) {
      // 昨天
      start = dayjs().subtract(1, 'day').startOf('day');
      end = dayjs().subtract(1, 'day').endOf('day');
    } else {
      // 最近N天
      end = dayjs();
      start = end.subtract(days, 'day');
    }
    
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
  
  // 判断是否为快捷选项（今天、昨天、3天）
  const isSpecialPreset = (value: number) => value <= 3;
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Text strong>互动时间范围</Text>
      </div>
      
      {/* 快捷选项放在最前面 */}
      <div className={styles.presets}>
        <div className={styles.specialPresets}>
          {TIME_PRESETS.filter(p => isSpecialPreset(p.value)).map((preset) => (
            <Button
              key={preset.value}
              size="small"
              type={activePreset === preset.value ? 'primary' : 'default'}
              onClick={() => handlePreset(preset.value)}
              className={styles.presetBtn}
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <div className={styles.normalPresets}>
          {TIME_PRESETS.filter(p => !isSpecialPreset(p.value)).map((preset) => (
            <Button
              key={preset.value}
              size="small"
              type={activePreset === preset.value ? 'primary' : 'default'}
              onClick={() => handlePreset(preset.value)}
              className={styles.presetBtn}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>
      
      {/* 日期选择器放在下方 */}
      <RangePicker
        className={styles.picker}
        value={dates}
        onChange={handleDateChange}
        format="YYYY-MM-DD"
        allowClear={false}
        placeholder={['开始日期', '结束日期']}
      />
    </div>
  );
}
