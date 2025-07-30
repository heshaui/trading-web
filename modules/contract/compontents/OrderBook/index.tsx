// components/OrderBook.js
import { useState, useEffect } from "react";
import styles from "./style/OrderBook.module.css";
import Image from "next/image";
import appStore from "@/store";
import { Tooltip, Select } from "antd";
import { useTranslation } from "next-i18next";
import { add, cut, nul, roundDown } from "@/utils/index";
import { getPairsRate } from "@/utils/getUseRate";
// 定义订单类型
interface Order {
  price: number;
  amount: number;
  total: number;
}

// 定义交易类型
interface Trade {
  price: number;
  amount: number;
  time: string;
  type: 'buy' | 'sell';
}

// 定义货币对类型
interface CurrencyPair {
  baseCoinScale: number;
  quoteCoinScale: number;
  symbol: string;
  baseSymbol: string;
  quoteSymbol: string;
}

// WebSocket数据结构
interface WebSocketData {
  event_rep: string;
  channel: string;
  data: any;
  tick: {
    asks: [number, number][]; // [价格, 数量]
    buys: [number, number][];  // [价格, 数量]
  };
  ts: number;
  status: string;
}

interface OrderBookProps {
  bookData: WebSocketData | any; // 支持WebSocket数据格式
  orderData?: any;
  klineData?: any;
  priceClickHandler?: (price: number) => void;
}

