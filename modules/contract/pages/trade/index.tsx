"use client";
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "next-i18next";
import { toast } from "sonner";

import ContractTradingPanel from "./components/ContractTradingPanel";
import RiskDisclosureModal from "./components/RiskDisclosureModal";
import ContractHeader from "./components/ContractHeader";
import { OrderBookList, RealtimeTrade } from "./components/OrderBook";
import ContractInfo from "./components/ContractInfo";
import ContractAsset from "./components/ContractAsset";
import OrderList from "./components/OrderList";
import ContractKlineChart from "./components/ContractKlineChart";

import WebSocketService from "@/utils/websocket";
import WaterfallLayout, { WaterfallItem } from "@/components/WaterfallLayout";
import appStore from "@/store";
import {
  createCoId,
  createOrder,
  getPublicMarketInfo,
} from "@/services/contract";

import { getUserBalanceAll } from "@/services/assets";
import { useAuth } from "@/context/AuthContext";

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

// 原始K线数据项接口
interface KlineDataItem {
  amount: number;
  close: number;
  ds: string; // 时间字符串 "2025-08-21 11:58:00"
  high: number;
  id: number;
  low: number;
  open: number;
  tradeId: number;
  vol: number;
}

// 转换后的K线数据项接口（用于TradingView）
interface ConvertedKlineItem {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// K线WebSocket响应接口
interface KlineResponse {
  event_rep: string;
  channel: string;
  data: KlineDataItem[];
  tick: null;
  ts: number;
  status: string;
}

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
const TradePage = () => {
  const { t } = useTranslation(["contract", "spot", "common"]);

  const { isLoggedIn } = useAuth();
  const orderListRef = useRef<any>(null);
  const [showRiskDisclosure, setShowRiskDisclosure] = useState(false); // 风险确认书模态框
  const [orderBookData, setOrderBookData] = useState<any>(null); // 订单簿数据
  const [isClient, setIsClient] = useState(false); // 是否是客户端
  const [contractAssets, setContractAssets] = useState<ContractAsset[]>([]); // 合约账户数据
  const [currentContractInfo, setCurrentContractInfo] = useState<any>({}); // 当前合约信息
  const [publicInfo, setPublicInfo] = useState<any>({}); // 公共数据
  const [symbolList, setSymbolList] = useState<SymbolData[]>([]); // 币种列表
  const [priceData, setPriceData] = useState<any>(null); // 价格数据
  const [klineData, setKlineData] = useState<any>(null); // K线数据
  const [currentTimeInterval, setCurrentTimeInterval] = useState<string>("1day"); // 当前时间间隔

  const [spotBalance, setSpotBalance] = useState<any[]>([]); // 现货账户余额数组


  // 获取现货账户余额
  const getSpotBalance = async () => {
    try {
      const res = await getUserBalanceAll();
      console.log("getUserBalanceAll response:", res);
      console.log("getUserBalanceAll res.data:", res.data);
      console.log("getUserBalanceAll res.data type:", typeof res.data);

      if (res.code === "0" && Array.isArray(res.data)) {
        setSpotBalance(res.data);
      } else {
        console.error("获取现货余额失败:", res);
        setSpotBalance([]);
      }
    } catch (error) {
      console.error("获取现货余额异常:", error);
      setSpotBalance([]);
    }
  };

  // 获取合约账户余额
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
      orderListRef.current.getOrdinaryCommission();
      orderListRef.current.getPosition();
    } else {
      toast.error(res.msg);
    }
  };

  // 处理风险确认书取消
  const handleRiskDisclosureCancel = () => {
    setShowRiskDisclosure(false);
  };

  // 处理风险确认书确认
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

  // 转换时间间隔格式：从组件格式转换为WebSocket格式
  const convertTimeInterval = (interval: string): string => {
    const intervalMap: { [key: string]: string } = {
      "1m": "1min",
      "5m": "5min",
      "15m": "15min",
      "30m": "30min",
      "1h": "60min",
      "1day": "1day",
      "1D": "1day",
      "1W": "1week",
      "1M": "1month",
    };
    return intervalMap[interval] || "1day";
  };

  // 处理时间间隔变化
  const handleTimeIntervalChange = (interval: string) => {
    console.log("时间间隔变化:", interval);
    setCurrentTimeInterval(interval);
    // 这里可以添加其他逻辑，比如重新订阅WebSocket或更新K线数据
  };

  // 模拟价格数据
  const mockPriceData = {
    symbol: "BTCUSDT",
    price: "0",
    priceUsd: "0",
    changePercent: "0",
    change24h: "0",
    high24h: "0",
    low24h: "0",
    volume24h: "0",
    markPrice: "0",
    indexPrice: "0",
    fundingRate: "0",
    fundingCountdown: "00:00:00",
    volume24hUSD: "0",
    isUp: true,
  };

  const items: WaterfallItem[] = [
    {
      columnSpan: 3,
      height: 60,
      content: <ContractHeader mockPriceData={priceData || mockPriceData} />,
    },
    {
      columnSpan: 1,
      height: 380,
      content: <OrderBookList orderBookData={orderBookData} />,
    },
    {
      columnSpan: 1,
      minHeight: 522,
      content: (
        <ContractTradingPanel
          symbol={currentContractInfo.symbol || mockPriceData.symbol}
          lastPrice={parseFloat((priceData?.price || mockPriceData.price).toString().replace(/,/g, ""))}
          availableBalance={getAvailableUSDTBalance()} // 使用真实的USDT可用余额
          spotBalance={spotBalance}
          contractBalance={contractAssets}
          onOrderSubmit={handleOrderSubmit} // 父组件的订单提交函数
          onBalanceUpdate={getContractBalance} // 父组件的余额更新函数
        />
      ),
    },
    {
      columnSpan: 3,
      height: 604,
      content: (
        <ContractKlineChart
          currentContractInfo={currentContractInfo}
          klineData={klineData}
          onTimeIntervalChange={handleTimeIntervalChange}
        />
      ),
    },
    {
      columnSpan: 1,
      height: 284,
      content: <RealtimeTrade orderBookData={orderBookData} />,
    },
    ...(isLoggedIn
      ? [
        {
          columnSpan: 1,
          height: 190,
          content: (
            <ContractAsset
              spotBalance={spotBalance}
              contractBalance={contractAssets}
              onBalanceUpdate={getContractBalance}
            />
          ),
        },
      ]
      : []),
    {
      columnSpan: 4,
      minHeight: 400,
      content: <OrderList ref={orderListRef} />,
    },
    {
      columnSpan: 1,
      height: 300,
      content: <ContractInfo />,
    },
  ];

  // 初始化数据和客户端状态
  useEffect(() => {
    const initializeClientData = async () => {
      setIsClient(true);

      // 只在客户端执行
      if (typeof window !== "undefined") {
        // 获取公共数据
        const info = appStore.getPublicInfo();
        setPublicInfo(info);

        if (info.contractList) {
          setSymbolList(info.contractList);
        }

        // 获取当前合约信息
        const contractInfo = appStore.getCurrentContractInfo();
        setCurrentContractInfo(contractInfo);

        // 获取账户余额
        getContractBalance();
        getSpotBalance();

        // 获取用户合约配置
        if (info.contractList && contractInfo.id) {
          try {
            const userConfig = await appStore.loadUserConfig({
              contractId: contractInfo.id,
            });
            if (userConfig && userConfig.openContract !== 1) {
              setShowRiskDisclosure(true);
            }
          } catch (error) {
            console.error("获取用户合约配置失败:", error);
          }
        }
      }
    };

    initializeClientData();
  }, []);

  // 监听store中currentContractInfo的变化
  useEffect(() => {
    const checkContractInfoChange = () => {
      const storeContractInfo = appStore.getCurrentContractInfo();
      // 只有当store中的合约信息与当前state不同时才更新
      if (storeContractInfo && storeContractInfo.id !== currentContractInfo.id) {
        console.log("检测到合约切换:", storeContractInfo);

        // 清理旧的数据状态
        setOrderBookData(null);
        setPriceData(null);
        setKlineData(null);

        // 更新合约信息
        setCurrentContractInfo(storeContractInfo);

        // 重新获取账户余额（因为可能需要不同的保证金币种）
        getContractBalance();
      }
    };

    // 使用轮询方式检查store变化（简单方案）
    const interval = setInterval(checkContractInfoChange, 100);

    return () => clearInterval(interval);
  }, [currentContractInfo.id]);

  // WebSocket连接和数据订阅
  useEffect(() => {
    // 检查必要的数据是否已准备好
    if (!publicInfo.wsUrl || !currentContractInfo.id || !currentContractInfo.contractType || !currentContractInfo.symbol) {
      console.log("WebSocket连接条件不满足:", {
        wsUrl: !!publicInfo.wsUrl,
        contractId: !!currentContractInfo.id,
        contractType: !!currentContractInfo.contractType,
        symbol: !!currentContractInfo.symbol
      });
      return;
    }

    console.log("开始建立WebSocket连接，合约信息:", currentContractInfo);
    const ws = new WebSocketService(publicInfo.wsUrl.replace(";", ""));

    // 获取当前时间间隔对应的WebSocket格式
    const wsTimeInterval = convertTimeInterval(currentTimeInterval);
    console.log("WebSocket订阅时间间隔:", wsTimeInterval);
    console.log("currentContractInfo:", currentContractInfo);
    // 订单簿数据
    const depthEvent = {
      event: "sub",
      // params: { channel: "market_e_btcusdt_depth_step0" },
      params: { channel: `market_${currentContractInfo.contractType.toLowerCase()}_${currentContractInfo.symbol.replace("-", "").toLowerCase()}_depth_step0` },
      cb_id: "btcusdt",
    };

    // 交易数据
    const tradeEvent = {
      event: "sub",
      params: {
        // channel: "market_e_btcusdt_trade_ticker",
        channel: `market_${currentContractInfo.contractType.toLowerCase()}_${currentContractInfo.symbol.replace("-", "").toLowerCase()}_trade_ticker`,
        cb_id: "btcusdt",
      },
    };

    // 价格数据
    const priceEvent = {
      event: "sub",
      params: {
        // channel: "market_price_e_btcusdt",
        channel: `market_price_${currentContractInfo.contractType.toLowerCase()}_${currentContractInfo.symbol.replace("-", "").toLowerCase()}`,
        cb_id: "btcusdt",
      },
    };

    // Ticker数据
    const tickerEvent = {
      event: "sub",
      params: {
        // channel: "market_e_btcusdt_ticker",
        channel: `market_${currentContractInfo.contractType.toLowerCase()}_${currentContractInfo.symbol.replace("-", "").toLowerCase()}_ticker`,
        cb_id: "btcusdt",
      },
    };

    // 实时交易数据
    const realtimeTradeEvent = {
      event: "sub",
      params: {
        // channel: "market_e_btcusdt_trade_ticker",
        channel: `market_${currentContractInfo.contractType.toLowerCase()}_${currentContractInfo.symbol.replace("-", "").toLowerCase()}_trade_ticker`,
        cb_id: "btcusdt",
        top: 100
      },
    };

    // K线数据请求（获取历史数据）
    const klineReqEvent = {
      event: "req",
      params: {
        // channel: `market_e_btcusdt_kline_${wsTimeInterval}`,
        channel: `market_${currentContractInfo.contractType.toLowerCase()}_${currentContractInfo.symbol.replace("-", "").toLowerCase()}_kline_${wsTimeInterval}`,
        cb_id: "btcusdt",
      },
    };

    // K线数据订阅（获取实时更新）
    const klineSubEvent = {
      event: "sub",
      params: {
        // channel: `market_e_btcusdt_kline_${wsTimeInterval}`,
        channel: `market_${currentContractInfo.contractType.toLowerCase()}_${currentContractInfo.symbol.replace("-", "").toLowerCase()}_kline_${wsTimeInterval}`,
        cb_id: "btcusdt",
      },
    };

    // 消息处理回调
    const handleMessage = (message: string) => {
      try {


        // 如果消息看起来像是乱码，尝试打印十六进制
        if (message.includes("�") || message.length < 10) {
          const encoder = new TextEncoder();
          const bytes = encoder.encode(message);

        }

        const data = JSON.parse(message);
        console.log("解析后的WebSocket消息:", data);

        // 处理K线数据 - 动态检查不同时间间隔的K线数据
        if (data.channel && data.channel.includes("_kline_")) {
          console.log("收到K线数据:", data);
          // 直接传递原始WebSocket数据给TradingView组件处理
          setKlineData(data);

          // 更新价格数据
          if (data.event_rep === "rep" && data.data && Array.isArray(data.data)) {
            const latestKline = data.data[data.data.length - 1];
            if (latestKline) {
              setPriceData((prevPriceData: any) => ({
                ...prevPriceData,
                price: latestKline.close.toString(),
                high24h: Math.max(...data.data.map((k: any) => k.high)).toString(),
                low24h: Math.min(...data.data.map((k: any) => k.low)).toString(),
                volume24h: data.data.reduce((sum: number, k: any) => sum + k.vol, 0).toString(),
              }));
            }
          } else if (data.tick && typeof data.tick === 'object') {
            setPriceData((prevPriceData: any) => ({
              ...prevPriceData,
              price: data.tick.close.toString(),
            }));
          }
        } else if (data.channel && data.channel.includes("_depth_step0")) {
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
      ws.send(JSON.stringify(depthEvent));
      ws.send(JSON.stringify(tradeEvent));
      ws.send(JSON.stringify(priceEvent));
      ws.send(JSON.stringify(tickerEvent));
      ws.send(JSON.stringify(realtimeTradeEvent));
      ws.send(JSON.stringify(klineReqEvent));
      ws.send(JSON.stringify(klineSubEvent));
      console.log("已订阅K线数据:", klineSubEvent.params.channel);
    });

    // 建立连接
    ws.connect(handleMessage, handleError);

    // 清理函数
    return () => {
      console.log("关闭WebSocket连接");
      ws.close();
    };
  }, [publicInfo.wsUrl, currentContractInfo, currentTimeInterval]);

  // 如果不是客户端环境，返回加载中状态
  if (!isClient) {
    return <div></div>;
  }

  return (
    <>
      {/* 瀑布流布局 */}
      <div className="bg-[var(--background14)] min-w-[1440px]">

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
