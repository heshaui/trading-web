"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { ConfigProvider, Form, Button, Space, Tooltip, Dropdown, Select, Tabs, Input, TabsProps } from "antd";
import { useTranslation } from "next-i18next";
import { toast } from "sonner";
import appStore from "@/store";
import { useAuth } from "@/context/AuthContext";
import { registerMobile, login, registerEmail, registerEmailConfirm, createCoId, getUserConfig } from "@/services/contract";
import TradingView from "@/components/Tradingview";
import { SearchOutlined } from '@ant-design/icons';
import OrderBook from "../../compontents/OrderBook";
import ContractTradingPanel from "@/modules/contract/compontents/ContractTradingPanel";
import RiskDisclosureModal from "../../compontents/RiskDisclosureModal";
import SpotTablePage from "../../../spot/pages/compontents/spotChart_table";
import SymbolSelector from "../../compontents/SymbolSelector";
import { Iconify } from "@/components/icon";
import styles from "./trade.module.css";

const TradePage = () => {
  const { t } = useTranslation(["spot", "contract"]);
  const [currentPair, setCurrentPair] = useState<any>(null);
  const [priceData, setPriceData] = useState<any>(null);
  const [activeOrderTab, setActiveOrderTab] = useState('position'); // 持仓/订单切换
  const [showRiskDisclosure, setShowRiskDisclosure] = useState(false); // 风险确认书模态框
  const [currentSymbol, setCurrentSymbol] = useState("BTC/USDT 永续");

  // 币种数据类型
  interface SymbolData {
    symbol: string;
    price: string;
    changePercent: string;
    isFavorite: boolean;
    type: 'USD' | 'COIN';
  }

  // 模拟币种列表数据
  const [mockSymbolList, setMockSymbolList] = useState<SymbolData[]>([
    { symbol: 'BTC/USDT', price: '108,330.8', changePercent: '+0.07%', isFavorite: false, type: 'USD' },
    { symbol: 'ETH/USDT', price: '3,892.45', changePercent: '+1.23%', isFavorite: true, type: 'USD' },
    { symbol: 'BNB/USDT', price: '692.18', changePercent: '-0.45%', isFavorite: false, type: 'USD' },
    { symbol: 'SOL/USDT', price: '238.76', changePercent: '+2.15%', isFavorite: true, type: 'USD' },
    { symbol: 'ADA/USDT', price: '1.234', changePercent: '-1.87%', isFavorite: false, type: 'USD' },
    { symbol: 'DOT/USDT', price: '8.456', changePercent: '+0.92%', isFavorite: false, type: 'USD' },
    { symbol: 'BTCUSD', price: '108,285.2', changePercent: '+0.12%', isFavorite: false, type: 'COIN' },
    { symbol: 'ETHUSD', price: '3,887.12', changePercent: '+0.89%', isFavorite: true, type: 'COIN' },
    { symbol: 'BNBUSD', price: '691.45', changePercent: '-0.23%', isFavorite: false, type: 'COIN' },
    { symbol: 'SOLUSD', price: '237.98', changePercent: '+1.87%', isFavorite: false, type: 'COIN' },
  ]);

  // 获取公共数据
  const publicInfo = appStore.getPublicInfo();

  // 获取用户合约配置
  useEffect(() => {
    const loadUserConfig = async () => {
      if (publicInfo.contractList) {
        const userConfig = await appStore.loadUserConfig({ contractId: publicInfo.contractList[0].id });
        if(userConfig.openContract !== 1){
          setShowRiskDisclosure(true);
        }
      }
    };
    
    loadUserConfig();
  }, [publicInfo]);

  // 处理订单簿价格点击
  const handlePriceClick = (price: number) => {
    console.log('Price clicked:', price);
    // 这里可以将价格传递给交易组件
  };

  // 处理订单提交
  const handleOrderSubmit = (orderData: any) => {
    console.log('Order submitted:', orderData);
    // 这里处理订单提交逻辑
    toast.success('订单提交成功');
  };

  // 处理风险确认书
  const handleShowRiskDisclosure = () => {
    setShowRiskDisclosure(true);
  };

  const handleRiskDisclosureCancel = () => {
    setShowRiskDisclosure(false);
  };

  const handleRiskDisclosureConfirm = async () => {
    setShowRiskDisclosure(false);
    // 这里可以处理用户确认风险的逻辑，比如开通合约交易
    try {
      const res = await createCoId({contractId: publicInfo.contractList[0].id, openContract: 1});
      if(res.code === '0'){
        toast.success('合约交易已开通');
      }
    } catch (error) {
      console.error('开通合约交易失败:', error);
    }
  };

  // 处理币种选择
  const handleSymbolSelect = (item: SymbolData) => {
    console.log('Selected symbol:', item);
    setCurrentPair(item);
    setCurrentSymbol(item.symbol + " 永续");
  };

  // 处理收藏/取消收藏
  const handleToggleFavorite = (symbol: string) => {
    setMockSymbolList(prev => 
      prev.map(item => 
        item.symbol === symbol 
          ? { ...item, isFavorite: !item.isFavorite }
          : item
      )
    );
  };


  // 模拟价格数据
  const mockPriceData = {
    symbol: "BTCUSDT",
    price: "108,330.8",
    priceUsd: "$108,330.8",
    changePercent: "+0.07%",
    change24h: "+75.6",
    high24h: "109,100.0",
    low24h: "107,800.0",
    volume24h: "7,749.52",
    markPrice: "108,333.0",
    indexPrice: "108,381.4",
    fundingRate: "0.0066%",
    fundingCountdown: "00:18:09",
    volume24hUSD: "8.38亿",
    isUp: true
  };

  // 底部标签页配置
  const bottomTabItems = [
    {
      key: 'position',
      label: t('contract:position'),
    },
    {
      key: 'openOrders',
      label: t('contract:openOrders'),
    },
    {
      key: 'orderHistory',
      label: t('contract:orderHistory'),
    },
    {
      key: 'tradeHistory',
      label: t('contract:tradeHistory'),
    },
    {
      key: 'assets',
      label: t('contract:assets'),
    },
  ];

  return (
    <div className={styles.tradePage}>
      {/* 主要内容区域 - 三栏布局 */}
      <div className={styles.mainContent}>
        {/* 左侧 - K线图区域 */}
        <div className={styles.leftPanel}>
          {/* 价格信息栏 */}
          <div className={styles.priceBar}>
                        <div className={styles.symbolSection}>
              <SymbolSelector
                currentSymbol={currentSymbol}
                onSymbolSelect={handleSymbolSelect}
                symbolList={mockSymbolList}
                onToggleFavorite={handleToggleFavorite}
              />
            </div>
            
            <div className={styles.priceInfo}>
              <div className={`${styles.currentPrice} ${mockPriceData.isUp ? styles.priceUp : styles.priceDown}`}>
                {mockPriceData.price}
              </div>
              <div className={`${styles.priceChangePercent} ${mockPriceData.isUp ? styles.priceUp : styles.priceDown}`}>
                {mockPriceData.changePercent}
              </div>
            </div>
            
            <div className={styles.statsSection}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>标记价格</span>
                <span className={`${styles.statValue} ${mockPriceData.isUp ? styles.priceUp : styles.priceDown}`}>
                  {mockPriceData.change24h}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>指数价格</span>
                <span className={styles.statValue}>{mockPriceData.high24h}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>资金费率/倒计时</span>
                <span className={styles.statValue}>{mockPriceData.low24h}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>24H 成交量(张)</span>
                <span className={styles.statValue}>{mockPriceData.volume24hUSD}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>24H 成交额(USD)</span>
                <span className={styles.statValue}>
                  <span className={mockPriceData.fundingRate.startsWith('+') ? styles.priceUp : mockPriceData.fundingRate.startsWith('-') ? styles.priceDown : ''}>
                    {mockPriceData.fundingRate}
                  </span>
                  <span className={styles.fundingCountdown}> / {mockPriceData.fundingCountdown}</span>
                </span>
              </div>
            </div>


          </div>

          {/* K线图容器 */}
          <div className={styles.chartContainer}>
            <TradingView
              symbol={currentPair?.symbol || "BTCUSDT"}
              showLeftToolbar={false}
              chartType={9}
              timeInterval="15m"
            />
          </div>
        </div>

        {/* 中间 - 订单簿 */}
        <div className={styles.centerPanel}>
          <div className={styles.orderBookContainer}>
            <OrderBook />
          </div>
        </div>

        {/* 右侧 - 交易面板 */}
        <div className={styles.rightPanel}>
          <div className={styles.tradingContainer}>
            <ContractTradingPanel
              symbol={mockPriceData.symbol}
              lastPrice={parseFloat(mockPriceData.price.replace(/,/g, ''))}
              availableBalance={1000} // 模拟可用余额
              onOrderSubmit={handleOrderSubmit}
            />
          </div>
        </div>
      </div>

      {/* 风险确认书模态框 */}
      <RiskDisclosureModal
        open={showRiskDisclosure}
        onCancel={handleRiskDisclosureCancel}
        onConfirm={handleRiskDisclosureConfirm}
      />
                
    </div>
  );
};

export default TradePage;
