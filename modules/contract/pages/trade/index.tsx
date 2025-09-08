"use client";
import React, { useState, useEffect, useRef, useCallback, use } from "react";
import { useTranslation } from "next-i18next";
import { toast } from "sonner";

import ContractTradingPanel from "./components/ContractTradingPanel";
import RiskDisclosureModal from "./components/RiskDisclosureModal";
import ContractHeader from "./components/ContractHeader";
import { OrderBookList, RealtimeTrade } from "./components/OrderBook";
import ContractInfoBox from "./components/ContractInfoBox";
import ContractAsset from "./components/ContractAsset";
import OrderList from "./components/OrderList";
import ContractKlineChart from "./components/ContractKlineChart";

import WebSocketService from "@/utils/websocket";
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

  // 从 localStorage 读取初始时间间隔，与 ContractKlineChart 保持一致
  const getInitialTimeInterval = () => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('contract_kline_time_interval');
      // 确保缓存的值是有效的，如果不是则使用默认值
      const validIntervals = ["1m", "5m", "15m", "30m", "1h", "1D", "1W", "1M"];
      return (cached && validIntervals.includes(cached)) ? cached : "1D";
    }
    return "1D";
  };

  const { isLoggedIn } = useAuth();
  const orderListRef = useRef<any>(null);
  const priceSetterRef = useRef<((price: number) => void) | null>(null); // 价格设置函数ref
  const currentTimeIntervalRef = useRef<string>(getInitialTimeInterval()); // 使用 ref 存储当前时间间隔
  const [showRiskDisclosure, setShowRiskDisclosure] = useState(false); // 风险确认书模态框
  const [orderBookData, setOrderBookData] = useState<any>(null); // 订单簿数据
  const [isClient, setIsClient] = useState(false); // 是否是客户端
  const [contractAssets, setContractAssets] = useState<ContractAsset[]>([]); // 合约账户数据
  const [currentContractInfo, setCurrentContractInfo] = useState<any>({}); // 当前合约信息
  const [publicInfo, setPublicInfo] = useState<any>({}); // 公共数据
  const [symbolList, setSymbolList] = useState<SymbolData[]>([]); // 币种列表
  const [priceData, setPriceData] = useState<any>(null); // 价格数据
  const [klineData, setKlineData] = useState<any>(null); // K线数据
  const [currentTimeInterval, setCurrentTimeInterval] =
    useState<string>(getInitialTimeInterval()); // 当前时间间隔
  const [wsInstance, setWsInstance] = useState<WebSocketService | null>(null); // WebSocket实例
  const [depthPrecision, setDepthPrecision] = useState<number>(0); // 深度精度

  const [spotBalance, setSpotBalance] = useState<any[]>([]); // 现货账户余额数组
  const [realtimeTradeData, setRealtimeTradeData] = useState<any[]>([]); // 实时交易数据


  // 获取现货账户余额
  const getSpotBalance = async () => {
    try {
     
      const res = await getUserBalanceAll();
     
   
      if (res.code === "0" && Array.isArray(res.data)) {
        setSpotBalance(res.data);
      } else {
        setSpotBalance([]);
      }
    } catch (error) {
      setSpotBalance([]);
    }
  };

  // 获取合约账户余额
  const getContractBalance = useCallback(async () => {
    try {
      const accountList = await appStore.loadContractAssets();
      setContractAssets(accountList);
    } catch (error) { }
  }, []);

  // 获取特定币种的资产信息
  const getAssetBySymbol = (symbol: string): ContractAsset | undefined => {
    if (!contractAssets) return;
    return contractAssets.find((asset) => asset.symbol === symbol);
  };

  // 获取USDT资产可用余额，用于交易面板
  const getAvailableUSDTBalance = (): number => {
    // 如果保证金币种还没有加载，返回0
    if (!currentContractInfo.marginCoin) {
      return 0;
    }
    const usdtAsset = getAssetBySymbol(currentContractInfo.marginCoin);
    return parseFloat(usdtAsset?.canUseAmount || "0");
  };

  // 使用useMemo来计算可用余额，确保在相关状态变化时重新计算
  const availableBalance = React.useMemo(() => {
    return getAvailableUSDTBalance();
  }, [currentContractInfo.marginCoin, contractAssets]);

  // 处理订单提交
  const handleOrderSubmit = async (orderData: any) => {
    const params = {
      contractId: appStore.getCurrentContractInfo().id,
      ...orderData,
    };

    // 这里处理订单提交逻辑

    const res = await createOrder(params);

    if (res.code === "0") {
      toast.success(t("contract:orderSubmitSuccess"));
      // 更新仓位
      orderListRef.current.getPosition();
      // 更新普通委托
      orderListRef.current.getOrdinaryCommission();
      // 更新历史委托
      orderListRef.current.getHistoryCommission();
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
        toast.success(t("contract:contractOpenSuccess"));
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

  // 发送WebSocket取消订阅消息
  const sendUnsubscriptions = useCallback((ws: WebSocketService, contractInfo: any, timeInterval: string, precision: number = depthPrecision) => {
    if (!contractInfo.id || !contractInfo.contractType || !contractInfo.symbol) {
      return;
    }

    const wsTimeInterval = convertTimeInterval(timeInterval);


    // 取消订单簿数据订阅
    const unsubDepthEvent = {
      event: "unsub",
      params: { channel: `market_${contractInfo.contractType.toLowerCase()}_${contractInfo.symbol.replace("-", "").toLowerCase()}_depth_step${precision}` },
      cb_id: contractInfo.symbol.toLowerCase(),
    };
    // 取消交易数据订阅


    // 取消价格数据订阅
    const unsubPriceEvent = {
      event: "unsub",
      params: {
        channel: `market_price_${contractInfo.contractType.toLowerCase()}_${contractInfo.symbol
          .replace("-", "")
          .toLowerCase()}`,
        cb_id: contractInfo.symbol.toLowerCase(),
      },
    };

    // 取消Ticker数据订阅
    const unsubTickerEvent = {
      event: "unsub",
      params: {
        channel: `market_${contractInfo.contractType.toLowerCase()}_${contractInfo.symbol
          .replace("-", "")
          .toLowerCase()}_ticker`,
        cb_id: contractInfo.symbol.toLowerCase(),
      },
    };

    // 取消实时交易数据订阅
    const unsubRealtimeTradeEvent = {
      event: "unsub",
      params: {
        channel: `market_${contractInfo.contractType.toLowerCase()}_${contractInfo.symbol
          .replace("-", "")
          .toLowerCase()}_trade_ticker`,
        cb_id: contractInfo.symbol.toLowerCase(),
        top: 100,
      },
    };

    // 取消K线数据订阅
    const unsubKlineSubEvent = {
      event: "unsub",
      params: {
        channel: `market_${contractInfo.contractType.toLowerCase()}_${contractInfo.symbol
          .replace("-", "")
          .toLowerCase()}_kline_${wsTimeInterval}`,
        cb_id: contractInfo.symbol.toLowerCase(),
      },
    };

    // 取消交易数据订阅
    const unsubTradeEvent = {
      event: "unsub",
      params: {
        channel: `market_${contractInfo.contractType.toLowerCase()}_${contractInfo.symbol.replace("-", "").toLowerCase()}_trade_ticker`,
        cb_id: contractInfo.symbol.toLowerCase(),
      },
    };

    // 发送所有取消订阅消息
    ws.send(JSON.stringify(unsubDepthEvent));
    ws.send(JSON.stringify(unsubTradeEvent));
    ws.send(JSON.stringify(unsubPriceEvent));
    ws.send(JSON.stringify(unsubTickerEvent));
    ws.send(JSON.stringify(unsubRealtimeTradeEvent));
    ws.send(JSON.stringify(unsubKlineSubEvent));
  }, [depthPrecision]);

  // 发送新的订阅消息
  const sendNewSubscriptions = useCallback((ws: WebSocketService, contractInfo: any, timeInterval: string, precision: number = 0) => {
    const wsTimeInterval = convertTimeInterval(timeInterval);
    


    // 订单簿数据
    const depthEvent = {
      event: "sub",
      params: { channel: `market_${contractInfo.contractType.toLowerCase()}_${contractInfo.symbol.replace("-", "").toLowerCase()}_depth_step${precision}` },
      cb_id: contractInfo.symbol.toLowerCase(),
    };

    // 交易数据
    const tradeEvent = {
      event: "sub",
      params: {
        channel: `market_${contractInfo.contractType.toLowerCase()}_${contractInfo.symbol.replace("-", "").toLowerCase()}_trade_ticker`,
        cb_id: contractInfo.symbol.toLowerCase(),
      },
    };

    // 价格数据
    const priceEvent = {
      event: "sub",
      params: {
        channel: `market_price_${contractInfo.contractType.toLowerCase()}_${contractInfo.symbol
          .replace("-", "")
          .toLowerCase()}`,
        cb_id: contractInfo.symbol.toLowerCase(),
      },
    };

    // Ticker数据
    const tickerEvent = {
      event: "sub",
      params: {
        channel: `market_${contractInfo.contractType.toLowerCase()}_${contractInfo.symbol
          .replace("-", "")
          .toLowerCase()}_ticker`,
        cb_id: contractInfo.symbol.toLowerCase(),
      },
    };

    // 实时交易数据
    const realtimeTradeEvent = {
      event: "sub",
      params: {
        channel: `market_${contractInfo.contractType.toLowerCase()}_${contractInfo.symbol
          .replace("-", "")
          .toLowerCase()}_trade_ticker`,
        cb_id: contractInfo.symbol.toLowerCase(),
        top: 100,
      },
    };

    const realtimeTradeRepEvent = {
      event: "req",
      params: {
        channel: `market_${contractInfo.contractType.toLowerCase()}_${contractInfo.symbol
          .replace("-", "")
          .toLowerCase()}_trade_ticker`,
        cb_id: contractInfo.symbol.toLowerCase(),
        top: 100,
      },
    };

    // K线数据请求（获取历史数据）
    const klineReqEvent = {
      event: "req",
      params: {
        channel: `market_${contractInfo.contractType.toLowerCase()}_${contractInfo.symbol
          .replace("-", "")
          .toLowerCase()}_kline_${wsTimeInterval}`,
        cb_id: contractInfo.symbol.toLowerCase(),
      },
    };

    // K线数据订阅（获取实时更新）
    const klineSubEvent = {
      event: "sub",
      params: {
        channel: `market_${contractInfo.contractType.toLowerCase()}_${contractInfo.symbol
          .replace("-", "")
          .toLowerCase()}_kline_${wsTimeInterval}`,
        cb_id: contractInfo.symbol.toLowerCase(),
      },
    };

    // 发送所有订阅消息
    ws.send(JSON.stringify(depthEvent));
    ws.send(JSON.stringify(tradeEvent));
    ws.send(JSON.stringify(priceEvent));
    ws.send(JSON.stringify(tickerEvent));
    ws.send(JSON.stringify(realtimeTradeEvent));
    ws.send(JSON.stringify(klineReqEvent));
    ws.send(JSON.stringify(klineSubEvent));
    ws.send(JSON.stringify(realtimeTradeRepEvent));
  }, []);

  // 发送WebSocket订阅消息
  const sendSubscriptions = useCallback((ws: WebSocketService, contractInfo: any, timeInterval: string, shouldUnsubscribeFirst: boolean = false, precision: number = depthPrecision) => {
    if (!contractInfo.id || !contractInfo.contractType || !contractInfo.symbol) {
      return;
    }

    // 如果需要先取消订阅，则先发送取消订阅消息
    if (shouldUnsubscribeFirst) {
      sendUnsubscriptions(ws, contractInfo, timeInterval, precision);
      // 等待一小段时间确保取消订阅消息被处理
      setTimeout(() => {
        sendNewSubscriptions(ws, contractInfo, timeInterval, precision);
      }, 100);
    } else {
      sendNewSubscriptions(ws, contractInfo, timeInterval, precision);
    }
  }, [sendUnsubscriptions, sendNewSubscriptions, depthPrecision]);

  // 单独处理K线订阅（用于时间间隔切换）
  const sendKlineSubscription = useCallback((ws: WebSocketService, contractInfo: any, oldInterval: string, newInterval: string) => {
    if (!contractInfo.id || !contractInfo.contractType || !contractInfo.symbol) {
      return;
    }

    const oldWsTimeInterval = convertTimeInterval(oldInterval);
    const newWsTimeInterval = convertTimeInterval(newInterval);

    // 1. 先取消旧的K线订阅
    const unsubKlineEvent = {
      event: "unsub",
      params: {
        channel: `market_${contractInfo.contractType.toLowerCase()}_${contractInfo.symbol
          .replace("-", "")
          .toLowerCase()}_kline_${oldWsTimeInterval}`,
        cb_id: contractInfo.symbol.toLowerCase(),
      },
    };
    ws.send(JSON.stringify(unsubKlineEvent));

    // 2. 发送新的K线订阅
    // K线数据请求（获取历史数据）
    const klineReqEvent = {
      event: "req",
      params: {
        channel: `market_${contractInfo.contractType.toLowerCase()}_${contractInfo.symbol
          .replace("-", "")
          .toLowerCase()}_kline_${newWsTimeInterval}`,
        cb_id: contractInfo.symbol.toLowerCase(),
      },
    };

    // K线数据订阅（获取实时更新）
    const klineSubEvent = {
      event: "sub",
      params: {
        channel: `market_${contractInfo.contractType.toLowerCase()}_${contractInfo.symbol
          .replace("-", "")
          .toLowerCase()}_kline_${newWsTimeInterval}`,
        cb_id: contractInfo.symbol.toLowerCase(),
      },
    };

    // 延迟发送新订阅，确保取消订阅先处理
    setTimeout(() => {
      ws.send(JSON.stringify(klineReqEvent));
      ws.send(JSON.stringify(klineSubEvent));
    }, 100);
  }, []);

  // 单独处理深度精度订阅（用于精度切换）
  const sendDepthSubscription = useCallback((ws: WebSocketService, contractInfo: any, oldPrecision: number, newPrecision: number) => {
    if (!contractInfo.id || !contractInfo.contractType || !contractInfo.symbol) {
      return;
    }

    // 1. 先取消旧的深度订阅
    const unsubDepthEvent = {
      event: "unsub",
      params: { channel: `market_${contractInfo.contractType.toLowerCase()}_${contractInfo.symbol.replace("-", "").toLowerCase()}_depth_step${oldPrecision}` },
      cb_id: contractInfo.symbol.toLowerCase(),
    };
    ws.send(JSON.stringify(unsubDepthEvent));

    // 2. 发送新的深度订阅
    const depthEvent = {
      event: "sub",
      params: { channel: `market_${contractInfo.contractType.toLowerCase()}_${contractInfo.symbol.replace("-", "").toLowerCase()}_depth_step${newPrecision}` },
      cb_id: contractInfo.symbol.toLowerCase(),
    };

    // 延迟发送新订阅，确保取消订阅先处理
    setTimeout(() => {
      ws.send(JSON.stringify(depthEvent));
    }, 100);
  }, []);

  // 处理时间间隔变化
  const handleTimeIntervalChange = (interval: string) => {
    const oldInterval = currentTimeIntervalRef.current;
    
    setCurrentTimeInterval(interval);
    currentTimeIntervalRef.current = interval; // 更新 ref 值

    // 如果WebSocket已连接且合约信息完整，只重新发送K线订阅
    if (wsInstance && currentContractInfo.id) {
      sendKlineSubscription(wsInstance, currentContractInfo, oldInterval, interval);
    }
  };

  // 处理深度精度变化
  const handleDepthPrecisionChange = (precision: number) => {
    const oldPrecision = depthPrecision;
    setDepthPrecision(precision);

    // 如果WebSocket已连接且合约信息完整，只重新发送深度订阅
    if (wsInstance && currentContractInfo.id) {
      sendDepthSubscription(wsInstance, currentContractInfo, oldPrecision, precision);
    }
  };

  // 处理价格点击事件
  const handlePriceClick = (price: number) => {
    if (priceSetterRef.current) {
      priceSetterRef.current(price);
    }
  };

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

        // 设置初始的depth精度
        if (contractInfo.coinResultVo?.depth && contractInfo.coinResultVo.depth.length > 0) {
          setDepthPrecision(contractInfo.coinResultVo.depth[0]);
        }

        // 获取用户相关数据（需要登录）
        if (info.contractList && contractInfo.id && isLoggedIn) {
          // 获取账户余额
          getContractBalance();
          getSpotBalance();
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
  }, [getContractBalance, isLoggedIn]);

  // 确保在登录状态变化时重新加载余额
  useEffect(() => {
    if (isLoggedIn && currentContractInfo.id) {
      getContractBalance();
      getSpotBalance();
    }
  }, [isLoggedIn, currentContractInfo.id, getContractBalance]);

  // 监听store中currentContractInfo的变化
  useEffect(() => {
    const checkContractInfoChange = () => {
      const storeContractInfo = appStore.getCurrentContractInfo();
      
      // 添加详细的调试信息
      if (Math.random() < 0.01) { // 每100次轮询打印一次状态，避免日志太多

      }
      
      // 只有当store中的合约信息与当前state不同时才更新
      if (
        storeContractInfo &&
        storeContractInfo.id !== currentContractInfo.id
      ) {

        
        setOrderBookData(null);
        setPriceData(null);
        setKlineData(null);


        setCurrentContractInfo(storeContractInfo);

        // 更新depth精度为合约配置的第一个depth值
        if (storeContractInfo.coinResultVo?.depth && storeContractInfo.coinResultVo.depth.length > 0) {
          setDepthPrecision(storeContractInfo.coinResultVo.depth[0]);
        }

        // 如果WebSocket已连接，重新发送订阅消息（不重新连接）
        if (wsInstance) {
          sendSubscriptions(
            wsInstance,
            storeContractInfo,
            currentTimeIntervalRef.current,
            true
          ); // 先取消旧订阅
        } else {
        }

        // 重新获取账户余额（因为可能需要不同的保证金币种）
        getContractBalance();
      }
    };

    // 使用轮询方式检查store变化（简单方案）

    const interval = setInterval(checkContractInfoChange, 100);

    return () => clearInterval(interval);
  }, [
    currentContractInfo.id,
    wsInstance,
    getContractBalance,
  ]);

  // WebSocket连接管理（只负责建立连接）
  useEffect(() => {
    // 只需要检查WebSocket URL是否存在
    if (!publicInfo.wsUrl) {

      return;
    }

    const ws = new WebSocketService(publicInfo.wsUrl.replace(";", ""));
    setWsInstance(ws);

    // 消息处理回调
    const handleMessage = (message: string) => {
      try {
        // 如果消息看起来像是乱码，尝试打印十六进制
        if (message.includes("�") || message.length < 10) {
          const encoder = new TextEncoder();
          const bytes = encoder.encode(message);
        }

        const data = JSON.parse(message);


        // 处理K线数据 - 动态检查不同时间间隔的K线数据
        if (data.channel && data.channel.includes("_kline_")) {
          // 直接传递原始WebSocket数据给TradingView组件处理
          setKlineData(data);

          // 更新价格数据
          if (
            data.event_rep === "rep" &&
            data.data &&
            Array.isArray(data.data)
          ) {
            const latestKline = data.data[data.data.length - 1];
            if (latestKline) {
              setPriceData((prevPriceData: any) => ({
                ...prevPriceData,
                price: latestKline.close.toString(),
                high24h: Math.max(
                  ...data.data.map((k: any) => k.high)
                ).toString(),
                low24h: Math.min(
                  ...data.data.map((k: any) => k.low)
                ).toString(),
                volume24h: data.data
                  .reduce((sum: number, k: any) => sum + k.vol, 0)
                  .toString(),
              }));
            }
          } else if (data.tick && typeof data.tick === "object") {
            setPriceData((prevPriceData: any) => ({
              ...prevPriceData,
              price: data.tick.close.toString(),
            }));
          }
        } else if (data.channel && data.channel.includes("_depth_")) {
          // 处理OrderBook深度数据

          if (data.tick) {
          }
          console.log("_depth_data",data)
          setOrderBookData(data);
        } else if (data.channel && data.channel.includes("_trade_ticker")) {
          // 处理实时成交数据
          console.log("_trade_ticker",data)
          if (data.data && Array.isArray(data.data)) {
            // 对数据按时间戳排序，最新的在前
            const sortedData = data.data.sort((a: any, b: any) => b.ts - a.ts);
            setRealtimeTradeData(sortedData);

            // 更新最新价格
            if (sortedData.length > 0) {
              const latestTrade = sortedData[0];
              const newPriceData = {
                price: latestTrade.price,
                lastSide: latestTrade.side,
                lastTradeTime: latestTrade.ds,
                symbol: currentContractInfo?.symbol,
                contractId: currentContractInfo?.id,
                timestamp: Date.now(),
              };
              
              setPriceData((prevPriceData: any) => ({
                ...prevPriceData,
                price: latestTrade.price,
                lastSide: latestTrade.side, // 记录最新交易方向
                lastTradeTime: latestTrade.ds,
              }));

              // 更新store中的最新价格数据
              appStore.setActiveNewPrice(newPriceData);
            }
          }
        }
      } catch (error) {

      }
    };

    // 错误处理回调
    const handleError = (error: Event) => {

    };

    // 连接成功后的回调
    ws.setOnConnectedCallback(() => {

      // 如果合约信息已经准备好，立即发送订阅
      if (
        currentContractInfo.id &&
        currentContractInfo.contractType &&
        currentContractInfo.symbol
      ) {

        sendSubscriptions(ws, currentContractInfo, currentTimeIntervalRef.current);
      } else {

      }
    });

    // 建立连接
    ws.connect(handleMessage, handleError);

    // 清理函数
    return () => {

      setWsInstance(null);
      ws.close();
    };
  }, [
    publicInfo.wsUrl,
    currentContractInfo.id,
    currentContractInfo.contractType,
    currentContractInfo.symbol,
  ]);
useEffect(()=>{

})
  // 当合约信息准备好且WebSocket已连接时，发送初始订阅
  useEffect(() => {
    if (
      wsInstance &&
      currentContractInfo.id &&
      currentContractInfo.contractType &&
      currentContractInfo.symbol
    ) {
      // 只在WebSocket或合约信息变化时发送完整订阅
      // 时间间隔变化由 handleTimeIntervalChange 单独处理
      sendSubscriptions(wsInstance, currentContractInfo, currentTimeIntervalRef.current);
    }
  }, [wsInstance, currentContractInfo.id, currentContractInfo.contractType, currentContractInfo.symbol]); // 移除 currentTimeInterval 依赖

  // 如果不是客户端环境，返回加载中状态
  if (!isClient) {
    return  null;
  }

  return (
    <>
      {/* 瀑布流布局 */}

      <div
        style={{
          display: "grid",
          gap: "4px",
          gridTemplateAreas: `
            "currentSymbol lastTrades tradeForm"
            "tradingview lastTrades tradeForm"
            "order order tradeForm"
          `,
          gridTemplateColumns: `minmax(712px,1fr) minmax(240px,300px) minmax(320px,356px)`,
          gridTemplateRows: `68px 596px minmax(255px,auto)`,
        }}
        className="relative bg-[var(--background14)] overflow-x-auto"
      >
        {/* 当前合约信息 */}
        <div style={{ gridArea: "currentSymbol" }}>
          <ContractHeader priceData={priceData} />
        </div>

        {/* 交易图表 */}
        <div style={{ gridArea: "tradingview" }}>
          <ContractKlineChart
            currentContractInfo={currentContractInfo}
            klineData={klineData}
            onTimeIntervalChange={handleTimeIntervalChange}
          />
        </div>

        {/* 订单列表 */}
        <div style={{ gridArea: "order" }}>
          <OrderList ref={orderListRef} />
        </div>

        {/* 最新成交 */}
        <div
          style={{ gridArea: "lastTrades" }}
          className="flex flex-col gap-[4px] overflow-hidden"
        >
          <OrderBookList
            style={{ flex: 1 }}
            orderBookData={orderBookData}
            realtimeTradeData={realtimeTradeData}
            onPriceClick={handlePriceClick}
            onPrecisionChange={handleDepthPrecisionChange}
          />
          <RealtimeTrade
            style={{ flex: 1 }}
            orderBookData={orderBookData}
            realtimeTradeData={realtimeTradeData}
            onPriceClick={handlePriceClick}
          />
        </div>

        {/* 交易面板  */}
        <div className="flex flex-col gap-[4px]" style={{ gridArea: "tradeForm" }}>
          <ContractTradingPanel
            symbol={currentContractInfo.symbol}
            availableBalance={availableBalance} // 使用memoized的可用余额，确保状态变化时正确更新
            spotBalance={spotBalance}
            contractBalance={contractAssets}
            onOrderSubmit={handleOrderSubmit} // 父组件的订单提交函数
            onBalanceUpdate={getContractBalance} // 父组件的余额更新函数
            priceSetterRef={priceSetterRef} // 传递价格设置器ref
            priceData={priceData} // 传递价格数据
            orderBookData={orderBookData} // 传递深度数据
            onShowRiskDisclosure={() => setShowRiskDisclosure(true)} // 传递风险确认书触发函数
          />
          {
            isLoggedIn && <ContractAsset
              spotBalance={spotBalance}
              contractBalance={contractAssets}
              onBalanceUpdate={getContractBalance}
            />
          }
          <ContractInfoBox />
        </div>
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
