import React, { useState, useEffect } from "react";
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
  volume?: string;
}

interface SymbolSelectorProps {
  currentSymbol?: string | SymbolData;
  onSymbolSelect: (symbol: SymbolData) => void;
  symbolList: SymbolData[];
  onToggleFavorite: (symbol: string) => void;
  marketInfoData: any;
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
      {/* <button
        className={`${styles.favorite_btn} ${item.isFavorite ? styles.favorited : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(item.contractName);
        }}
      >
        <Iconify icon={item.isFavorite ? "mdi:star" : "mdi:star-outline"} />
      </button> */}
      <div className={styles.symbol_info}>
        <div className={styles.symbol_name}>{item.base}/{item.quote}</div>
        <div className={styles.symbol_type}>{item.contractShowType}</div>
        <div className={styles.symbol_type}>{item.volume || '--'}</div>
      </div>
    </div>
    <div className={styles.symbol_price_info}>
      <div className={styles.symbol_price}>{item.price || '--'}</div>
    </div>
    <div className={styles.symbol_price_info}>
      <div className={`${styles.symbol_change} ${item.changePercent?.startsWith('+') ? 'positive' :
        item.changePercent?.startsWith('-') ? 'negative' : 'neutral'
        }`}>
        {item.changePercent|| '--'}
      </div>
    </div>
  </div>
);

// 根据合约类型分类的工具函数
const getContractCategory = (item: SymbolData)  => {
  if (item.contractType === 'E') {
    switch (item.contractSide) {
      case 1:
        return 'usdt'; // USDT合约
      case 0:
        return 'coin'; // 币本位合约
      case 2:
        return 'mix'; // 混合合约
      default:
        return 'unknown';
    }
  } else if (item.contractType === 'S') {
    return 'sim'; // 模拟合约
  }
  return 'unknown';
};

