import { Space, Button } from 'antd';
import styles from './index.module.css';

interface TimeRangeOption {
  key: string;
  label: string;
}

const TIME_RANGES: TimeRangeOption[] = [
  { key: '7d', label: '近7天' },
  { key: '15d', label: '近15天' },
  { key: '30d', label: '近30天' },
  { key: 'lastWeek', label: '上周' },
  { key: 'thisWeek', label: '本周' },
  { key: 'lastMonth', label: '上个月' },
  { key: 'thisMonth', label: '本月' },
];

interface TimeRangeFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function TimeRangeFilter({ value, onChange }: TimeRangeFilterProps) {
  const handleClick = (key: string) => {
    console.log('[TimeRangeFilter] onChange called with:', key);
    onChange(key);
  };
  
  return (
    <div className={styles.container}>
      <span className={styles.label}>时间范围：</span>
      <Space size="small" wrap>
        {TIME_RANGES.map((option) => (
          <Button
            key={option.key}
            type={value === option.key ? 'primary' : 'default'}
            size="small"
            onClick={() => handleClick(option.key)}
          >
            {option.label}
          </Button>
        ))}
      </Space>
    </div>
  );
}
