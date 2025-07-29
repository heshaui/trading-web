"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { ConfigProvider, Form, Button, Space, Tooltip, Dropdown, Select, Tabs, Input, TabsProps, Image, MenuProps } from "antd";
import { useTranslation } from "next-i18next";
import { toast } from "sonner";
import appStore from "@/store";
import { useAuth } from "@/context/AuthContext";
import { createCoId, createOrder, getDepthMap } from "@/services/contract";
import TradingView from "../../compontents/Tradingview";
import { SearchOutlined } from '@ant-design/icons';
import OrderBook from "../../compontents/OrderBook";
import ContractTradingPanel from "@/modules/contract/compontents/ContractTradingPanel";
import RiskDisclosureModal from "../../compontents/RiskDisclosureModal";
import SymbolSelector from "../../compontents/SymbolSelector";
import OrderList from "../../compontents/OrderList";
import styles from "./trade.module.css";
import WebSocketService from "@/utils/websocket";
import DepthChart from "@/components/DepthChart";
import { Iconify } from "@/components/icon";
import { FullscreenOutlined } from "@ant-design/icons";

// TradingView组件引用类型
interface TradingviewRefHandle {
  handleAddIndicator: () => void;
  resetChart: () => void;
  toggleFullScreen: () => void;
  addVolumeDistribution: () => void;
}


