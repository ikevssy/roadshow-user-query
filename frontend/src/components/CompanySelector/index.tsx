import { useState, useMemo, useEffect } from 'react';
import { Select, Space, Typography, Radio, Checkbox, Tag } from 'antd';
import { FilterOutlined, BankOutlined } from '@ant-design/icons';
import { useAppStore } from '../../store';
import type { Company } from '../../types';
import styles from './index.module.css';

const { Text } = Typography;

export function CompanySelector() {
  const {
    companies,
    industryData,
    selectedCompanyOids,
    setSelectedCompanyOids,
    selectedIndustries,
    setSelectedIndustries,
    queryMode,
    setQueryMode,
  } = useAppStore();
  
  const [searchValue, setSearchValue] = useState('');
  
  // 当选择行业时，自动选中该行业下所有公司
  useEffect(() => {
    if (!industryData || selectedIndustries.length === 0) return;
    
    const oidsFromIndustries: number[] = [];
    selectedIndustries.forEach(industry => {
      const oids = industryData.industry_company_map[industry] || [];
      oidsFromIndustries.push(...oids);
    });
    
    // 合并去重
    const uniqueOids = [...new Set([...selectedCompanyOids, ...oidsFromIndustries])];
    setSelectedCompanyOids(uniqueOids);
  }, [selectedIndustries]);
  
  // 搜索匹配的公司
  const filteredCompanies = useMemo(() => {
    if (!searchValue) return [];
    const search = searchValue.toLowerCase();
    return companies.filter(
      (c) =>
        c.cn_short_name.toLowerCase().includes(search) ||
        c.oid.toString().includes(search)
    ).slice(0, 100);
  }, [companies, searchValue]);
  
  // 已选择的公司
  const selectedCompanies = useMemo(() => {
    return selectedCompanyOids
      .map((oid) => companies.find((c) => c.oid === oid))
      .filter((c): c is Company => c !== undefined);
  }, [companies, selectedCompanyOids]);
  
  // 处理选择公司
  const handleSelect = (value: any) => {
    const oid = Number(value);
    if (!selectedCompanyOids.includes(oid)) {
      setSelectedCompanyOids([...selectedCompanyOids, oid]);
    }
    setSearchValue('');
  };
  
  // 处理删除公司
  const handleRemove = (oid: number) => {
    setSelectedCompanyOids(selectedCompanyOids.filter((o) => o !== oid));
  };
  
  // 处理删除行业
  const handleRemoveIndustry = (industry: string) => {
    setSelectedIndustries(selectedIndustries.filter((i) => i !== industry));
  };
  
  // 清空所有
  const handleClearAll = () => {
    setSelectedCompanyOids([]);
    setSelectedIndustries([]);
  };
  
  // 处理行业选择
  const handleIndustryChange = (industry: string, checked: boolean) => {
    if (checked) {
      setSelectedIndustries([...selectedIndustries, industry]);
    } else {
      setSelectedIndustries(selectedIndustries.filter((i) => i !== industry));
    }
  };
  
  // 下拉渲染
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
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Text strong>选择互动公司</Text>
        {queryMode === 'select' && (
          <Text type="secondary">
            已选 {selectedIndustries.length} 个行业 / {selectedCompanyOids.length} 家公司
          </Text>
        )}
        {selectedCompanyOids.length > 0 && (
          <a onClick={handleClearAll} className={styles.clearAll}>清空</a>
        )}
      </div>
      
      {/* 查询模式选择 */}
      <div className={styles.modeSelector}>
        <Radio.Group
          value={queryMode}
          onChange={(e) => setQueryMode(e.target.value)}
          buttonStyle="solid"
          size="middle"
        >
          <Radio.Button value="unlimited">不限</Radio.Button>
          <Radio.Button value="select">选择互动公司</Radio.Button>
        </Radio.Group>
        {queryMode === 'unlimited' && (
          <Text type="secondary" style={{ marginLeft: 12, fontSize: 12 }}>
            查询所有公司的互动用户
          </Text>
        )}
      </div>
      
      {queryMode === 'select' && (
        <>
          {/* 第一级：行业选择 */}
          {industryData && industryData.industries.length > 0 && (
            <div className={styles.industrySection}>
              <div className={styles.sectionHeader}>
                <FilterOutlined />
                <Text strong>公司所属行业</Text>
              </div>
              <div className={styles.industryList}>
                {industryData.industries.map((industry) => (
                  <Checkbox
                    key={industry}
                    checked={selectedIndustries.includes(industry)}
                    onChange={(e) => handleIndustryChange(industry, e.target.checked)}
                  >
                    {industry}
                    <Text type="secondary" style={{ fontSize: 11, marginLeft: 4 }}>
                      ({industryData.industry_company_map[industry]?.length || 0})
                    </Text>
                  </Checkbox>
                ))}
              </div>
            </div>
          )}
          
          {/* 第二级：公司选择 */}
          <div className={styles.companySection}>
            <div className={styles.sectionHeader}>
              <BankOutlined />
              <Text strong>选择公司</Text>
            </div>
            
            <Select
              className={styles.select}
              placeholder="搜索公司名称或OID..."
              showSearch
              filterOption={false}
              onSearch={setSearchValue}
              onSelect={handleSelect}
              value={null}
              searchValue={searchValue}
              dropdownRender={dropdownRender}
              virtual={true}
              listHeight={400}
            >
              {filteredCompanies.map((company) => (
                <Select.Option key={company.oid} value={company.oid}>
                  <Space>
                    <Text>{company.oid}</Text>
                    <Text type="secondary">-</Text>
                    <Text>{company.cn_short_name}</Text>
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </div>
          
          {/* 已选择的标签 */}
          {(selectedIndustries.length > 0 || selectedCompanies.length > 0) && (
            <div className={styles.selectedTags}>
              {selectedIndustries.map((industry) => (
                <Tag
                  key={industry}
                  closable
                  color="blue"
                  onClose={() => handleRemoveIndustry(industry)}
                >
                  {industry}
                </Tag>
              ))}
              {selectedCompanies.length <= 20 ? (
                selectedCompanies.map((company) => (
                  <Tag
                    key={company.oid}
                    closable
                    onClose={() => handleRemove(company.oid)}
                  >
                    {company.cn_short_name}
                  </Tag>
                ))
              ) : (
                <Tag color="default">
                  {selectedCompanies.slice(0, 5).map(c => c.cn_short_name).join(', ')} 等{selectedCompanies.length}家公司
                </Tag>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
