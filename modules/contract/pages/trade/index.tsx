"use client";
import React, { useState, useEffect } from "react";
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
import { createCoId, createOrder, getPublicMarketInfo } from "@/services/contract";

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
  const [showRiskDisclosure, setShowRiskDisclosure] = useState(false); // 风险确认书模态框
  const [orderBookData, setOrderBookData] = useState<any>(null); // 订单簿数据
  const [isClient, setIsClient] = useState(false); // 是否是客户端
  const [contractAssets, setContractAssets] = useState<ContractAsset[]>([]); // 合约账户数据
  const [currentContractInfo, setCurrentContractInfo] = useState<any>({}); // 当前合约信息
  const [publicInfo, setPublicInfo] = useState<any>({}); // 公共数据
  const [symbolList, setSymbolList] = useState<SymbolData[]>([]); // 币种列表
  const [priceData, setPriceData] = useState<any>(null); // 价格数据

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
      content: <ContractHeader mockPriceData={mockPriceData} />,
    },
    {
      columnSpan: 1,
      height: 380,
      content: <OrderBookList orderBookData={orderBookData} />,
    },
    {
      columnSpan: 1,
      height: 530,
      content: (
        <ContractTradingPanel
          symbol={mockPriceData.symbol}
          lastPrice={parseFloat(mockPriceData.price.replace(/,/g, ""))}
          availableBalance={getAvailableUSDTBalance()} // 使用真实的USDT可用余额
          spotBalance={spotBalance}
          contractBalance={contractAssets}
          onOrderSubmit={handleOrderSubmit}
          onBalanceUpdate={getContractBalance} // 父组件的余额更新函数
        />
      ),
    },
    {
      columnSpan: 3,
      height: 604,
      content: <ContractKlineChart currentContractInfo={currentContractInfo} />,
    },
    {
      columnSpan: 1,
      height: 284,
      content: <RealtimeTrade orderBookData={orderBookData} />,
    },
    ...(isLoggedIn ? [{
      columnSpan: 1,
      height: 190,
      content: <ContractAsset />,
    }] : []),
    {
      columnSpan: 4,
      minHeight: 400,
      content: <OrderList />,
    },
    {
      columnSpan: 1,
      height: 300,
      content: <ContractInfo />,
    },
  ];

  // 获取公共数据
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

  // 获取币种列表
  useEffect(() => {

    if (publicInfo.contractList) {
      setSymbolList(publicInfo.contractList);
    }
  }, [publicInfo]);

  // 安全获取当前合约信息
  useEffect(() => {
    if (isClient && typeof window !== "undefined") {
      const contractInfo = appStore.getCurrentContractInfo();
      setCurrentContractInfo(contractInfo);
    }
  }, [isClient]);

  // 获取合约账户余额
  useEffect(() => {
    getContractBalance();
    getSpotBalance();
  }, []);

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

  // 获取订单簿数据
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

  // 如果不是客户端环境，返回加载中状态
  if (!isClient) {
    return <div>Loading...</div>;
  }

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