const TradePage = () => {
  const { t } = useTranslation(["contract", "spot", "common"]);
  const [currentPair, setCurrentPair] = useState<any>(null);
  const [priceData, setPriceData] = useState<any>(null);
  const [activeOrderTab, setActiveOrderTab] = useState('position'); // 持仓/订单切换
  const [showRiskDisclosure, setShowRiskDisclosure] = useState(false); // 风险确认书模态框
  const [currentSymbol, setCurrentSymbol] = useState("BTC/USDT 永续");
  const [depthData, setDepthData] = useState<any>(null);
  const [orderBookData, setOrderBookData] = useState<any>(null);

  // 测试函数：模拟您提供的WebSocket数据格式
  const testOrderBookData = () => {
    const testData = {
      "event_rep": "",
      "channel": "market_e_btcusdt_depth_step0",
      "data": null,
      "tick": {
        "asks": [
          [108350.5, 0.234],
          [108351.0, 0.156], 
          [108352.5, 0.089],
          [108353.0, 0.234],
          [108354.5, 0.156]
        ],
        "buys": [
          [108330.0, 0.234],
          [108329.5, 0.156],
          [108328.0, 0.089], 
          [108327.5, 0.234],
          [108326.0, 0.156]
        ]
      },
      "ts": 1753776193000,
      "status": "ok"
    };
    setOrderBookData(testData);
    console.log('设置测试OrderBook数据:', testData);
  };

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
  const [activeChartType, setActiveChartType] = useState<string>("basic");
  const tradingviewRef = useRef<TradingviewRefHandle>(null);

  const [chartType, setChartType] = useState<any[]>([]);

  // 初始化图表类型选项
  useEffect(() => {
    setChartType([
      { label: t("spot:spot.label.kline"), value: "basic" },
      // { label: 'TradingView', value: 'tradingview' },
      { label: t("spot:spot.label.depth"), value: "depth" },
    ]);
  }, [t]);

  const chartTypeItems: MenuProps["items"] = [
    {
      key: 1,
      label: (
        <span style={{ fontSize: "12px" }}>
          {/* K线图 */}
          {t("spot:spot.exchange.kLine")}
        </span>
      ),
    },
    {
      key: 8,
      label: (
        <span style={{ fontSize: "12px" }}>
          {/* 美国线 */}
          {t("spot:spot.exchange.usdLine")}
        </span>
      ),
    },
    {
      key: 13,
      label: (
        <span style={{ fontSize: "12px" }}>
          {/* 面积图 */}
          {t("spot:spot.exchange.areaLine")}
        </span>
      ),
    },
    {
      key: 3,
      label: (
        <span style={{ fontSize: "12px" }}>
          {/* 线型图 */}
          {t("spot:spot.exchange.lineType")}
        </span>
      ),
    },
  ];
  const [timeInterval, setTimeInterval] = useState<string>("1D");
  const [dayData, setDayData] = useState<any[]>(["15m", "1h", "4h", "1D"]);
  const [timeIntervalOptions, setTimeIntervalOptions] = useState<any[]>([
    "1m",
    "5m",
    "15m",
    "30m",
    "1h",
    "2h",
    "4h",
    "6h",
    "8h",
    "12h",
    "1D",
    "3D",
    "1W",
    "1M",
    "1Y",
  ]);
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
  const [chartDisplayType, setChartDisplayType] = useState<number>(1);

  const [contractAssets, setContractAssets] = useState<ContractAsset[]>([]);

  const currentContractInfo = appStore.getCurrentContractInfo();
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


  const getDepthMapData = async () => {
    const res = await getDepthMap({ symbol: currentPair?.symbol || "BTCUSDT", contractId: currentContractInfo.id });
    console.log('res:', res);
    setDepthData(res);
  };

  useEffect(() => {
    getContractBalance();
    getDepthMapData();
    // 设置测试OrderBook数据
    testOrderBookData();
  }, []);
  // 获取用户合约配置
  useEffect(() => {
    const loadUserConfig = async () => {
      if (publicInfo.contractList) {
        const userConfig = await appStore.loadUserConfig({ contractId: currentContractInfo.id });
        if (userConfig.openContract !== 1) {
          setShowRiskDisclosure(true);
        }
      }
    };

    loadUserConfig();
  }, [publicInfo]);

  useEffect(() => {
    if (!publicInfo.wsUrl) return;

    const ws = new WebSocketService(publicInfo.wsUrl.replace(';', ''));
    // const event = {
    //   "event": "sub",
    //   "params": {
    //     "channel": "market_btcusdt_kline_1min",
    //     "cb_id": "btcusdt",
    //   }
    // };
    const event = { "event": "sub", "params": { "channel": "market_e_btcusdt_depth_step0" } }

    // const event = {
    //   "event": "sub",
    //   "params": {
    //     "channel": "market_btcusdt_depth_step0",
    //     "cb_id": "btcusdt",
    //   }
    // };
    const event2 = {
      "event": "sub",
      "params": {
        "channel": "market_e_btcusdt_kline_1D",
      }
    };

    const event3 = {
      "event": "sub",
      "params": {
        "channel": "market_e_btcusdt_trade_ticker",
      }
    }


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
        } else if (data.channel === 'market_e_btcusdt_depth_step0') {
          // 处理OrderBook深度数据
          console.log('收到OrderBook数据:', data);
          if (data.tick) {
            console.log('买单数据:', data.tick.buys);
            console.log('卖单数据:', data.tick.asks);
          }
          setOrderBookData(data);
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
      ws.send(JSON.stringify(event));
      ws.send(JSON.stringify(event2));
      ws.send(JSON.stringify(event3));
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
    // 这里可以将价格传递给交易组件
  };

  // 处理订单提交
  const handleOrderSubmit = async (orderData: any) => {
    const params = {
      contractId: appStore.getCurrentContractInfo().id,
      ...orderData,

    }

    // 这里处理订单提交逻辑

    const res = await createOrder(params);

    if (res.code === '0') {
      toast.success('订单提交成功');
    } else {
      toast.error(res.msg);
    }
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
      const res = await createCoId({ contractId: publicInfo.contractList[0].id, openContract: 1 });
      if (res.code === '0') {
        toast.success('合约交易已开通');
      }
    } catch (error) {
      console.error('开通合约交易失败:', error);
    }
  };

  // 处理币种选择
  const handleSymbolSelect = (item: SymbolData) => {

    appStore.setCurrentContractInfo(item.id);
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

  const handleChartTypeChange = (e: { key: string }) => {
    setChartDisplayType(Number(e.key));
  };
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

          <div className={styles.chartContainer}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 16px",
                borderBottom: "1px solid var(--border-color1)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                {dayData.map((item, index) => (
                  <Button
                    key={index}
                    type={timeInterval === item ? "primary" : "text"}
                    onClick={() => setTimeInterval(item)}
                    style={{
                      fontSize: "12px",
                      background:
                        timeInterval === item
                          ? "rgba(0,0,0,0.05)"
                          : "transparent",
                      color:
                        timeInterval === item
                          ? "var(--text-color5)"
                          : "var(--text-color6)",
                    }}
                  >
                    {item}
                    {item === "1D" && (
                      <Dropdown
                        trigger={["hover"]}
                        placement="bottomRight"
                        dropdownRender={() => (
                          <div
                            style={{
                              background: "#fff",
                              borderRadius: "8px",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                              padding: "10px",
                              display: "grid",
                              gridTemplateColumns: "repeat(3, 1fr)",
                              gap: "10px",
                              width: "320px",
                            }}
                          >
                            {timeIntervalOptions.map((option) => (
                              <div
                                key={option}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTimeInterval(option);
                                }}
                                style={{
                                  padding: "10px",
                                  textAlign: "center",
                                  background:
                                    timeInterval === option
                                      ? "var(--theme-color)"
                                      : "#f0f0f0",
                                  color:
                                    timeInterval === option ? "#fff" : "#000",
                                  borderRadius: "5px",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                }}
                              >
                                {option}
                              </div>
                            ))}
                          </div>
                        )}
                      >
                        <Iconify
                          icon="eva:arrow-down-fill"
                          style={{
                            fontSize: "12px",
                            marginLeft: "4px",
                            cursor: "pointer",
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Dropdown>
                    )}
                  </Button>
                ))}

                <Space size="small" style={{ marginLeft: "16px" }}>
                  <Dropdown
                    menu={{
                      items: chartTypeItems,
                      onClick: handleChartTypeChange,
                      selectedKeys: [String(chartDisplayType)],
                    }}
                    trigger={["hover"]}
                    placement="bottom"
                  >
                    <Image
                      src="/images/exchange/icon_stock.png"
                      alt="exchange"
                      width={20}
                      height={20}
                      preview={false}
                      style={{ cursor: "pointer" }}
                    />
                  </Dropdown>
                  <Tooltip
                    title={t("spot:spot.exchange.technicalIndicators")}
                    overlayInnerStyle={{ fontSize: "12px" }}
                  >
                    <Image
                      src="/images/exchange/icon_chart.png"
                      alt="exchange"
                      width={20}
                      height={20}
                      preview={false}
                      onClick={() =>
                        tradingviewRef.current?.handleAddIndicator()
                      }
                      style={{ cursor: "pointer" }}
                    />
                  </Tooltip>
                  <Tooltip
                    title={t("spot:spot.exchange.resetChart")}
                    overlayInnerStyle={{ fontSize: "12px" }}
                  >
                    <Image
                      src="/images/exchange/icon_delete.png"
                      alt="exchange"
                      width={20}
                      height={20}
                      preview={false}
                      onClick={() => tradingviewRef.current?.resetChart()}
                      style={{ cursor: "pointer" }}
                    />
                  </Tooltip>
                  {/* <Tooltip title="图表截图">
                                            <Image src="/images/exchange/icon_camera.png" alt="exchange" width={20} height={20}  onClick={() => tradingviewRef.current?.handleChartScreenshot()}/>
                                        </Tooltip> 暂时注释 ---2025。04.28 -zyj */}
                  <Tooltip
                    title={t("spot:spot.exchange.volumeDistribution")}
                    overlayInnerStyle={{ fontSize: "12px" }}
                  >
                    <Image
                      src="/images/exchange/icon_value.png"
                      alt="exchange"
                      width={20}
                      height={20}
                      preview={false}
                      onClick={() =>
                        tradingviewRef.current?.addVolumeDistribution()
                      }
                      style={{ cursor: "pointer" }}
                    />
                  </Tooltip>
                </Space>
              </div>

              <div style={{ display: "flex", alignItems: "center" }}>
                {chartType.map((item, index) => (
                  <Button
                    key={index}
                    type={activeChartType === item.value ? "primary" : "text"}
                    onClick={() => setActiveChartType(item.value)}
                    style={{
                      fontSize: "12px",
                      background:
                        activeChartType === item.value
                          ? "rgba(0,0,0,0.05)"
                          : "transparent",
                      color:
                        activeChartType === item.value
                          ? "var(--text-color5)"
                          : "var(--text-color6)",
                    }}
                  >
                    {item.label}
                  </Button>
                ))}

                <Tooltip
                  title={t("spot:spot.exchange.fullscreen")}
                  overlayInnerStyle={{ fontSize: "12px" }}
                >
                  <Button
                    type="text"
                    icon={<FullscreenOutlined />}
                    onClick={() => tradingviewRef.current?.toggleFullScreen()}
                  />
                </Tooltip>
              </div>
            </div>

            {/* K线图容器 */}
            {activeChartType === "basic" && (
              <TradingView
                symbol={currentPair?.symbol || "BTCUSDT"}
                showLeftToolbar={false}
                chartType={9}
                timeInterval="15m"
              />
            )}
            {activeChartType === "depth" && (
              <div className={styles.depthChartContainer}>
                <DepthChart data={depthData} />
              </div>
            )}
          </div>
        </div>

        {/* 中间 - 订单簿 */}
        <div className={styles.centerPanel}>
          <div className={styles.orderBookContainer}>
            <OrderBook orderBookData={orderBookData} />
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

      {/* 底部 - 订单列表 */}
      <div className={styles.bottomPanel}>
        <OrderList />
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
