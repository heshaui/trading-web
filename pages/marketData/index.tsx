"use client";
import React from "react";
import styles from "./styles/marketData.module.css";
import { ConfigProvider, Table, Image } from "antd";
import type { GetStaticProps } from "next";
import type { ColumnsType } from "antd/es/table";
import { FireFilled } from "@ant-design/icons";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useThemeConfig } from "@/hooks/useKv";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  TradeRakingResp,
  HotMarketSymbol,
  MarketDataItem,
} from "@/type/marketData/marketData";
import TrendsTable from "./components/marketTrends";
import {
  getMarketUp,
  getHotData,
  getMarketDown,
  getExchangeCoinAllPrice,
} from "@/services/marketData";
import WebSocketService from "@/utils/websocket";
import { NoData } from '@/components/noData'
import appStore from "@/store";
import { cut, division } from '@/utils'


export default function MarketData() {
  const { t } = useTranslation("market");
  const { theme } = useThemeConfig();
  const [marketDataUp, setMarketDataUp] = useState<TradeRakingResp[]>([]);
  const [marketDataDown, setMarketDataDown] = useState<TradeRakingResp[]>([]);
  const [HotMarketList, setHotMarketList] = useState<HotMarketSymbol[]>([]);
  const [newPrice, setNewPrice] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tradeData, setTradeData] = useState<any>(null);
  const [klineData, setKlineData] = useState<any>(null);
  const coinPair = appStore.getCurrentPairList() || appStore.currencyPairs;

  // WebSocket引用，用于管理多个币对的WebSocket连接
  const wsRefs = useRef<{ [key: string]: WebSocketService }>({});
  // 多通道WebSocket引用
  const multiWsRef = useRef<WebSocketService | null>(null);
  // 获取涨幅榜数据
  const fetchMarketDataUp = async () => {
    try {
      const response = await getMarketUp();
      if (response?.code === "0") {
        const sortData = response.data?.map((item: any) => {
          const coinSymbol = item.symbol?.split("_")[0]
          const baseSymbol = item.symbol?.split("_")[1]
          // const pairsData = newPrice?.find(p => p.coinSymbol === coinSymbol && p.baseSymbol === baseSymbol)
          return {
            ...item,
            symbol: `${coinSymbol}/${baseSymbol}`,
            coinSymbol: coinSymbol,
            baseSymbol: baseSymbol,
            // ...pairsData
          }
        })
        //   .sort((a: HotMarketSymbol, b: HotMarketSymbol) => {
        //   return Number(b?.sort) - Number(a?.sort)
        // })
        setMarketDataUp(sortData);
      }
    } catch (error) {
      console.error("获取涨幅榜信息失败：", error);
      throw error; // 抛出错误，以便在 Promise 链中捕获
    }
  };
  // 获取跌幅榜数据
  const fetchMarketDataDown = async () => {
    try {
      const response = await getMarketDown();
      if (response?.code === "0") {
        const sortData = response.data?.map((item: any) => {
          const coinSymbol = item.symbol?.split("_")[0]
          const baseSymbol = item.symbol?.split("_")[1]
          // const pairsData = newPrice?.find(p => p.coinSymbol === coinSymbol && p.baseSymbol === baseSymbol)
          return {
            ...item,
            symbol: `${coinSymbol}/${baseSymbol}`,
            coinSymbol: coinSymbol,
            baseSymbol: baseSymbol,
            // ...pairsData
          }
        })
        //   .sort((a: HotMarketSymbol, b: HotMarketSymbol) => {
        //   return Number(b?.sort) - Number(a?.sort)
        // })
        setMarketDataDown(sortData);

      }
    } catch (error) {
      console.error("获取跌幅榜信息失败：", error);
      throw error; // 抛出错误，以便在 Promise 链中捕获
    }
  };
  // 获取热门榜OK
  const fetchHotMarketData = async () => {
    try {
      const response = await getHotData();
      if (response?.code === "0") {
        const sortData = response.data?.map((item: any) => {
          const pairsData = newPrice?.find(p => p.coinSymbol === item.coinSymbol && p.baseSymbol === item.baseSymbol)
          return {
            ...item,
            ...pairsData
          }
        }).sort((a: HotMarketSymbol, b: HotMarketSymbol) => {
          return Number(b?.sort) - Number(a?.sort)
        })
        setHotMarketList(sortData);
      }
    } catch (error) {
      console.error("获取热门榜列表失败：", error);
      throw error; // 抛出错误，以便在 Promise 链中捕获
    }
  };
  // 获取币对最新价格
  const fetchNewPrice = async () => {
    try {
      const response = await getExchangeCoinAllPrice();
      if (response?.code === "0") {
        // 处理数据，计算涨跌幅
        const processedData = response.data.map((item: any) => {
          // const initCoinPair=coinPair.find(p => p.coinSymbol === item.coinSymbol && p.baseSymbol === item.baseSymbol)
          // 提取价格数据，支持多种可能的字段名称
          // let priceChangePercent;
          const price = parseFloat(item.price || item.close_price || "0");
          // const yesterdayPrice = parseFloat(item.yesterdayPrice || "0");

          // // 计算涨跌幅
          // if (price && yesterdayPrice && yesterdayPrice !== 0) {
          //   const change = (price - yesterdayPrice) / yesterdayPrice;
          //   priceChangePercent = parseFloat((change * 100).toFixed(2));
          // }
          return {
            // ...initCoinPair,
            ...item,
            price: price || undefined,
            // yesterdayPrice: yesterdayPrice || undefined,
            // priceChangePercent,
          };
        });


        setNewPrice(processedData);
        // appStore.updateCurrencyPairAll(processedData);
        // 获取初始数据之后，建立WS连接
      }
    } catch (error) {
      console.error("获取币对最新价格失败：", error);
      throw error; // 抛出错误，以便在 Promise 链中捕获
    }
  };
  // 为每个币对建立WebSocket连接
  const setupPriceWebSockets = (coinPairs: MarketDataItem[]) => {
    // 清理现有连接
    cleanupWebSockets();
    console.log("准备建立WebSocket连接，币对数量:", coinPairs.length);

    // 为每个币对创建新的WebSocket连接
    coinPairs.forEach((pair) => {
      if (!pair.baseSymbol || !pair.coinSymbol) {
        console.log("跳过无效币对:", pair);
        return;
      }
      const pairKey = `${pair.coinSymbol}_${pair.baseSymbol}`;
      // 检查环境变量
      const wsBase = process.env.NEXT_PUBLIC_WS_API_BASE;
      if (!wsBase) {
        console.error("环境变量NEXT_PUBLIC_WS_API_BASE未设置");
        return;
      }

      const wsUrl = `${wsBase}/ws/${pair.coinSymbol.toUpperCase()}_${pair.baseSymbol.toUpperCase()}@kline_1d`;
      console.log(`尝试建立WebSocket连接: ${wsUrl}`);
      const ws = new WebSocketService(wsUrl);

      // 保存WebSocket实例
      wsRefs.current[pairKey] = ws;

      // 建立连接并处理消息
      ws.connect(
        (message) => {
          try {
            if (
              message.startsWith("subscribe:") ||
              message.startsWith("ping") ||
              message.startsWith("pong") ||
              message.includes("subscribe") ||
              message.includes("left the channel") ||
              message.includes("client")
            ) {
              console.log(`收到系统消息(${pairKey}):`, message);
              return;
            }
            // / 处理错误消息 - 文本格式
            if (message.includes("error") || message.includes("Invalid")) {
              console.error(`WebSocket错误消息(${pairKey}):`, message);
              return;
            }
            console.log(`收到websocket消息(${pairKey}):`, message);
            let data;
            try {
              data = JSON.parse(message);
            } catch (parseError) {
              console.warn(`消息不是JSON格式(${pairKey}):`, message);
              return;
            }

            // 检查消息类型
            if (data.type === "__ping__") {
              console.log(`收到ping消息(${pairKey})`);
              return;
            }
            console.log(`${pairKey} 数据结构:`, JSON.stringify(data, null, 2));

            updatePairPrice(
              pair.coinSymbol as string,
              pair.baseSymbol as string,
              data
            );
          } catch (error) {
            console.error(`解析WebSocket消息出错 (${pairKey}):`, error);
          }
        },
        (error) => {
          console.error(`WebSocket连接错误 (${pairKey}):`, error);

          // 连接出错时，尝试重新连接
          setTimeout(() => {
            console.log(`尝试重新连接 ${pairKey}...`);
            if (wsRefs.current[pairKey]) {
              wsRefs.current[pairKey].close();
              delete wsRefs.current[pairKey];
            }

            // 只重新连接这个币对
            setupSinglePairWebSocket(pair);
          }, 5000); // 5秒后重试
        }
      );
    });
  };
  const setupSinglePairWebSocket = (pair: MarketDataItem) => {
    if (pair.baseSymbol && pair.coinSymbol) {
      const pairKey = `${pair.coinSymbol}_${pair.baseSymbol}`;

      // 创建WebSocket连接
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_API_BASE
        }/ws/${pair.coinSymbol.toUpperCase()}_${pair.baseSymbol.toUpperCase()}@kline_1d`;

      console.log(`建立单个WebSocket连接: ${wsUrl}`);
      const ws = new WebSocketService(wsUrl);

      // 保存WebSocket实例
      wsRefs.current[pairKey] = ws;

      // 建立连接并处理消息
      ws.connect(
        (message: string) => {
          try {
            const data = JSON.parse(message);
            console.log("data的内容:", data, 123);
            if (data) {
              // 更新币对价格和涨跌幅
              updatePairPrice(pair?.coinSymbol || '', pair?.baseSymbol || '', data);
            }
          } catch (error) {
            console.error(`解析WebSocket消息出错 (${pairKey}):`, error);
          }
        },
        (error) => {
          console.error(`WebSocket连接错误 (${pairKey}):`, error);
        }
      );
    }
  };
  const cleanupWebSockets = () => {
    Object.values(wsRefs.current).forEach((ws) => {
      ws.close();
    });
    wsRefs.current = {};
  };

  // 建立多通道WebSocket连接
  const getMulti = useCallback(() => {
    // 如果已经有连接，先关闭
    if (multiWsRef.current) {
      multiWsRef.current.close();
      multiWsRef.current = null;
    }

    // 创建新的WebSocket连接
    const wsUrl = "wss://ws80.imsaas.work/ws/multi";
    console.log("建立多通道WebSocket连接:", wsUrl);

    const ws = new WebSocketService(wsUrl);
    multiWsRef.current = ws;

    // 建立连接并处理消息
    ws.connect(
      (message: string) => {
        try {
          // 处理系统消息
          if (
            message.startsWith("subscribe:") ||
            message.startsWith("ping") ||
            message.startsWith("pong") ||
            message.includes("subscribe") ||
            message.includes("left the channel") ||
            message.includes("client")
          ) {
            console.log(`收到多通道WebSocket系统消息:`, message);
            return;
          }

          // 处理错误消息
          if (message.includes("error") || message.includes("Invalid")) {
            console.error(`多通道WebSocket错误消息:`, message);
            return;
          }

          // console.log(`收到多通道WebSocket消息:`, message);

          // 解析JSON消息
          let data;
          try {
            data = JSON.parse(message);

          } catch (parseError) {
            // console.warn(`多通道WebSocket消息不是JSON格式:`, message);
            return;
          }

          // 检查消息类型
          if (data.type === "__ping__") {
            // console.log(`收到多通道WebSocket ping消息`);
            return;
          }

          // // 根据频道处理不同类型的数据
          // if (data.channel && data.data) {
          //   if (data.channel === "ETH_USDT_1@trade") {
          //     // 处理交易数据
          //     setTradeData(data.data);
          //     // console.log("接收到ETH_USDT_1交易数据:", data.data);
          //   } else if (data.channel === "BTC_USDT_1@kline_1m") {
          //     // 处理K线数据
          //     setKlineData(data.data);
          //     // console.log("接收到BTC_USDT_1 K线数据:", data.data);
          //   }
          // }
          // "kline"-k线数据   "trade"-交易数据
          if (data.type === "kline") {
            const coinSymbol = data.symbol.split("_")[0]
            const baseSymbol = data.symbol.split("_")[1]

            updatePairPrice(coinSymbol, baseSymbol, data.data[0])
          }
        } catch (error) {
          // console.error(`解析多通道WebSocket消息出错:`, error);
        }
      },
      (error) => {
        // console.error(`多通道WebSocket连接错误:`, error);

        // 连接出错时，尝试重新连接
        setTimeout(() => {
          // console.log(`尝试重新连接多通道WebSocket...`);
          getMulti();
        }, 5000); // 5秒后重试
      }
    );

    // 创建一个订阅函数，在消息回调中检测何时连接成功并发送订阅
    let isSubscribed = false;
    const checkAndSubscribe = () => {
      // 如果已经订阅过了，就不再重复订阅
      if (isSubscribed || !multiWsRef.current || multiWsRef.current.connectionState !== 1) {
        return;
      }

      console.log("多通道WebSocket连接成功，发送订阅消息");
      const subscribeMessage = JSON.stringify({
        action: "subscribe",
        channels: ["BTC_USDT_1002@kline_1d3s","ETH_USDT_1002@kline_1d3s"]
      });

      const sent = multiWsRef.current.send(subscribeMessage);
      if (sent) {
        console.log("成功发送多通道WebSocket订阅消息:", subscribeMessage);
        isSubscribed = true;
      } else {
        console.error("发送多通道WebSocket订阅消息失败");
      }
    };

    // 设置定时检测来确保订阅消息被发送
    const subscriptionInterval = setInterval(() => {
      checkAndSubscribe();
      // 如果已经订阅成功，则清除定时器
      if (isSubscribed) {
        clearInterval(subscriptionInterval);
      }
    }, 500); // 每500ms检测一次

    // 10秒后就停止检测，防止无限循环
    setTimeout(() => {
      clearInterval(subscriptionInterval);
      if (!isSubscribed) {
        console.error("多通道WebSocket订阅失败，超时");
      }
    }, 10000);
  }, []);
  // 更新币对价格和涨跌幅
  const updatePairPrice = (
    coinSymbol: string,
    baseSymbol: string,
    data: any
  ) => {
    // console.log(data,9999);

    // 更新币对信息
    appStore.updateCoinPair(coinSymbol, baseSymbol, data);
    const mapData = {
      open_time: data[0],
      open_price: data[1],
      openPrice: data[1],

      high_price: data[2],
      height: data[2],

      low_price: data[3],
      lower: data[3],

      close_price: data[4],
      closePrice: data[4],
      price: data[4],

      volume: data[5]
    }
    // console.log(mapData,999);

    // 更新涨幅榜单数据
    setMarketDataUp((prevMarket) => {
      // 深拷贝当前价格数据
      const updatedPrices = [...prevMarket];
      // 找到对应币对
      const pairIndex = updatedPrices.findIndex(
        (p) => p.coinSymbol === coinSymbol && p.baseSymbol === baseSymbol
      );
      if (pairIndex !== -1) {
        // 计算涨跌幅: (close_price - open_price) / open_price
        let priceChangePercent = 0;
        if (mapData.open_price && mapData.open_price !== 0) {
          const change = (mapData.close_price - mapData.open_price) / mapData.open_price;
          // 转换为百分比并保留2位小数
          priceChangePercent = change * 100
        }

        // 更新价格、24小时涨跌幅、交易量等数据
        updatedPrices[pairIndex] = {
          ...updatedPrices[pairIndex],
          // open_price: String(mapData.open_price),
          // high_price: String(mapData.high_price),
          // low_price: String(mapData.low_price),
          // close_price: String(mapData.close_price),
          // price: String(mapData.close_price), // 添加price字段更新
          // volume: String(mapData.volume),
          // priceChangePercent: priceChangePercent,
          // // 更新时间戳
          // updateTime: Date.now(),
          ...mapData
        };
      }
      return updatedPrices;
    })

    // 更新跌幅榜单数据
    setMarketDataDown((prevMarket) => {
      // 深拷贝当前价格数据
      const updatedPrices = [...prevMarket];
      // 找到对应币对
      const pairIndex = updatedPrices.findIndex(
        (p) => p.coinSymbol === coinSymbol && p.baseSymbol === baseSymbol
      );
      console.log(`跌幅榜单查找币对 ${coinSymbol}_${baseSymbol}, 索引: ${pairIndex}, 总数据数: ${updatedPrices.length}`);
      if (pairIndex !== -1) {
        // 计算涨跌幅: (close_price - open_price) / open_price
        let priceChangePercent = 0;
        if (mapData.open_price && mapData.open_price !== 0) {
          const change = (mapData.close_price - mapData.open_price) / mapData.open_price;
          // 转换为百分比并保留2位小数
          // priceChangePercent = parseFloat((change * 100).toFixed(2));
          priceChangePercent = change * 100
        }

        // 更新价格、24小时涨跌幅、交易量等数据
        updatedPrices[pairIndex] = {
          ...updatedPrices[pairIndex],
          // open_price: String(mapData.open_price),
          // high_price: String(mapData.high_price),
          // low_price: String(mapData.low_price),
          // close_price: String(mapData.close_price),
          // price: String(mapData.close_price), // 添加price字段更新
          // volume: String(mapData.volume),
          // priceChangePercent: priceChangePercent,
          // // 更新时间戳
          // updateTime: Date.now(),
          ...mapData
        };
      }
      return updatedPrices;
    })

    // 更新热门榜单数据
    setHotMarketList((prevMarket) => {
      // 深拷贝当前价格数据
      const updatedPrices = [...prevMarket];
      // 找到对应币对
      const pairIndex = updatedPrices.findIndex(
        (p) => p.coinSymbol === coinSymbol && p.baseSymbol === baseSymbol
      );
      // console.log(`热门榜单查找币对 ${coinSymbol}_${baseSymbol}, 索引: ${pairIndex}, 总数据数: ${updatedPrices.length}`);
      if (pairIndex !== -1) {
        // 计算涨跌幅: (close_price - open_price) / open_price
        let priceChangePercent = 0;
        if (mapData.open_price && mapData.open_price !== 0) {
          const change = (mapData.close_price - mapData.open_price) / mapData.open_price;
          // 转换为百分比并保留2位小数
          // priceChangePercent = parseFloat((change * 100).toFixed(2));
          priceChangePercent = change * 100
        }

        // 更新价格、24小时涨跌幅、交易量等数据
        updatedPrices[pairIndex] = {
          ...updatedPrices[pairIndex],
          ...mapData
        };
      }
      return updatedPrices;
    })


    // 使用函数式更新，保证基于最新状态
    setNewPrice((prevPrices) => {
      // 深拷贝当前价格数据
      const updatedPrices = [...prevPrices];

      // 找到对应币对
      const pairIndex = updatedPrices.findIndex(
        (p) => p.coinSymbol === coinSymbol && p.baseSymbol === baseSymbol
      );

      if (pairIndex !== -1) {
        let priceChangePercent = 0;
        if (mapData.open_price && mapData.open_price !== 0) {
          const change = (mapData.close_price - mapData.open_price) / mapData.open_price;
          // 转换为百分比并保留2位小数
          // priceChangePercent = parseFloat((change * 100));
          priceChangePercent = change * 100
        }
        // 更新价格、24小时涨跌幅、交易量等数据
        updatedPrices[pairIndex] = {
          ...updatedPrices[pairIndex],
          ...mapData,
        };
      }
      return updatedPrices;
    });
  };

  const filteredHotPairs = useMemo(
    () =>
      marketDataUp?.map((pairs: any) => {
        const spotListArr = newPrice?.find(item => item?.coinSymbol === pairs?.coinSymbol && item?.baseSymbol === pairs?.baseSymbol);
        return {
          ...pairs,
          ...spotListArr,
        }

      })
      || [],
    [marketDataUp, newPrice]
  );
  const filteredMarketDataDown = useMemo(
    () =>
      // HotMarketList
      //   ?.map((pairs: any) => {
      //   const spotListArr = newPrice?.find(item => item?.coinSymbol === pairs?.coinSymbol && item?.baseSymbol === pairs?.baseSymbol);
      //   return {
      //     ...pairs,
      //     ...spotListArr,
      //   }

      // })
      marketDataDown.filter((items: any) => {
        const changePercent = (items.close_price - items.open_price) / items.open_price;
        return changePercent<=0
      }).sort(
        (a: any, b: any) => {
          const achangePercent = (a.close_price - a.open_price) / a.open_price;
          const bchangePercent = (b.close_price - b.open_price) / b.open_price;
        return bchangePercent - achangePercent
      })
      || [],
    [HotMarketList]
  );

  const filteredMarketDataUp = useMemo(
    () =>
      // HotMarketList?.map((pairs: any) => {
      //   const spotListArr = newPrice?.find(item => item?.coinSymbol === pairs?.coinSymbol && item?.baseSymbol === pairs?.baseSymbol);
      //   return {
      //     ...pairs,
      //     ...spotListArr,
      //   }

      // })
      marketDataUp.filter((items: any) => {
        const changePercent = (items.close_price - items.open_price) / items.open_price;
        return changePercent>=0
      }).sort(
        (a: any, b: any) => {
          const achangePercent = (a.close_price - a.open_price) / a.open_price;
          const bchangePercent = (b.close_price - b.open_price) / b.open_price;
        return bchangePercent - achangePercent
      })
      || [],
    [HotMarketList]
  );


  // useEffect(() => {
  //   console.log(filteredHotPairs, newPrice, 999);

  // }, [filteredHotPairs, newPrice]);
  // 热门
  const columns: ColumnsType<HotMarketSymbol> = [
    {
      title: t("rankingList.tradingPair"),
      dataIndex: "symbol",
      key: "symbol",
      align: "left",
      onHeaderCell: () => ({
        style: {
          width: "165px",
          height: "27px",
          paddingLeft: "38px",
          fontSize: "14px",
          lineHeight: "20px",
        },
      }),
      onCell: () => ({
        style: { paddingLeft: "20px" },
      }),
      render: (text, record, index) => (
        <div className="flex-x align-center">
          {index + 1}&nbsp;&nbsp;
          <Image
            src={record.iconUrl}
            alt=""
            width={20}
            height={20}
            className="mr-1"
            style={{ width: 20, height: 20, borderRadius: '50%' }}
          />
          {record.symbol}
        </div>
      ),
    },
    {
      title: t("rankingList.latestPrice"),
      onHeaderCell: () => ({
        style: {
          width: "140px",
          height: "27px",
          fontSize: "14px",
          lineHeight: "20px",
        },
      }),
      align: "center",
      dataIndex: "price",
      key: "price",
      render: (text, record) => (
        <div>
          <div>{parseFloat(record.price || "0").toLocaleString()}</div>
          <div style={{ fontSize: "12px", color: "#999" }}>
            ${parseFloat(record.price || "0").toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      title: t("rankingList.change24h"),
      dataIndex: "price",
      key: "price",
      align: "right",
      onHeaderCell: () => ({
        style: {
          width: "70px",
          height: "27px",
          fontSize: "14px",
          lineHeight: "20px",
          textAlign: "left",
        },
      }),
      render: (_price: any, record: TradeRakingResp, index: number) => {
        // 根据涨跌幅确定颜色
        // const changePercent = record.priceChangePercent;
        const changePrice = Number(cut(Number(_price || 0), Number(record.openPrice || 0)))
        const changePercent = record.openPrice ? division(changePrice, Number(record.openPrice || 0)) : 0
        const isPositive = changePercent !== undefined && changePercent > 0;
        const isNegative = changePercent !== undefined && changePercent < 0;
        // const textColor = isPositive
        //   ? "var(--color-success)"
        //   : "var(--color-danger)";
        const prefix = isPositive ? "+" : "";
        return (
          <span className={`${styles.text} ${isPositive ? styles.positive : isNegative ? styles.negative : ''}`}>
            {changePercent !== undefined ? `${prefix}${changePercent?.toFixed(2)}%` : `${Number(0).toFixed(2)}%`}
          </span>
        );
      },
    },
  ];
  // 涨跌
  const columnsTrading: ColumnsType<TradeRakingResp> = [
    {
      title: t("rankingList.tradingPair"),
      dataIndex: "symbol",
      key: "symbol",
      onHeaderCell: () => ({
        style: {
          width: "165px",
          height: "27px",
          paddingLeft: "38px",
          fontSize: "14px",
          lineHeight: "20px",
        },
      }),
      onCell: () => ({
        style: { paddingLeft: "20px" },
      }),
      render: (text, record, index) => {
        const symbol = record.symbol?.split("_")
        const coinSymbol = symbol?.[0]
        // const baseSymbol = symbol?.[1]
        return <>
          {index + 1}&nbsp;&nbsp;
          {/* <Image
            src={record.iconUrl }
            alt=""
            width={20}
            height={20}
          /> */}
          {symbol ? `${coinSymbol}` : '--'}
        </>
      },
    },
    {
      title: t("rankingList.latestPrice"),
      dataIndex: "close_price",
      key: "close_price",
      onHeaderCell: () => ({
        style: {
          width: "140px",
          height: "27px",
          fontSize: "14px",
          lineHeight: "20px",
        },
      }),
      render: (_text, record) => (
        <div>
          <div>{_text ? parseFloat(_text || "0").toLocaleString() : "0"}</div>
          <div style={{ fontSize: "12px", color: "#999" }}>
            ${_text ? parseFloat(_text || "0").toLocaleString() : "0"}
          </div>
        </div>
      ),
    },
    {
      title: t("rankingList.change24h"),
      dataIndex: "close_price",
      key: "close_price",
      align: "right",
      onHeaderCell: () => ({
        style: {
          width: "70px",
          height: "27px",
          fontSize: "14px",
          lineHeight: "20px",
          textAlign: "left",
        },
      }),
      render: (_closePrice: any, record: TradeRakingResp, index: number) => {
        // 根据涨跌幅确定颜色
        // const changePercent = record.priceChangePercent
        const changePrice = Number(cut(Number(_closePrice), Number(record.open_price)))
        const changePercent = changePrice ? division(changePrice, Number(record.open_price)) : 0
        const isPositive = changePercent !== undefined && Number(changePercent) > 0;
        const isNegative = changePercent !== undefined && Number(changePercent) < 0;
        const prefix = isPositive ? "+" : "";
        return (
          <span className={`${styles.text} ${isPositive ? styles.positive : isNegative ? styles.negative : ''}`}>
            {changePercent !== undefined ? `${prefix}${changePercent?.toFixed(2)}%` : `${Number(0).toFixed(2)}%`}
          </span>
        )
        // const isPositive = _closePrice !== undefined && _closePrice > 0;
        // const isNegative = _closePrice !== undefined && _closePrice < 0;
        // const prefix = isPositive ? "+" : "";
        // return (
        //   <span className={`${styles.text} ${isPositive ? styles.positive : isNegative ? styles.negative : ''}`}>
        //     {_closePrice !== undefined ? `${prefix}${_closePrice}%` : `${Number(0).toFixed(2)}%`}
        //   </span>
        // );
      }
    },
  ];


  useEffect(() => {
    // 同时执行涨跌幅榜单请求和WebSocket连接初始化
    fetchMarketDataUp();
    fetchMarketDataDown();
    setIsLoading(false);
    // 先执行 fetchNewPrice，完成后再执行 fetchHotMarketData
    fetchNewPrice()
      .then(() => {
        // fetchNewPrice 完成后执行 fetchHotMarketData
        return fetchHotMarketData();
      })
      .catch(error => {
        console.error("请求过程中发生错误:", error);
        setIsLoading(false);
      });
    getMulti();

    return () => {
      // 组件卸载时清理WebSocket连接
      cleanupWebSockets();
      // 清理多通道WebSocket连接
      if (multiWsRef.current) {
        multiWsRef.current.close();
        multiWsRef.current = null;
      }
    };
  }, [getMulti]);
  useEffect(() => {
    // 只在客户端执行
    if (typeof window === 'undefined') return;

    try {
      appStore.loadCurrencyPairs()
      // .then(() => {
      //   const coinPair = appStore.getCurrentPairList() || appStore.currencyPairs;
      //   setNewPrice(coinPair)
      //   // fetchNewPrice();
      // });

    } catch (error) {

    }
  }, []);

  return (
    <ConfigProvider
      theme={{
        components: {
          Input: {
            inputFontSize: 12,
            colorTextPlaceholder: "var(--help-center-input-text)",
            colorBorder: "var(--border-color4)",
            activeBg: "transparent",
            hoverBg: "transparent",
            colorText: "var(--text-color5)",
          },
          Menu: {
            itemColor: "#A4A5AC",
            itemHoverBg: "var(--theme-color)",
            itemSelectedBg: "var(--theme-color)",
            itemHoverColor: "#FFFFFF",
            itemSelectedColor: "#FFFFFF",
            itemMarginInline: 20,
            itemMarginBlock: 0,
            itemBorderRadius: 10,
          },
          Pagination: {
            itemActiveBg: "var(--theme-color)",
          },
          Breadcrumb: {
            itemColor: "var(--text-color6)",
            lastItemColor: "var(--text-color5)",
            separatorColor: "var(--text-color6)",
            linkColor: "var(--text-color6)",
            linkHoverColor: "none",
          },
          Empty: {
            colorTextDescription: "var(--text-color6)",
          },
          Tabs: {
            itemActiveColor: "var(--tip-color)", //激活态颜色
            itemSelectedColor: "var(--text-color5)", //选中态颜色
            horizontalMargin: "0 0 0 0",
            itemColor: "var(--text-color6)",
            inkBarColor: "var(--text-color5)", //指示条颜色
            itemHoverColor: "var(--text-color5)", //悬浮态颜色
          },
          Table: {
            headerBg: "transparent",
            headerColor: "var(--text-color6)",
            headerSplitColor: "transparent", // 表头分割线颜色
            rowExpandedBg: "var(--background10)", // 表格行展开背景色
            borderColor: "transparent",
            // stickyScrollBarBg:"transparent",
            headerBorderRadius: 0, // 表头圆角
            // rowHoverBg: "#f5f5f5", // 鼠标悬停在行上时的背景颜色
          },
        },
        token: {
          colorPrimary: "var(--theme-color)",
          fontWeightStrong: 400,
        },
      }}
    >
      <div className={`${styles.market_page} flex-y align-center`}>
        <div className={`${styles.main_page_box} font-16 fontw-400`}>
          {/* 榜单 */}
          <div className={`${styles.ranking_box}`}>
            <p className={`${styles.section_title}`}>
              {t("marketData.rankings")}
            </p>
            <div className={`${styles.rankings_grid} flex-x`}>
              {/* 热门榜 */}
              <div className={`${styles.ranking_list} flex-y flex-1`}>
                <div className={styles.cardHeader}>
                  <Image
                    src="/images/market/icon_bangdan_hot.png"
                    alt=""
                    width={24}
                    height={24}
                  />
                  <span className={styles.cardtitle}>
                    {t("rankingList.hotCoins")}
                  </span>
                </div>
                <div className={`flex-1 ${styles.ranking_content}`}>
                  <Table
                    columns={columns}
                    dataSource={filteredHotPairs.slice(0, 7)}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    bordered={false}
                    className={styles.table}
                    // scroll={{ y: '400' }}
                    // style={{ height: '300px' }}
                    locale={{ emptyText: <NoData textColor='#A4A5AC' /> }}
                  />
                </div>

              </div>
              {/* 涨幅榜 */}
              <div className={`${styles.ranking_list} flex-y flex-1`}>
                <div className={styles.cardHeader}>
                  <Image
                    src="/images/market/icon_bd_up.png"
                    alt=""
                    width={24}
                    height={24}
                  />
                  <span className={styles.cardtitle}>
                    {t("rankingList.risingCoins")}
                  </span>
                </div>
                <div className={`flex-1 ${styles.ranking_content}`}>
                  <Table
                    columns={columnsTrading}
                    dataSource={filteredMarketDataUp.slice(0, 7)}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    bordered={false}
                    className={styles.table}
                    locale={{ emptyText: <NoData textColor='#A4A5AC' /> }}
                  />
                </div>
              </div>
              {/* 跌幅榜 */}
              <div className={`${styles.ranking_list} flex-y flex-1`}>
                <div className={styles.cardHeader}>
                  <Image
                    src="/images/market/icon_db_down.png"
                    alt=""
                    width={24}
                    height={24}
                  />
                  <span className={styles.cardtitle}>
                    {t("rankingList.fallingCoins")}
                  </span>
                </div>
                <div className={`flex-1 ${styles.ranking_content}`}>
                  <Table
                    columns={columnsTrading}
                    dataSource={filteredMarketDataDown.slice(0, 7)}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    bordered={false}
                    className={styles.table}
                    locale={{ emptyText: <NoData textColor='#A4A5AC' /> }}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* 行情 */}
          <div className={`${styles.ranking_box}`}>
            <p className={`${styles.section_title}`}>
              {t("marketData.marketTrends")}
            </p>
            <div className={`${styles.trends_box}`}>
              <TrendsTable tradeData={newPrice} />
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", [
        "common",
        "market",
        "spot",
      ])),
    },
  };
};