const SymbolSelector: React.FC<SymbolSelectorProps> = ({
  currentSymbol = "",
  onSymbolSelect,
  symbolList,
  onToggleFavorite,
  marketInfoData
}) => {
  const { t } = useTranslation(["spot", "contract"]);
  const [searchValue, setSearchValue] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const [activeTab, setActiveTab] = useState('usd-contract');

  console.log("marketInfoData", marketInfoData);
  // 将 marketInfoData 的数据合并到 symbolList 中
  const enrichedSymbolList = React.useMemo(() => {
    if (!marketInfoData || !symbolList) return symbolList;

    return symbolList.map(symbol => {
      // 构建匹配的键，格式如 "e_btcusdt" 或 "s_btcusdt"
      const contractPrefix = symbol.contractType === 'E' ? 'e_' : 's_';
      // 移除合约名称中的连字符和前缀，转换为小写
      // E-BTC-USDT -> btcusdt, S-BTC-USDT -> btcusdt
      const cleanContractName = symbol.contractName.toLowerCase().replace(/^[es]-/, '').replace(/-/g, '');
      const marketKey = `${contractPrefix}${cleanContractName}`;
      
      const marketData = marketInfoData[marketKey];
      

      
      if (marketData) {
        return {
          ...symbol,
          price: marketData.close || '--',
          changePercent: marketData.rose !== undefined && marketData.rose !== null ? `${marketData.rose}%` : '0.00%',
          high: marketData.high,
          low: marketData.low,
          volume: marketData.vol,
          amount: marketData.amount
        };
      }
      
      return symbol;
    });
  }, [symbolList, marketInfoData]);

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

  // 当currentSymbol或symbolList改变时，更新activeTab
  useEffect(() => {
    // 检查哪些合约类型有数据
    const getAvailableTypes = () => {
      const types = ['coin', 'usdt', 'mix', 'sim'];
      return types.filter(type => {
        const symbols = enrichedSymbolList.filter(item => getContractCategory(item) === type);
        return symbols.length > 0;
      });
    };

    // 获取第一个有数据的tab key
    const getFirstAvailableTab = () => {
      const availableTypes = getAvailableTypes();
      const typeToKeyMap = {
        'coin': 'coin-contract',
        'usdt': 'usd-contract',
        'mix': 'mix-contract',
        'sim': 'sim-contract'
      };

      return availableTypes.length > 0 ? typeToKeyMap[availableTypes[0] as keyof typeof typeToKeyMap] : 'usd-contract';
    };

    // 根据当前选中的合约确定默认标签页
    const getDefaultTab = () => {
      if (typeof currentSymbol === 'object' && currentSymbol) {
        const category = getContractCategory(currentSymbol);
        const typeToKeyMap = {
          'usdt': 'usd-contract',
          'coin': 'coin-contract',
          'mix': 'mix-contract',
          'sim': 'sim-contract'
        };

        const targetTab = typeToKeyMap[category as keyof typeof typeToKeyMap];
        // 检查目标tab是否有数据，如果有就返回，否则返回第一个有数据的tab
        const availableTypes = getAvailableTypes();
        const availableTabs = availableTypes.map(type => typeToKeyMap[type as keyof typeof typeToKeyMap]);

        if (targetTab && availableTabs.includes(targetTab)) {
          return targetTab;
        }
      }

      // 如果没有当前选中的合约或当前合约类型没有数据，返回第一个有数据的tab
      return getFirstAvailableTab();
    };

    setActiveTab(getDefaultTab());
  }, [currentSymbol, enrichedSymbolList]);

  // 根据类别过滤合约
  const filteredSymbols = (category: string) => {
    let filtered = enrichedSymbolList.filter(item => {
      const itemCategory = getContractCategory(item);
      return itemCategory === category;
    });

    // 如果有搜索关键词，进一步过滤
    if (searchValue) {
      filtered = filtered.filter(item =>
        item.base.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.quote.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.contractName.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    return filtered;
  };

  // 检查哪些合约类型有数据
  const getAvailableContractTypes = () => {
    const types = ['coin', 'usdt', 'mix', 'sim'];
    return types.filter(type => {
      const symbols = enrichedSymbolList.filter(item => getContractCategory(item) === type);
      return symbols.length > 0;
    });
  };

  // 获取第一个有数据的tab key
  const getFirstAvailableTab = () => {
    const availableTypes = getAvailableContractTypes();
    const typeToKeyMap = {
      'coin': 'coin-contract',
      'usdt': 'usd-contract',
      'mix': 'mix-contract',
      'sim': 'sim-contract'
    };

    return availableTypes.length > 0 ? typeToKeyMap[availableTypes[0] as keyof typeof typeToKeyMap] : 'usd-contract';
  };

  // 渲染动态的Tab.TabPane
  const renderTabPanes = () => {
    const availableTypes = getAvailableContractTypes();
    const tabConfig = [
      { key: 'coin-contract', type: 'coin', label: t('contract:symbolSelector.coinContract') },
      { key: 'usd-contract', type: 'usdt', label: t('contract:symbolSelector.usdtContract') },
      { key: 'mix-contract', type: 'mix', label: t('contract:symbolSelector.mixContract') },
      { key: 'sim-contract', type: 'sim', label: t('contract:symbolSelector.simContract') }
    ];

    return tabConfig
      .filter(config => availableTypes.includes(config.type))
      .map(config => (
        <Tabs.TabPane tab={config.label} key={config.key}>
          <div className={styles.symbol_header}>
            <div className={styles.symbol_header_left}>
              <span>合约/市值</span>
            </div>
            <div className={styles.symbol_header_right}>
              <span>最新价</span>
              <span>涨跌幅</span>
            </div>
          </div>
          <div className={styles.symbol_list}>
            {filteredSymbols(config.type).map(item => (
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
      ));
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
            {renderTabPanes()}
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
              : t('contract:symbolSelector.selectContract')
          }
        </span>
        <Iconify icon="mdi:chevron-down" />
      </Space>
    </Dropdown>
  );
};

export default SymbolSelector; 