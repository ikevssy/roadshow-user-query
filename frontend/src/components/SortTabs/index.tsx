import { Space, Button } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import styles from './index.module.css';

interface SortOption {
  key: string;
  label: string;
  field: string;
}

interface SortTabsProps {
  options: SortOption[];
  activeKey: string;
  sortOrder: 'ascend' | 'descend';
  onChange: (key: string, order: 'ascend' | 'descend') => void;
}

export function SortTabs({ options, activeKey, sortOrder, onChange }: SortTabsProps) {
  return (
    <div className={styles.container}>
      <span className={styles.label}>排序：</span>
      <Space size="small" wrap>
        {options.map((option) => {
          const isActive = option.key === activeKey;
          return (
            <Button
              key={option.key}
              type={isActive ? 'primary' : 'default'}
              size="small"
              icon={isActive ? (sortOrder === 'descend' ? <ArrowDownOutlined /> : <ArrowUpOutlined />) : null}
              onClick={() => onChange(option.key, isActive ? (sortOrder === 'descend' ? 'ascend' : 'descend') : 'descend')}
            >
              {option.label}
            </Button>
          );
        })}
      </Space>
    </div>
  );
}
