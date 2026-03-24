import { useState, useMemo } from 'react';
import { Select, Space, Typography, Avatar } from 'antd';
import { CloseCircleOutlined, BankOutlined } from '@ant-design/icons';
import { useAppStore } from '../../store';
import type { Company } from '../../types';
import styles from './index.module.css';

const { Text } = Typography;

// 默认LOGO URL前缀
const LOGO_PREFIX = 'https://image.roadshowchina.cn';

export function CompanySelector() {
  const { companies, selectedCompanyOids, setSelectedCompanyOids } = useAppStore();
  const [searchValue, setSearchValue] = useState('');
  
  // 搜索匹配的公司 - 移除限制，使用虚拟滚动
  const filteredCompanies = useMemo(() => {
    // 如果没有搜索词，返回空（提示用户输入）
    if (!searchValue) return [];
    
    const search = searchValue.toLowerCase();
    return companies.filter(
      (c) =>
        c.cn_short_name.toLowerCase().includes(search) ||
        c.oid.toString().includes(search)
    );
  }, [companies, searchValue]);
  
  // 已选择的公司
  const selectedCompanies = useMemo(() => {
    return selectedCompanyOids
      .map((oid) => companies.find((c) => c.oid === oid))
      .filter((c): c is Company => c !== undefined);
  }, [companies, selectedCompanyOids]);
  
  // 获取完整的LOGO URL
  const getLogoUrl = (logoUrl: string | null): string | undefined => {
    if (!logoUrl) return undefined;
    if (logoUrl.startsWith('http')) return logoUrl;
    return `${LOGO_PREFIX}${logoUrl}`;
  };
  
  // 处理选择
  const handleSelect = (value: any) => {
    const oid = Number(value);
    if (selectedCompanyOids.length >= 10) {
      return;
    }
    if (!selectedCompanyOids.includes(oid)) {
      setSelectedCompanyOids([...selectedCompanyOids, oid]);
    }
    setSearchValue('');
  };
  
  // 处理删除
  const handleRemove = (oid: number) => {
    setSelectedCompanyOids(selectedCompanyOids.filter((o) => o !== oid));
  };
  
  // 清空所有
  const handleClearAll = () => {
    setSelectedCompanyOids([]);
  };
  
  // 自定义下拉渲染 - 使用虚拟滚动
  const dropdownRender = (menu: React.ReactElement) => (
    <div>
      {filteredCompanies.length > 0 ? (
        <>
          <div style={{ padding: '8px 12px', color: '#999', fontSize: 12 }}>
            找到 {filteredCompanies.length} 家公司
          </div>
          {menu}
        </>
      ) : (
        <div style={{ padding: '12px', textAlign: 'center', color: '#999' }}>
          {searchValue ? '未找到匹配的公司' : '请输入OID或公司简称搜索'}
        </div>
      )}
    </div>
  );
  
  // 自定义选项渲染 - 带LOGO
  const optionRender = (company: Company) => (
    <Space>
      <Avatar 
        size="small" 
        src={getLogoUrl(company.logo_url)}
        icon={<BankOutlined />}
        style={{ backgroundColor: '#87d068' }}
      />
      <Text>{company.oid}</Text>
      <Text type="secondary">-</Text>
      <Text>{company.cn_short_name}</Text>
    </Space>
  );
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Text strong>选择公司</Text>
        <Text type="secondary">（最多10家）</Text>
        {selectedCompanyOids.length > 0 && (
          <a onClick={handleClearAll} className={styles.clearAll}>
            清空
          </a>
        )}
      </div>
      
      <Select
        className={styles.select}
        placeholder="输入OID或机构简称搜索..."
        showSearch
        filterOption={false}
        onSearch={setSearchValue}
        onSelect={handleSelect}
        value={null}
        searchValue={searchValue}
        disabled={selectedCompanyOids.length >= 10}
        dropdownRender={dropdownRender}
        virtual={true}
        listHeight={400}
      >
        {filteredCompanies.map((company) => (
          <Select.Option key={company.oid} value={company.oid}>
            {optionRender(company)}
          </Select.Option>
        ))}
      </Select>
      
      {/* 已选择的公司 - 带LOGO卡片 */}
      {selectedCompanies.length > 0 && (
        <div className={styles.selectedList}>
          {selectedCompanies.map((company) => (
            <div key={company.oid} className={styles.companyCard}>
              <Avatar 
                size={32}
                src={getLogoUrl(company.logo_url)}
                icon={<BankOutlined />}
                style={{ backgroundColor: '#87d068', flexShrink: 0 }}
              />
              <div className={styles.companyInfo}>
                <Text strong className={styles.companyName}>{company.cn_short_name}</Text>
                <Text type="secondary" className={styles.companyOid}>OID: {company.oid}</Text>
              </div>
              <CloseCircleOutlined 
                className={styles.removeBtn}
                onClick={() => handleRemove(company.oid)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
