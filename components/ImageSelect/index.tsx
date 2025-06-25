import React, { useState, useRef, useEffect } from 'react';
import { Input, Spin, Modal } from 'antd';
import { SearchOutlined, CloseOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { Iconify } from '@/components/icon';
import styles from './styles.module.css';
import { getRate, getCoinRate, getCoinRound } from '@/utils/getUseRate';

export interface ImageSelectOption {
  value: string;
  label: string;
  coinName?: string;
  nameDefault?: string;
  iconUrl: string;
  sort?: number;
  price?: number;
  localPrice?: string;
}

interface ImageSelectProps {
  options: ImageSelectOption[];
  value?: string;
  placeholder?: string;
  onChange?: (value: string, option: ImageSelectOption) => void;
  onFocus?: () => void;
  loading?: boolean;
  className?: string;
  searchHistory?: ImageSelectOption[];
  showSearch?: boolean;
  showHistory?: boolean;
  maxHistory?: number;
  showPrice?: boolean;
  defaultOpen?: boolean;
}

const ImageSelect: React.FC<ImageSelectProps> = ({
  options = [],
  value,
  placeholder = "",
  onChange,
  onFocus,
  loading = false,
  className = "",
  searchHistory = [],
  showSearch = true,
  showHistory = true,
  maxHistory = 4,
  showPrice = true,
  defaultOpen = false
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [searchValue, setSearchValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<ImageSelectOption[]>([]);
  const selectRef = useRef<HTMLDivElement>(null);

  // 过滤选项
  useEffect(() => {
    if (!searchValue) {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(option =>
        option.coinName?.toLowerCase().includes(searchValue.toLowerCase()) ||
        option.nameDefault?.toLowerCase().includes(searchValue.toLowerCase()) ||
        option.label.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [searchValue, options]);

  // 初始化时触发onFocus
  useEffect(() => {
    if (defaultOpen && onFocus) {
      onFocus();
    }
  }, [defaultOpen, onFocus]);

  // 移除点击外部关闭的逻辑，因为Modal会处理这个

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && onFocus) {
      onFocus();
    }
  };

  const handleSelect = (option: ImageSelectOption) => {
    if (onChange) {
      onChange(option.value, option);
    }
    setIsOpen(false);
    setSearchValue('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <>
      <div className={`${styles.imageSelect} ${className}`} ref={selectRef}>
        {/* 选择器触发器 */}
        <div className={styles.selector} onClick={handleToggle}>
          <div className={styles.selectorContent}>
            {selectedOption ? (
              <div className={styles.selectedItem}>
                <Image
                  src={selectedOption.iconUrl}
                  alt={selectedOption.coinName || selectedOption.label}
                  width={24}
                  height={24}
                  className={styles.coinIcon}
                />
                <span className={styles.coinName}>
                  {selectedOption.coinName || selectedOption.label}
                </span>
              </div>
            ) : (
              <span className={styles.placeholder}>{placeholder}</span>
            )}
          </div>
          <Iconify
            icon={isOpen ? "ep:arrow-up" : "ep:arrow-down"}
            className={styles.arrow}
            size={16}
          />
        </div>
      </div>

      {/* Modal弹框 */}
      <Modal
        open={isOpen}
        onCancel={() => {
          setIsOpen(false);
          setSearchValue('');
        }}
        footer={null}
        closable={false}
        centered
        width={490}
        className={styles.selectModal}
        styles={{
          body: {
            padding: '0px'
          }
        }}
      >
        <div className={styles.modalContent}>
          {/* 标题栏 */}
          <div className={styles.modalHeader}>
            <h3 className={styles.modalTitle}>选择币种</h3>
            <button 
              className={styles.closeButton}
              onClick={() => {
                setIsOpen(false);
                setSearchValue('');
              }}
            >
              <CloseOutlined />
            </button>
          </div>

          {loading ? (
            <div className={styles.loading}>
              <Spin size="small" />
              <span>加载中...</span>
            </div>
          ) : (
            <>
              {/* 搜索框 */}
              {showSearch && (
                <div className={styles.searchWrapper}>
                  <Input
                    placeholder="搜索"
                    prefix={<SearchOutlined />}
                    value={searchValue}
                    onChange={handleSearchChange}
                    className={styles.searchInput}
                  />
                </div>
              )}

              {/* 搜索历史 */}
              {showHistory && searchHistory.length > 0 && !searchValue && (
                <div className={styles.historySection}>
                  <p className={styles.sectionTitle}>搜索历史</p>
                  <div className={styles.historyGrid}>
                    {searchHistory.slice(0, maxHistory).map((item) => (
                      <div
                        key={item.value}
                        className={styles.historyItem}
                        onClick={() => handleSelect(item)}
                      >
                        <Image
                          src={item.iconUrl}
                          alt={item.coinName || item.label}
                          width={20}
                          height={20}
                          className={styles.coinIcon}
                        />
                        <span className={styles.historyName}>
                          {item.coinName || item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 币种列表 */}
              <div className={styles.optionsSection}>
                <div className={styles.optionsGrid}>
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`${styles.optionCard} ${
                          value === option.value ? styles.selected : ''
                        }`}
                        onClick={() => handleSelect(option)}
                      >
                        <div className={styles.optionImage}>
                          <Image
                            src={option.iconUrl}
                            alt={option.coinName || option.label}
                            width={24}
                            height={24}
                            className={styles.coinIcon}
                          />
                        </div>
                        <div className={styles.optionInfo}>
                          <div className={styles.optionName}>
                            {option.coinName || option.label}
                          </div>
                          {option.nameDefault && (
                            <div className={styles.optionDesc}>
                              {option.nameDefault}
                            </div>
                          )}
                        </div>
                          {showPrice && option.coinName && (
                            <div className={styles.optionPriceWrapper}>
                              <div className={styles.optionPrice}>{getCoinRate(option.coinName,1).coinRate}</div>
                              <div className={styles.optionPriceLocal}>≈ {getRate(option.coinName, getCoinRate(option.coinName,1).price, 'USD').ratetext}</div>
                            </div>
                          )}

                      </div>
                    ))
                  ) : (
                    <div className={styles.noData}>
                      <Iconify icon="tabler:database-off" size={24} />
                      <span>暂无数据</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default ImageSelect; 