import React, { useState } from "react";
import { Dropdown, Input, Tabs, Space } from "antd";
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from "next-i18next";
import { Iconify } from "@/components/icon";
import styles from "./styles.module.css";

interface SymbolData {
  symbol: string;
  price: string;
  changePercent: string;
  isFavorite: boolean;
  type: 'USD' | 'COIN';
}

interface SymbolSelectorProps {
  currentSymbol?: string;
  onSymbolSelect: (symbol: SymbolData) => void;
  symbolList: SymbolData[];
  onToggleFavorite: (symbol: string) => void;
}

const SymbolSelector: React.FC<SymbolSelectorProps> = ({
  currentSymbol = "BTC/USDT 永续",
  onSymbolSelect,
  symbolList,
  onToggleFavorite
}) => {
  const { t } = useTranslation(["spot", "contract"]);
  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState('usd-contract');
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleTabClick = (key: string) => {
    setActiveTab(key);
  };

  const handleSymbolClick = (item: SymbolData) => {
    onSymbolSelect(item);
    setDropdownVisible(false);
  };

  const filteredSymbols = (type: 'USD' | 'COIN') => {
    return symbolList
      .filter(item => item.type === type)
      .filter(item =>
        searchValue === '' ||
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
                  <div
                    key={item.symbol}
                    className={styles.symbol_item}
                    onClick={() => handleSymbolClick(item)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <button
                        className={`${styles.favorite_btn} ${item.isFavorite ? styles.favorited : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(item.symbol);
                        }}
                      >
                        <Iconify icon={item.isFavorite ? "mdi:star" : "mdi:star-outline"} />
                      </button>
                      <div className={styles.symbol_info}>
                        <div className={styles.symbol_name}>{item.symbol}</div>
                        <div className={styles.symbol_type}>U本位永续</div>
                      </div>
                    </div>
                    <div className={styles.symbol_price_info}>
                      <div className={styles.symbol_price}>{item.price}</div>
                    </div>
                    <div className={styles.symbol_price_info}>
                      <div className={`${styles.symbol_change} ${item.changePercent.startsWith('+') ? 'positive' :
                          item.changePercent.startsWith('-') ? 'negative' : 'neutral'
                        }`}>
                        {item.changePercent}
                      </div>
                    </div>
                  </div>

                ))}
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane key="coin-contract" tab="币本位合约">
              <div className={styles.symbol_list}>
                {filteredSymbols('COIN').map(item => (
                  <div
                    key={item.symbol}
                    className={styles.symbol_item}
                    onClick={() => handleSymbolClick(item)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <button
                        className={`${styles.favorite_btn} ${item.isFavorite ? styles.favorited : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(item.symbol);
                        }}
                      >
                        <Iconify icon={item.isFavorite ? "mdi:star" : "mdi:star-outline"} />
                      </button>
                      <div className={styles.symbol_info}>
                        <div className={styles.symbol_name}>{item.symbol}</div>
                        <div className={styles.symbol_type}>币本位永续</div>
                      </div>
                    </div>
                    <div className={styles.symbol_price_info}>
                      <div className={styles.symbol_price}>{item.price}</div>
                    </div>
                    <div className={styles.symbol_price_info}>
                      <div className={`${styles.symbol_change} ${item.changePercent.startsWith('+') ? 'positive' :
                          item.changePercent.startsWith('-') ? 'negative' : 'neutral'
                        }`}>
                        {item.changePercent}
                      </div>
                    </div>
                  </div>
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
        <span>{currentSymbol}</span>
        <Iconify icon="mdi:chevron-down" />
      </Space>
    </Dropdown>
  );
};

export default SymbolSelector; 