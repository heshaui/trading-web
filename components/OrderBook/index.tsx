// components/OrderBook.js
import { useState, useEffect } from "react";
import styles from "./style/OrderBook.module.css";
import Image from "next/image";
import appStore from "@/store";
import { Tooltip, Select } from "antd";
import { useTranslation } from "next-i18next";
import { add, cut, nul, roundDown } from "@/utils/index";
import { getRate } from "@/utils/getUseRate";
import { getRound } from "@/utils/getUseRate";
// 定义订单类型
interface Order {
  price: number;
  amount: number;
  total: number;
}

interface OrderBookProps {
  bookData: any;
  orderData: any;
  priceClickHandler?: (price: number) => void;
}

const OrderBook = ({
  bookData,
  orderData,
  priceClickHandler,
}: OrderBookProps) => {
  const { t } = useTranslation(["spot"]);
  const currentPair = appStore.getCurrentPair() || appStore.currencyPairs[0];
  const [sellOrders, setSellOrders] = useState<Order[]>([]);
  const [buyOrders, setBuyOrders] = useState<Order[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [buyRatio, setBuyRatio] = useState(0);
  const [sellRatio, setSellRatio] = useState(0);
  const [activeTab, setActiveTab] = useState("orderbook");
  const [priceScale, setPriceScale] = useState();
  const [colorMode, setColorMode] = useState(1);
  const [priceDirection, setPriceDirection] = useState<"up" | "down" | "">("");
  const [priceSource, setPriceSource] = useState<"buy" | "sell" | "">("");
  // 假设已有displayType状态变量，控制显示类型：'both'|'buy'|'sell'

  // 获取当前选中的货币对，如果没有则使用币对列表的第一个数据

  // 添加最新成交数据状态
  const [trades, setTrades] = useState<
    { price: number; amount: number; time: string; type: "buy" | "sell" }[]
  >([]);
  const [lastPrice, setLastPrice] = useState(0);

  // 当币对变化时，重置所有订单数据
  useEffect(() => {
    setSellOrders([]);
    setBuyOrders([]);
    setCurrentPrice(0);
    setTrades([]);
    setLastPrice(0);
    setPriceDirection("");
    setPriceSource("");
  }, [currentPair]);

  useEffect(() => {
    console.log("OrderBook 收到数据:", bookData);
    
    // 直接使用WebSocket推送的完整30档位数据
    if (bookData && (bookData.asks || bookData.bids)) {
      // 处理卖单数据 - 直接使用完整的asks数据
      if (bookData.asks && Array.isArray(bookData.asks)) {
        const processedSellOrders: Order[] = bookData.asks
          // .filter((item: [number, number]) => item && item.length >= 2 && Number(item[1]) > 0)
          .map((item: [number, number]) => {
            const price = Number(item[0]);
            const amount = Number(item[1]);
            const total = nul(price, amount);
            return { price, amount, total };
          })

          // .sort((a: Order, b: Order) => b.price - a.price); // 卖单按价格降序排列

        // 根据显示模式限制显示数量
        const maxSellOrders = colorMode === 1 ? 10 : 20;
        setSellOrders(processedSellOrders.slice(0, maxSellOrders).reverse());
      }

      // 处理买单数据 - 直接使用完整的bids数据
      if (bookData.bids && Array.isArray(bookData.bids)) {
        const processedBuyOrders: Order[] = bookData.bids
          // .filter((item: [number, number]) => item && item.length >= 2 && Number(item[1]) > 0)
          .map((item: [number, number]) => {
            const price = Number(item[0]);
            const amount = Number(item[1]);
            const total = nul(price, amount);
            return { price, amount, total };
          })
          // .sort((a: Order, b: Order) => b.price - a.price); // 买单按价格降序排列

        // 根据显示模式限制显示数量
        const maxBuyOrders = colorMode === 1 ? 10 : 20;
        setBuyOrders(processedBuyOrders.slice(0, maxBuyOrders).reverse());
      }

      // 计算当前价格和买卖比例
      if (bookData.asks?.length > 0 && bookData.bids?.length > 0) {
        const topAskPrice = Number(bookData.asks[0][0]);
        const topBidPrice = Number(bookData.bids[0][0]);
        
        // 计算买卖比例
        const totalSellAmount = bookData.asks.reduce(
          (sum: number, item: [number, number]) => sum + Number(item[1]),
          0
        );
        const totalBuyAmount = bookData.bids.reduce(
          (sum: number, item: [number, number]) => sum + Number(item[1]),
          0
        );
        const total = totalSellAmount + totalBuyAmount;

        if (total > 0) {
          setBuyRatio(Number(((totalBuyAmount / total) * 100).toFixed(2)));
          setSellRatio(Number(((totalSellAmount / total) * 100).toFixed(2)));
        }
      } else if (bookData.asks?.length > 0 && currentPrice === 0) {
        setCurrentPrice(Number(bookData.asks[0][0]));
      } else if (bookData.bids?.length > 0 && currentPrice === 0) {
        setCurrentPrice(Number(bookData.bids[0][0]));
      }
    }
  }, [bookData, colorMode]); // 将sellOrders和buyOrders从依赖数组中排除，以避免潜在的循环更新
  // 注意：这里故意不将sellOrders和buyOrders添加到依赖数组中，因为每次更新这些状态会触发新的effect执行，造成无限循环

  // 添加处理交易数据的效果
  useEffect(() => {
    if (orderData && Array.isArray(orderData)) {
      const processedTrades = orderData
        .map((item) => {
          // 解析JSON字符串
          const tradeData = item.data;
          // 检查数据是否有效
          if (!tradeData) return null;

          return {
            price: Number(tradeData?.buy_price) || 0, // 确保数值有效
            amount: Number(tradeData?.quantity) || 0,
            time: tradeData?.timestamp
              ? new Date(tradeData.timestamp).toLocaleTimeString()
              : "--",
            type: tradeData?.taker_side === "Buy" ? "buy" : "sell",
            tradePrice: tradeData?.trade_price || 0,
          };
        })
        .filter((trade) => trade !== null); // 过滤掉无效的交易数据

      // 确保 processedTrades 中的 type 字段是 "buy" 或 "sell"
      const typedProcessedTrades = processedTrades.map((trade) => ({
        ...trade,
        price: Number(trade.price),
        amount: Number(trade.amount),
        type: trade.type === "buy" ? "buy" : ("sell" as "buy" | "sell"),
      }));

      setTrades(typedProcessedTrades);

      // 更新最后成交价
      if (typedProcessedTrades.length > 0) {
        const newPrice = typedProcessedTrades[0].price;
        const newType = typedProcessedTrades[0].type;
        const newTradePrice = typedProcessedTrades[0].tradePrice;

        setLastPrice((prevPrice) => {
          if (prevPrice > 0) {
            // 设置价格方向
            setPriceDirection(
              newPrice > prevPrice ? "up" : newPrice < prevPrice ? "down" : ""
            );
          }

          // 更新当前价格为最新成交价
          setCurrentPrice(newTradePrice);
          setPriceSource(newType);

          return newPrice;
        });
      }

      // 计算最近20条交易的买卖单占比
      const recentTrades = typedProcessedTrades;
      let buyCount = 0;
      let sellCount = 0;

      recentTrades.forEach((trade) => {
        if (trade.type === "buy") {
          buyCount++;
        } else {
          sellCount++;
        }
      });

      const totalCount = buyCount + sellCount;
      if (totalCount > 0) {
        const newBuyRatio = (buyCount / totalCount) * 100;
        const newSellRatio = (sellCount / totalCount) * 100;
        setBuyRatio(Number(newBuyRatio.toFixed(2)));
        setSellRatio(Number(newSellRatio.toFixed(2)));
      }
    }
    if (!orderData || orderData.length === 0) {
      setCurrentPrice(0);
    }
  }, [orderData]); // 保持正确的依赖项

  const renderColorModeButtons = () => {
    return (
      <div className="flex" style={{ gap: "10px" }}>
        {/* 显示买卖盘 */}
        <Tooltip
          title={t("spot.orderBook.bothOrders")}
          overlayInnerStyle={{ fontSize: "12px" }}
        >
          <Image
            src={
              colorMode === 1
                ? "/images/exchange/icon_order_hover.png"
                : "/images/exchange/icon_order.png"
            }
            alt="color-mode"
            width={20}
            height={20}
            style={{ cursor: "pointer" }}
            onClick={() => setColorMode(1)}
          />
        </Tooltip>
        {/* 显示买盘 */}
        <Tooltip
          title={t("spot.orderBook.buyOrders")}
          overlayInnerStyle={{ fontSize: "12px" }}
        >
          <Image
            src={
              colorMode === 2
                ? "/images/exchange/icon_green_hover.png"
                : "/images/exchange/icon_green.png"
            }
            alt="color-mode"
            width={20}
            height={20}
            style={{ cursor: "pointer" }}
            onClick={() => setColorMode(2)}
          />
        </Tooltip>
        {/* 显示卖盘 */}
        <Tooltip
          title={t("spot.orderBook.sellOrders")}
          overlayInnerStyle={{ fontSize: "12px" }}
        >
          <Image
            src={
              colorMode === 3
                ? "/images/exchange/icon_red_hover.png"
                : "/images/exchange/icon_red.png"
            }
            alt="color-mode"
            width={20}
            height={20}
            style={{ cursor: "pointer" }}
            onClick={() => setColorMode(3)}
          />
        </Tooltip>
      </div>
    );
  };

  // 渲染最新成交列表
  const renderTrades = () => {
    return (
      <div className={styles.tradesContainer}>
        <div className={styles.labels} style={{ fontSize: "12px" }}>
          <span>
            {t("spot.orderBook.price")}({currentPair?.baseSymbol})
          </span>
          <span>
            {t("spot.orderBook.amount")}({currentPair?.coinSymbol})
          </span>
          <span>{t("spot.orderBook.time")}</span>
        </div>
        <div
          className={styles.tradesList}
          style={{ height: "450px", overflowY: "auto" }}
        >
          {trades.map((trade, index) => (
            <div key={index} className={styles.tradeRow}>
              <span
                className={`${styles.tradePrice} ${
                  trade.type === "buy" ? styles.buyPrice : styles.sellPrice
                }`}
              >
                {trade.price.toFixed(currentPair?.baseCoinScale || 1)}
              </span>
              <span className={styles.tradeAmount}>
                {trade.amount.toFixed(currentPair?.coinScale || 8)}
              </span>
              <span className={styles.tradeTime}>{trade.time}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handlePriceClick = (price: number) => {
    if (priceClickHandler) {
      priceClickHandler(price);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.tabContainer}>
        <div
          className={`${styles.tab} ${
            activeTab === "orderbook" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("orderbook")}
        >
          {t("spot.orderBook.title")}
        </div>
        <div
          className={`${styles.tab} ${
            activeTab === "trades" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("trades")}
        >
          {t("spot.orderBook.latestTrades")}
        </div>
      </div>

      {activeTab === "orderbook" && (
        <div className={styles.toolbar}>
          {renderColorModeButtons()}

          {/* <Select 
            value={priceScale}
            bordered={false}
            onChange={(e) => setPriceScale(e)}
          >
            <Select.Option value={currentPair?.depthOne}>{currentPair?.depthOne} </Select.Option>
            <Select.Option value={currentPair?.depthTwo}>{currentPair?.depthTwo}</Select.Option>
            <Select.Option value={currentPair?.depthThree}>{currentPair?.depthThree}</Select.Option>
            <Select.Option value={currentPair?.depthFour}>{currentPair?.depthFour}</Select.Option>
          </Select> */}
        </div>
      )}

      {/* 根据活动标签显示不同内容 */}
      {activeTab === "orderbook" ? (
        <>
          <div className={styles.labels} style={{ fontSize: "12px" }}>
            <span>
              {t("spot.orderBook.price")}({currentPair?.baseSymbol})
            </span>
            <span>
              {t("spot.orderBook.amount")}({currentPair?.coinSymbol})
            </span>
            <span>
              {t("spot.orderBook.total")}({currentPair?.baseSymbol})
            </span>
          </div>

          {/* 卖单 */}
          {(colorMode === 1 || colorMode === 3) && (
            <div className={styles.orderList}>
              {sellOrders.map((order, index) => {
                const percentWidth = Math.min(
                  (order.total / Math.max(...sellOrders.map((o) => o.total))) *
                    100,
                  100
                );
                return (
                  <div
                    key={index}
                    className={`${styles.orderRow} ${styles.sell}`}
                    style={{ fontSize: "12px" }}
                  >
                    <span
                      className={styles.price}
                      style={{ cursor: "pointer" }}
                      onClick={() => handlePriceClick(order.price)}
                    >
                      {order.price.toFixed(currentPair?.coinScale)}
                    </span>
                    <span className={styles.amount}>
                      {order.amount.toFixed(5)}
                    </span>
                    <div className={styles.totalColumn}>
                      <div
                        className={styles.background}
                        style={{
                          width: `${percentWidth}%`,
                          transition: "width 0.3s ease-in-out",
                        }}
                      />
                      <span className={styles.total}>
                        {order.total > 10000
                          ? `${(order.total / 10000).toFixed(2)}万`
                          : order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 当前价格 */}
          <div className={styles.currentPrice}>
            <div className={styles.priceContainer}>
              <span
                className={styles.priceValue}
                style={{
                  color:
                    priceSource === "buy" || priceDirection === "up"
                      ? "#00b373" // 绿色
                      : priceSource === "sell" || priceDirection === "down"
                      ? "#ff5252" // 红色
                      : "inherit",
                }}
              >
                {currentPrice.toFixed(currentPair?.baseCoinScale || 1)}
              </span>
              <span
                className={styles.priceChange}
                style={{
                  color:
                    priceDirection === "up"
                      ? "#00b373"
                      : priceDirection === "down"
                      ? "#ff5252"
                      : "inherit",
                }}
              >
                {priceDirection === "up" ? (
                  <Image
                    src={"/images/order_book/up.svg"}
                    width={16}
                    height={16}
                    alt="up"
                    style={{ height: "16px", width: "16px" }}
                  />
                ) : priceDirection === "down" ? (
                  <Image
                    src={"/images/order_book/down.svg"}
                    width={16}
                    height={16}
                    alt="down"
                    style={{ height: "16px", width: "16px" }}
                  />
                ) : (
                  "-"
                )}
              </span>
              <span className={styles.priceCny}>
                ¥ {(currentPrice * 7.18).toFixed(1)}
              </span>
            </div>
          </div>

          {/* 买单 */}
          {(colorMode === 1 || colorMode === 2) && (
            <div className={styles.orderList} style={{ fontSize: "12px" }}>
              {buyOrders.map((order, index) => {
                const percentWidth = Math.min(
                  (order.total / Math.max(...buyOrders.map((o) => o.total))) *
                    100,
                  100
                );
                return (
                  <div
                    key={index}
                    className={`${styles.orderRow} ${styles.buy}`}
                  >
                    <span
                      className={styles.price}
                      style={{ cursor: "pointer" }}
                      onClick={() => handlePriceClick(order.price)}
                    >
                      {order.price.toFixed(currentPair?.baseCoinScale)}
                    </span>
                    <span className={styles.amount}>
                      {order.amount.toFixed(5)}
                    </span>
                    <div className={styles.totalColumn}>
                      <div
                        className={styles.background}
                        style={{
                          width: `${percentWidth}%`,
                          transition: "width 0.3s ease-in-out",
                        }}
                      />
                      <span className={styles.total}>
                        {order.total > 10000
                          ? `${(order.total / 10000).toFixed(2)}万`
                          : order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 买单/卖单比例 */}
          <div className={styles.ratio}>
            <div className={styles.buyBox}>B</div>
            <div className={styles.ratioBar}>
              <div
                className={styles.buyRatio}
                style={{ width: `${buyRatio}%` }}
              >
                <span className={styles.buyPercent}>{buyRatio}%</span>
              </div>
              <div
                className={styles.sellRatio}
                style={{ width: `${sellRatio}%` }}
              >
                <span className={styles.sellPercent}>{sellRatio}%</span>
              </div>
            </div>
            <div className={styles.sellBox}>S</div>
          </div>
        </>
      ) : (
        // 最新成交列表
        renderTrades()
      )}
    </div>
  );
};

export default OrderBook;
