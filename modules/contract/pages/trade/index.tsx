"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { ConfigProvider, Form, Button, Space, Tooltip, Dropdown, Select, Tabs, Input, TabsProps } from "antd";
import { useTranslation } from "next-i18next";
import { toast } from "sonner";
import appStore from "@/store";
import { useAuth } from "@/context/AuthContext";
import { createCoId, createOrder } from "@/services/contract";
import TradingView from "@/components/Tradingview";
import { SearchOutlined } from '@ant-design/icons';
import OrderBook from "../../compontents/OrderBook";
import ContractTradingPanel from "@/modules/contract/compontents/ContractTradingPanel";
import RiskDisclosureModal from "../../compontents/RiskDisclosureModal";
import SpotTablePage from "../../../spot/pages/compontents/spotChart_table";
import SymbolSelector from "../../compontents/SymbolSelector";
import styles from "./trade.module.css";
import WebSocketService from "@/utils/websocket";
import { transferAll } from "@/services/assets";


const TradePage = () => {
  const { t } = useTranslation(["spot", "contract"]);
  const [currentPair, setCurrentPair] = useState<any>(null);
  const [priceData, setPriceData] = useState<any>(null);
  const [activeOrderTab, setActiveOrderTab] = useState('position'); // 持仓/订单切换
  const [showRiskDisclosure, setShowRiskDisclosure] = useState(false); // 风险确认书模态框
  const [currentSymbol, setCurrentSymbol] = useState("BTC/USDT 永续");

  // 币种数据类型 - 与SymbolSelector组件保持一致
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

  // 获取公共数据
  const publicInfo = appStore.getPublicInfo();
  const [symbolList, setSymbolList] = useState<SymbolData[]>([]);
  useEffect(() => {
    if (publicInfo.contractList) {
      setSymbolList(publicInfo.contractList);
    }
  }, [publicInfo]);
  // 合约账户数据类型
  interface ContractAsset {
    symbol: string;
    totalAmount: string;
    canUseAmount: string;
    isolateMargin: string;
    lockAmount: string;
    unRealizedAmount: string;
    realizedAmount: string;
    totalMargin: string;
    totalMarginRate: string;
  }

  const [contractAssets, setContractAssets] = useState<ContractAsset[]>([]);

  const getContractBalance = async () => {
    try {
      const accountList = await appStore.loadContractAssets();
      setContractAssets(accountList);
      console.log('Contract assets accountList:', accountList);
    } catch (error) {
      console.error('Failed to load contract assets:', error);
    }
  };

  // 获取特定币种的资产信息
  const getAssetBySymbol = (symbol: string): ContractAsset | undefined => {
    return contractAssets.find(asset => asset.symbol === symbol);
  };

  // 获取USDT资产可用余额，用于交易面板
  const getAvailableUSDTBalance = (): number => {
    const usdtAsset = getAssetBySymbol('USDT');
    return parseFloat(usdtAsset?.canUseAmount || '0');
  };
 

  useEffect(() => {
    getContractBalance();
  }, []);
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

  useEffect(() => {
    if (!publicInfo.wsUrl) return;

    const ws = new WebSocketService(publicInfo.wsUrl.replace(';', ''));
    const event = {
      "event": "req",
      "params": {
        "channel": "market_S-BTC-USDT_kline_1min",
        "cb_id": "S-BTC-USDT",
        "pageSize": 50
      }
    };

    // 消息处理回调 
    const handleMessage = (message: string) => {
      try {
        console.log('收到原始消息长度:', message.length);
        console.log('消息前100字符:', message.substring(0, 100));
        
        // 如果消息看起来像是乱码，尝试打印十六进制
        if (message.includes('�') || message.length < 10) {
          console.log('消息可能是二进制数据，十六进制表示:');
          const encoder = new TextEncoder();
          const bytes = encoder.encode(message);
          console.log(Array.from(bytes.slice(0, 20)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
        }
        
        const data = JSON.parse(message);
        console.log('解析后的WebSocket消息:', data);
        
        // 这里可以处理接收到的数据，比如更新价格数据
        if (data.channel === 'market_btcusdt_kline_1min') {
          // 处理K线数据
          setPriceData(data);
        }
      } catch (error) {
        console.error('解析WebSocket消息失败:', error);
        console.log('原始消息:', message);
        console.log('消息类型:', typeof message);
        console.log('消息长度:', message.length);
      }
    };

    // 错误处理回调
    const handleError = (error: Event) => {
      console.error('WebSocket连接错误:', error);
    };

    // 连接成功后发送订阅消息
    ws.setOnConnectedCallback(() => {
      console.log('WebSocket连接成功，发送订阅请求');
      ws.send(JSON.stringify(event));
    });

    // 建立连接
    ws.connect(handleMessage, handleError);

    // 清理函数
    return () => {
      ws.close();
    };
  }, [publicInfo]);

  // 处理订单簿价格点击
  const handlePriceClick = (price: number) => {
    console.log('Price clicked:', price);
    // 这里可以将价格传递给交易组件
  };

  // 处理订单提交
  const handleOrderSubmit = async (orderData: any) => {
    console.log('Order submitted:', orderData);
    // 这里处理订单提交逻辑

 const res = await createOrder({

      contractId: "btc_usdt_perpetual",
      side: orderData.side,
      orderType: 1,
      price: orderData.price,
      volume: orderData.quantity, 
      transactionType: orderData.type,
      leverageLevel: orderData.leverage,
      marginModel: orderData.marginMode,
      onlyClose: false,
    });
    console.log('res:', res);

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
  const handleToggleFavorite = (contractName: string) => {
    setSymbolList(prev => 
      prev.map(item => 
        item.contractName === contractName 
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
                symbolList={symbolList}
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
              availableBalance={getAvailableUSDTBalance()} // 使用真实的USDT可用余额
              onOrderSubmit={handleOrderSubmit}
              onBalanceUpdate={getContractBalance} // 父组件的余额更新函数
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
