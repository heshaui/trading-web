"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button, Space, Tooltip, Image, MenuProps, Dropdown } from "antd";
import { useTranslation } from "next-i18next";
import { toast } from "sonner";
import appStore from "@/store";
import { createCoId, createOrder, getDepthMap } from "@/services/contract";
import TradingView from "../../compontents/Tradingview";
import ContractTradingPanel from "@/modules/contract/compontents/ContractTradingPanel";
import RiskDisclosureModal from "../../compontents/RiskDisclosureModal";
import SymbolSelector from "../../compontents/SymbolSelector";
import { OrderBookList, RealtimeTrade } from "../../compontents/OrderBook";
import WebSocketService from "@/utils/websocket";
import DepthChart from "@/components/DepthChart";
import { Iconify } from "@/components/icon";
import { FullscreenOutlined } from "@ant-design/icons";
import OrderList from "../../compontents/OrderList";
import WaterfallLayout, { WaterfallItem } from "@/components/WaterfallLayout";

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
  const [activeOrderTab, setActiveOrderTab] = useState("position"); // 持仓/订单切换
  const [showRiskDisclosure, setShowRiskDisclosure] = useState(false); // 风险确认书模态框
  const [currentSymbol, setCurrentSymbol] = useState("BTC/USDT 永续");
  const [depthData, setDepthData] = useState<any>(null);
  const [orderBookData, setOrderBookData] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  // 测试函数：模拟您提供的WebSocket数据格式
  const testOrderBookData = () => {
    const testData = {
      event_rep: "",
      channel: "market_e_btcusdt_depth_step0",
      data: null,
      tick: {
        asks: [
          [108350.5, 0.234],
          [108351.0, 0.156],
          [108352.5, 0.089],
          [108353.0, 0.234],
          [108354.5, 0.156],
        ],
        buys: [
          [108330.0, 0.234],
          [108329.5, 0.156],
          [108328.0, 0.089],
          [108327.5, 0.234],
          [108326.0, 0.156],
        ],
      },
      ts: 1753776193000,
      status: "ok",
    };
    setOrderBookData(testData);
    console.log("设置测试OrderBook数据:", testData);
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
    type?: "USD" | "COIN";
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

  // 安全获取公共数据 - 仅在客户端执行
  const [publicInfo, setPublicInfo] = useState<any>({});
  const [symbolList, setSymbolList] = useState<SymbolData[]>([]);

  useEffect(() => {
    setIsClient(true);

    // 只在客户端执行
    if (typeof window !== "undefined") {
      const info = appStore.getPublicInfo();
      setPublicInfo(info);

      if (info.contractList) {
        setSymbolList(info.contractList);
      }
    }
  }, []);

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
  const [currentContractInfo, setCurrentContractInfo] = useState<any>({});

  // 安全获取当前合约信息
  useEffect(() => {
    if (isClient && typeof window !== "undefined") {
      const contractInfo = appStore.getCurrentContractInfo();
      setCurrentContractInfo(contractInfo);
    }
  }, [isClient]);
  const getContractBalance = async () => {
    try {
      const accountList = await appStore.loadContractAssets();
      setContractAssets(accountList);
      console.log("Contract assets accountList:", accountList);
    } catch (error) {
      console.error("Failed to load contract assets:", error);
    }
  };

  // 获取特定币种的资产信息
  const getAssetBySymbol = (symbol: string): ContractAsset | undefined => {
    if (!contractAssets) return;
    return contractAssets.find((asset) => asset.symbol === symbol);
  };

  // 获取USDT资产可用余额，用于交易面板
  const getAvailableUSDTBalance = (): number => {
    const usdtAsset = getAssetBySymbol("USDT");
    return parseFloat(usdtAsset?.canUseAmount || "0");
  };

  const getDepthMapData = useCallback(async () => {
    if (!currentContractInfo.symbol) return;
    const res = await getDepthMap({
      symbol: currentContractInfo.symbol,
      contractId: currentContractInfo.id,
    });
    console.log("res:", res);
    setDepthData(res);
  }, [currentContractInfo.symbol, currentContractInfo.id]);

  useEffect(() => {
    getContractBalance();
    getDepthMapData();
  }, [getDepthMapData]);
  // 获取用户合约配置
  useEffect(() => {
    const loadUserConfig = async () => {
      if (publicInfo.contractList) {
        const userConfig = await appStore.loadUserConfig({
          contractId: currentContractInfo.id,
        });
        if (userConfig && userConfig.openContract !== 1) {
          setShowRiskDisclosure(true);
        }
      }
    };

    loadUserConfig();
  }, [publicInfo, currentContractInfo.id]);

  useEffect(() => {
    if (!publicInfo.wsUrl) return;

    const ws = new WebSocketService(publicInfo.wsUrl.replace(";", ""));
    // const event = {
    //   "event": "sub",
    //   "params": {
    //     "channel": "market_btcusdt_kline_1min",
    //     "cb_id": "btcusdt",
    //   }
    // };
    const event = {
      event: "sub",
      params: { channel: "market_e_btcusdt_depth_step0" },
    };

    // const event = {
    //   "event": "sub",
    //   "params": {
    //     "channel": "market_btcusdt_depth_step0",
    //     "cb_id": "btcusdt",
    //   }
    // };
    const event2 = {
      event: "sub",
      params: {
        channel: "market_e_btcusdt_kline_1day",
      },
    };

    const event3 = {
      event: "sub",
      params: {
        channel: "market_e_btcusdt_trade_ticker",
      },
    };

    // 消息处理回调
    const handleMessage = (message: string) => {
      try {
        console.log("收到原始消息长度:", message.length);
        console.log("消息前100字符:", message.substring(0, 100));

        // 如果消息看起来像是乱码，尝试打印十六进制
        if (message.includes("�") || message.length < 10) {
          console.log("消息可能是二进制数据，十六进制表示:");
          const encoder = new TextEncoder();
          const bytes = encoder.encode(message);
          console.log(
            Array.from(bytes.slice(0, 20))
              .map((b) => "0x" + b.toString(16).padStart(2, "0"))
              .join(" ")
          );
        }

        const data = JSON.parse(message);
        console.log("解析后的WebSocket消息:", data);

        // 这里可以处理接收到的数据，比如更新价格数据
        if (data.channel === "market_btcusdt_kline_1min") {
          // 处理K线数据
          setPriceData(data);
        } else if (data.channel === "market_e_btcusdt_depth_step0") {
          // 处理OrderBook深度数据
          console.log("收到OrderBook数据:", data);
          if (data.tick) {
            console.log("买单数据:", data.tick.buys);
            console.log("卖单数据:", data.tick.asks);
          }
          setOrderBookData(data);
        }
      } catch (error) {
        console.error("解析WebSocket消息失败:", error);
        console.log("原始消息:", message);
        console.log("消息类型:", typeof message);
        console.log("消息长度:", message.length);
      }
    };

    // 错误处理回调
    const handleError = (error: Event) => {
      console.error("WebSocket连接错误:", error);
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
    };

    // 这里处理订单提交逻辑

    const res = await createOrder(params);

    if (res.code === "0") {
      toast.success("订单提交成功");
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
      const res = await createCoId({
        contractId: publicInfo.contractList[0].id,
        openContract: 1,
      });
      if (res.code === "0") {
        toast.success("合约交易已开通");
      }
    } catch (error) {
      console.error("开通合约交易失败:", error);
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
    setSymbolList((prev) =>
      prev.map((item) =>
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
    isUp: true,
  };

  // 底部标签页配置
  const bottomTabItems = [
    {
      key: "position",
      label: t("contract:position"),
    },
    {
      key: "openOrders",
      label: t("contract:openOrders"),
    },
    {
      key: "orderHistory",
      label: t("contract:orderHistory"),
    },
    {
      key: "tradeHistory",
      label: t("contract:tradeHistory"),
    },
    {
      key: "assets",
      label: t("contract:assets"),
    },
  ];

  const handleChartTypeChange = (e: { key: string }) => {
    setChartDisplayType(Number(e.key));
  };

  // 如果不是客户端环境，返回加载中状态
  if (!isClient) {
    return <div>Loading...</div>;
  }

  const items: WaterfallItem[] = [
    {
      columnSpan: 3,
      height: 60,
      content: (
        <div className="flex items-center px-[16px] h-[100%] bg-[var(--background9)]">
          <SymbolSelector
            currentSymbol={currentSymbol}
            onSymbolSelect={handleSymbolSelect}
            symbolList={symbolList}
            onToggleFavorite={handleToggleFavorite}
          />
          <div className="w-[1px] h-[20px] bg-[var(--border-color4)] mx-[16px]"></div>
          <div className="flex gap-[24px] ml-[16px]">
            <div className="flex flex-col">
              <div
                className={`font-500 text-[14px] ${
                  mockPriceData.isUp
                    ? "text-[var(--success-color)]"
                    : "text-[var(--error-color)]"
                }`}
              >
                {mockPriceData.price}
              </div>
              <div
                className={`text-[12px] font-500 ${
                  mockPriceData.isUp
                    ? "text-[var(--success-color)]"
                    : "text-[var(--error-color)]"
                }`}
              >
                {mockPriceData.changePercent}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] text-[var(--text-color6)] font-[400]">
                标记价格
              </span>
              <span
                className={`text-[var(--text-color5)] font-500 text-[12px] ${
                  mockPriceData.isUp
                    ? "text-[var(--success-color)]"
                    : "text-[var(--error-color)]"
                }`}
              >
                {mockPriceData.change24h}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] text-[var(--text-color6)] font-[400]">
                指数价格
              </span>
              <span className="text-[var(--text-color5)] font-500 text-[12px]">
                {mockPriceData.high24h}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] text-[var(--text-color6)] font-[400]">
                资金费率/倒计时
              </span>
              <span className="text-[var(--text-color5)] font-500 text-[12px]">
                {mockPriceData.low24h}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] text-[var(--text-color6)] font-[400]">
                24H 成交量(张)
              </span>
              <span className="text-[var(--text-color5)] font-500 text-[12px]">
                {mockPriceData.volume24hUSD}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] text-[var(--text-color6)] font-[400]">
                24H 成交额(USD)
              </span>
              <span className="text-[var(--text-color5)] font-500 text-[12px]">
                <span
                  className={
                    mockPriceData.fundingRate.startsWith("+")
                      ? "text-[var(--success-color)]"
                      : mockPriceData.fundingRate.startsWith("-")
                      ? "text-[var(--error-color)]"
                      : ""
                  }
                >
                  {mockPriceData.fundingRate}
                </span>
                <span className="text-[var(--text-color6)] font-[400]">
                  {" "}
                  / {mockPriceData.fundingCountdown}
                </span>
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      columnSpan: 1,
      height: 380,
      content: (
        <div className="bg-[var(--background9)] h-[100%]">
          <OrderBookList orderBookData={orderBookData} />
        </div>
      ),
    },
    {
      columnSpan: 1,
      height: 530,
      content: (
        <div className="bg-[var(--background9)] h-[100%]">
          <ContractTradingPanel
            symbol={mockPriceData.symbol}
            lastPrice={parseFloat(mockPriceData.price.replace(/,/g, ""))}
            availableBalance={getAvailableUSDTBalance()} // 使用真实的USDT可用余额
            onOrderSubmit={handleOrderSubmit}
            onBalanceUpdate={getContractBalance} // 父组件的余额更新函数
          />
        </div>
      ),
    },
    {
      columnSpan: 3,
      height: 604,
      content: (
        <div className="bg-[var(--background9)] h-[100%]">
        <div className="flex-1 00%]">
          <div className="flex justify-between items-center p-[8px_16px] border-b-[1px_solid_var(--border-color1)]">
            <div className="flex items-center">
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
                        <div className="bg-[#fff] rounded-[8px] shadow-[0_2px_8px_rgba(0,0,0,0.15)] p-[10px] grid grid-cols-3 gap-[10px] w-[320px]">
                          {timeIntervalOptions.map((option) => (
                            <div
                              key={option}
                              onClick={(e) => {
                                e.stopPropagation();
                                setTimeInterval(option);
                              }}
                              className="p-[10px] text-center rounded-[5px] cursor-pointer text-[12px]"
                              style={{
                                background:
                                  timeInterval === option
                                    ? "var(--theme-color)"
                                    : "#f0f0f0",
                                color:
                                  timeInterval === option ? "#fff" : "#000",
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
                <Tooltip title={t("spot:spot.exchange.technicalIndicators")}>
                  <Image
                    src="/images/exchange/icon_chart.png"
                    alt="exchange"
                    width={20}
                    height={20}
                    preview={false}
                    onClick={() => tradingviewRef.current?.handleAddIndicator()}
                    style={{ cursor: "pointer" }}
                  />
                </Tooltip>
                <Tooltip title={t("spot:spot.exchange.resetChart")}>
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
                <Tooltip title={t("spot:spot.exchange.volumeDistribution")}>
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

              <Tooltip title={t("spot:spot.exchange.fullscreen")}>
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
          {activeChartType === "depth" && <DepthChart data={depthData} />}
        </div>
        </div>
      ),
    },
    {
      columnSpan: 1,
      height: 284,
      content: (
        <div className="bg-[var(--background9)] h-[100%]">
          <RealtimeTrade orderBookData={orderBookData} />
        </div>
      ),
    },
    {
      columnSpan: 1,
      height: 190,
      content: (
        <div className="p-[10px_16px] text-[14px] font-[400] bg-[var(--background9)] h-[100%]">
          <div className="text-[var(--text-color5)] font-[500] mb-[16px]">
            资产
          </div>
          <div className="flex flex-col gap-[10px] mb-[14px]">
            <div className="flex justify-between items-center">
              <div className="text-[var(--text-color6)]">总权益</div>
              <div className="text-[var(--text-color5)]">0.00 USDT</div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-[var(--text-color6)]">钱包余额</div>
              <div className="text-[var(--text-color5)]">0.00 USDT</div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-[var(--text-color6)]">未实现盈亏</div>
              <div className="text-[var(--text-color5)]">0.00 USDT</div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <Button
              type="primary"
              className="w-[144px] h-[32px] text-[var(--text-color5)] font-[500]"
              shape="round"
              style={{ background: "var(--btncolor6)" }}
            >
              划转
            </Button>
            <Button
              type="primary"
              className="w-[144px] h-[32px] text-[var(--text-color5)] font-[500]"
              shape="round"
              style={{ background: "var(--btncolor6)" }}
            >
              充值
            </Button>
          </div>
        </div>
      ),
    },
    {
      columnSpan: 4,
      minHeight: 400,
      content: (
        <div className="bg-[var(--background9)] h-[100%]">
          <OrderList />
        </div>
      ),
    },
    {
      columnSpan: 1,
      height: 300,
      content: (
        <div className="p-[10px_16px] text-[14px] font-[400] bg-[var(--background9)] h-[100%]">
          <div className="text-[var(--text-color5)] font-[500] mb-[16px]">
            合约信息
          </div>
          <div className="flex flex-col gap-[10px]">
            <div className="flex justify-between items-center">
              <div className="text-[var(--text-color6)]">合约代号</div>
              <div className="text-[var(--text-color5)]">BTCUSDT</div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-[var(--text-color6)]">交割日期</div>
              <div className="text-[var(--text-color5)]">永续</div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-[var(--text-color6)]">合约标的</div>
              <div className="text-[var(--text-color5)]">BTCUSDT 指数</div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-[var(--text-color6)]">保证金币种</div>
              <div className="text-[var(--text-color5)]">USDT</div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-[var(--text-color6)]">合约面值</div>
              <div className="text-[var(--text-color5)]">0.0001 BTC</div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-[var(--text-color6)]">最小价格变动单位</div>
              <div className="text-[var(--text-color5)]">0.0001 BTC</div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-[var(--text-color6)]">最低维持保证金率</div>
              <div className="text-[var(--text-color5)]">0.40%</div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* 瀑布流布局 */}
      <div className="bg-[var(--background14)]">
        <WaterfallLayout items={items} gap={4} />
      </div>

      {/* 风险确认书模态框 */}
      <RiskDisclosureModal
        open={showRiskDisclosure}
        onCancel={handleRiskDisclosureCancel}
        onConfirm={handleRiskDisclosureConfirm}
      />
    </>
  );
};

export default TradePage;
