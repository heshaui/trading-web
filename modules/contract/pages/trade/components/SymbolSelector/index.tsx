import React, { useState } from "react";
import { Dropdown, Input, Tabs, Space } from "antd";
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from "next-i18next";
import { Iconify } from "@/components/icon";
import styles from "./styles.module.css";

// 合约数据接口定义
interface ContractData {
  contractType: string;
  marginCoin: string;
  symbol: string;
}

interface SymbolData {
  id: number;
  contractName: string;
  symbol: string;
  contractType: string;
  coType: string;
  contractShowType: string;
  deliveryKind: string;
  contractSide: number;
  multiplier: number;
  multiplierCoin: string;
  marginCoin: string;
  marginRate: number;
  capitalStartTime: number;
  capitalFrequency: number;
  settlementFrequency: number;
  brokerId: number;
  base: string;
  quote: string;
  coinResultVo: any;
  sort: number;
  maxLever: number;
  minLever: number;
  // 可选的UI相关字段
  price?: string;
  changePercent?: string;
  isFavorite?: boolean;
  type?: 'USD' | 'COIN';
}

interface SymbolSelectorProps {
  currentSymbol?: string | SymbolData;
  onSymbolSelect: (symbol: SymbolData) => void;
  symbolList: SymbolData[];
  onToggleFavorite: (symbol: string) => void;
}

// 判断是否为U本位合约
function isUSDTMargined(contract: ContractData) {
  return contract.contractType === "E" &&
    contract.marginCoin === "USDT";
}

// 判断是否为币本位合约
function isCoinMargined(contract: ContractData) {
  return contract.contractType !== "E" &&
    contract.marginCoin !== "USDT";
}

// 提取符号项组件以避免重复代码
const SymbolItem: React.FC<{
  item: SymbolData;
  onSymbolClick: (item: SymbolData) => void;
  onToggleFavorite: (symbol: string) => void;
  isSelected: boolean;
}> = ({ item, onSymbolClick, onToggleFavorite, isSelected }) => (
  <div
    className={`${styles.symbol_item} ${isSelected ? styles.selected : ''}`}
    onClick={() => onSymbolClick(item)}
  >
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <button
        className={`${styles.favorite_btn} ${item.isFavorite ? styles.favorited : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(item.contractName);
        }}
      >
        <Iconify icon={item.isFavorite ? "mdi:star" : "mdi:star-outline"} />
      </button>
      <div className={styles.symbol_info}>
        <div className={styles.symbol_name}>{item.base}/{item.quote}</div>
        <div className={styles.symbol_type}>{item.contractShowType}</div>
      </div>
    </div>
    <div className={styles.symbol_price_info}>
      <div className={styles.symbol_price}>{item.price || '--'}</div>
    </div>
    <div className={styles.symbol_price_info}>
      <div className={`${styles.symbol_change} ${item.changePercent?.startsWith('+') ? 'positive' :
        item.changePercent?.startsWith('-') ? 'negative' : 'neutral'
        }`}>
        {item.changePercent || '0.00%'}
      </div>
    </div>
  </div>
);

const SymbolSelector: React.FC<SymbolSelectorProps> = ({
  currentSymbol = "",
  onSymbolSelect,
  symbolList,
  onToggleFavorite
}) => {
  const { t } = useTranslation(["spot", "contract"]);
  const [searchValue, setSearchValue] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // 根据当前选中的合约确定默认标签页
  const getDefaultTab = () => {
    if (typeof currentSymbol === 'object' && currentSymbol) {
      return isUSDTMargined(currentSymbol) ? 'usd-contract' : 'coin-contract';
    }
    return 'usd-contract'; // 默认选择U本位合约
  };

  const [activeTab, setActiveTab] = useState(getDefaultTab);

  const handleTabClick = (key: string) => {
    setActiveTab(key);
  };

  const handleSymbolClick = (item: SymbolData) => {
    onSymbolSelect(item);
    setDropdownVisible(false);
  };

  // 检查某个合约是否被选中
  const isSymbolSelected = (item: SymbolData) => {
    if (typeof currentSymbol === 'object' && currentSymbol) {
      return currentSymbol.id === item.id;
    }
    return false;
  };

  // 当currentSymbol改变时，更新activeTab
  React.useEffect(() => {
    if (typeof currentSymbol === 'object' && currentSymbol) {
      const newTab = isUSDTMargined(currentSymbol) ? 'usd-contract' : 'coin-contract';
      setActiveTab(newTab);
    }
  }, [currentSymbol]);

  const filteredSymbols = (type: 'USD' | 'COIN') => {
    return symbolList
      .filter(item => {
        // 使用函数判断合约类型
        return type === 'USD' ? isUSDTMargined(item) : isCoinMargined(item);
      })
      .filter(item =>
        searchValue === '' ||
        item.base.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.quote.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.symbol.toLowerCase().includes(searchValue.toLowerCase())
      );
  };

  const dropdownContent = (
    <div className={styles.dropdown_container}>
      <div className={styles.search_container}>
        <Input
          placeholder={t('spot.header.search')}
          prefix={<SearchOutlined />}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className={styles.input_box}
          allowClear
        />
      </div>

      <div className={styles.tabs_container}>
        <div className={styles.tabs_list}>
          <Tabs
            activeKey={activeTab}
            onChange={handleTabClick}
            tabBarStyle={{ margin: 0 }}
          >
            <Tabs.TabPane key="usd-contract" tab="U本位合约">
              <div className={styles.symbol_list}>
                {filteredSymbols('USD').map(item => (
                  <SymbolItem
                    key={item.id}
                    item={item}
                    onSymbolClick={handleSymbolClick}
                    onToggleFavorite={onToggleFavorite}
                    isSelected={isSymbolSelected(item)}
                  />
                ))}
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane key="coin-contract" tab="币本位合约">
              <div className={styles.symbol_list}>
                {filteredSymbols('COIN').map(item => (
                  <SymbolItem
                    key={item.id}
                    item={item}
                    onSymbolClick={handleSymbolClick}
                    onToggleFavorite={onToggleFavorite}
                    isSelected={isSymbolSelected(item)}
                  />
                ))}
              </div>
            </Tabs.TabPane>
          </Tabs>
        </div>
      </div>
    </div>
  );

  return (
    <Dropdown
      trigger={['click']}
      placement="bottomLeft"
      dropdownRender={() => dropdownContent}
      open={dropdownVisible}
      onOpenChange={setDropdownVisible}
    >
      <Space className={styles.dropdown_trigger}>
        <span>
          {typeof currentSymbol === 'string'
            ? currentSymbol
            : currentSymbol?.base && currentSymbol?.quote
              ? `${currentSymbol.base}/${currentSymbol.quote}`
              : '选择合约'
          }
        </span>
        <Iconify icon="mdi:chevron-down" />
      </Space>
    </Dropdown>
  );
};

export default SymbolSelector; 