const OrderBook = ({
  bookData,
  orderData,
  klineData,
  priceClickHandler,
}: OrderBookProps) => {
  const { t } = useTranslation(["spot"]);

  const [sellOrders, setSellOrders] = useState<Order[]>([]);
  const [buyOrders, setBuyOrders] = useState<Order[]>([]);
  
  // 调试：监听状态变化
  useEffect(() => {
    console.log('sellOrders state changed:', sellOrders);
  }, [sellOrders]);
  
  useEffect(() => {
    console.log('buyOrders state changed:', buyOrders);
  }, [buyOrders]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [priceSource, setPriceSource] = useState<'buy' | 'sell' | null>(null);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | null>(null);
  const [currentPair, setCurrentPair] = useState<CurrencyPair | null>(null);

  const [priceScale, setPriceScale] = useState<string>("0.1");
  const [colorMode, setColorMode] = useState(1);

  // 初始化默认设置
  useEffect(() => {
    // 设置默认货币对信息
    if (!currentPair) {
      setCurrentPair({
        baseCoinScale: 2,
        quoteCoinScale: 5,
        symbol: 'BTCUSDT',
        baseSymbol: 'BTC',
        quoteSymbol: 'USDT'
      });
    }
  }, [currentPair]);

  // 监听价格变化
  useEffect(() => {
    if (klineData && klineData.close) {
      const newPrice = parseFloat(klineData.close);
      const oldPrice = currentPrice;
      
      setCurrentPrice(newPrice);
      
      if (newPrice > oldPrice) {
        setPriceDirection('up');
        setPriceSource('buy');
      } else if (newPrice < oldPrice) {
        setPriceDirection('down');
        setPriceSource('sell');
      }
    }
  }, [klineData, currentPrice]);

  // 处理订单簿数据
  useEffect(() => {
    console.log('OrderBook useEffect triggered, bookData:', bookData);
    
    if (bookData) {
      // 处理WebSocket数据格式：bookData.tick.asks 和 bookData.tick.buys
      const tickData = bookData.tick || bookData;
      
      console.log('Processing tickData:', tickData);
      console.log('tickData.asks:', tickData.asks);
      console.log('tickData.buys:', tickData.buys);
      
      // 处理卖单数据 (asks)
      if (tickData.asks && Array.isArray(tickData.asks)) {
        const processedSells = tickData.asks.map((ask: any) => ({
          price: parseFloat(ask[0]),
          amount: parseFloat(ask[1]),
          total: parseFloat(ask[0]) * parseFloat(ask[1])
        })).sort((a: Order, b: Order) => a.price - b.price); // 卖单按价格从低到高排序
        
        console.log('Processed sell orders:', processedSells);
        setSellOrders(processedSells);
      }

      // 处理买单数据 (buys)
      if (tickData.buys && Array.isArray(tickData.buys)) {
        const processedBuys = tickData.buys.map((bid: any) => ({
          price: parseFloat(bid[0]),
          amount: parseFloat(bid[1]),
          total: parseFloat(bid[0]) * parseFloat(bid[1])
        })).sort((a: Order, b: Order) => b.price - a.price); // 买单按价格从高到低排序
        
        console.log('Processed buy orders:', processedBuys);
        setBuyOrders(processedBuys);
      }

      // 兼容旧格式 (bids)
      if (tickData.bids && Array.isArray(tickData.bids)) {
        const processedBuys = tickData.bids.map((bid: any) => ({
          price: parseFloat(bid[0]),
          amount: parseFloat(bid[1]),
          total: parseFloat(bid[0]) * parseFloat(bid[1])
        })).sort((a: Order, b: Order) => b.price - a.price);
        setBuyOrders(processedBuys);
      }
    }
  }, [bookData]);



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
        <div>实时成交</div>
        <div className={styles.labels} style={{ fontSize: "12px" }}>
          <span>
            {t("spot.orderBook.price")}
          </span>
          <span>
            {t("spot.orderBook.amount")}
          </span>
          <span>{t("spot.orderBook.time")}</span>
        </div>
        <div
          className={styles.tradesList}
          style={{ height: "450px", overflowY: "auto" }}
        >
          {trades.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-color6)' }}>
              暂无交易数据
            </div>
          ) : (
            trades.map((trade, index) => (
            <div key={index} className={styles.tradeRow}>
              <span
                className={`${styles.tradePrice} ${
                  trade.type === "buy" ? styles.buyPrice : styles.sellPrice
                }`}
              >
                {trade.price.toFixed(currentPair?.baseCoinScale || 2)}
              </span>
              <span className={styles.tradeAmount}>
                {trade.amount.toFixed(currentPair?.quoteCoinScale || 5)}
              </span>
              <span className={styles.tradeTime}>{trade.time}</span>
            </div>
          ))
          )}
        </div>
      </div>
    );
  };

  // 价格精度聚合函数
  const aggregateOrdersByPriceScale = (orders: Order[], scale: string, type: 'buy' | 'sell' = 'buy') => {
    const scaleNum = parseFloat(scale);
    const aggregated = new Map<number, Order>();

    orders.forEach(order => {
      const aggregatedPrice = Math.floor(order.price / scaleNum) * scaleNum;
      const existing = aggregated.get(aggregatedPrice);
      
      if (existing) {
        aggregated.set(aggregatedPrice, {
          price: aggregatedPrice,
          amount: existing.amount + order.amount,
          total: existing.total + order.total
        });
      } else {
        aggregated.set(aggregatedPrice, {
          price: aggregatedPrice,
          amount: order.amount,
          total: order.total
        });
      }
    });

    // 买单按价格从高到低排序，卖单按价格从低到高排序
    const sortedOrders = Array.from(aggregated.values());
    return type === 'buy' 
      ? sortedOrders.sort((a, b) => b.price - a.price)
      : sortedOrders.sort((a, b) => a.price - b.price);
  };

  const handlePriceClick = (price: number) => {
    if (priceClickHandler) {
      priceClickHandler(price);
    }
  };

  return (
    <div className={styles.container}>
      {/* <div className={styles.tabContainer}> */}
        {/* <div
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
      </div> */}
      <div>委托列表</div>

        <div className={styles.toolbar}>
          {renderColorModeButtons()}

          <Select 
            value={priceScale || "0.1"}
            bordered={false}
            onChange={(e) => setPriceScale(e)}
            className={styles.priceScaleSelect}
            size="small"
          >
            <Select.Option value="0.1">0.1</Select.Option>
            <Select.Option value="0.01">0.01</Select.Option>
            <Select.Option value="0.001">0.001</Select.Option>
            <Select.Option value="0.0001">0.0001</Select.Option>
          </Select>
        </div>


      {/* 根据活动标签显示不同内容 */}

        <>
          <div className={styles.labels} style={{ fontSize: "12px" }}>
            <span>
              {t("spot.orderBook.price")}
            </span>
            <span>
              {t("spot.orderBook.amount")}
            </span>
            <span>
              {t("spot.orderBook.total")}
            </span>
          </div>

          {/* 卖单 */}
          {(colorMode === 1 || colorMode === 3) && (
            <div className={styles.orderList}>
              {sellOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-color6)' }}>
                  暂无卖单数据
                </div>
              ) : (
                aggregateOrdersByPriceScale(sellOrders, priceScale, 'sell').map((order, index) => {
                const aggregatedSells = aggregateOrdersByPriceScale(sellOrders, priceScale, 'sell');
                const maxTotal = aggregatedSells.length > 0 ? Math.max(...aggregatedSells.map((o) => o.total)) : 1;
                const percentWidth = Math.min((order.total / maxTotal) * 100, 100);
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
                      {order.price.toFixed(currentPair?.baseCoinScale || 2)}
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
              })
              )}
            </div>
          )}

          {/* 当前价格 */}
          <div className={styles.currentPrice}>
            <div className={styles.priceContainer}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                  {currentPrice > 0 ? currentPrice.toFixed(currentPair?.baseCoinScale || 2) : '--'}
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
                <span className={styles.priceLabel}>
                  {currentPrice > 0 ? currentPrice.toLocaleString() : '--'}
                </span>
              </div>
              <span className={styles.priceCny}>
                ¥ {currentPrice > 0 ? getPairsRate(currentPrice, 'CNY').rate.toFixed(2) : '--'}
              </span>
            </div>
          </div>

          {/* 买单 */}
          {(colorMode === 1 || colorMode === 2) && (
            <div className={styles.orderList} style={{ fontSize: "12px" }}>
              {buyOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-color6)' }}>
                  暂无买单数据
                </div>
              ) : (
                aggregateOrdersByPriceScale(buyOrders, priceScale, 'buy').map((order, index) => {
                const aggregatedBuys = aggregateOrdersByPriceScale(buyOrders, priceScale, 'buy');
                const maxTotal = aggregatedBuys.length > 0 ? Math.max(...aggregatedBuys.map((o) => o.total)) : 1;
                const percentWidth = Math.min((order.total / maxTotal) * 100, 100);
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
                      {order.price.toFixed(currentPair?.baseCoinScale || 2)}
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
              })
              )}
            </div>
          )}
        </>

        {/* 最新成交列表 */}
        {renderTrades()}

    </div>
  );
};

export default OrderBook;
