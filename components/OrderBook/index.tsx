// components/OrderBook.js
import { useState, useEffect } from 'react';
import styles from './style/OrderBook.module.css';
import Image from 'next/image';
// 定义订单类型
interface Order {
  price: number;
  amount: number;
  total: number;
}

interface OrderBookProps {

  bookData: any;
  orderData: any;
}

const OrderBook = ({  bookData, orderData }: OrderBookProps) => {
  const [sellOrders, setSellOrders] = useState<Order[]>([]);
  const [buyOrders, setBuyOrders] = useState<Order[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [buyRatio, setBuyRatio] = useState(0);
  const [sellRatio, setSellRatio] = useState(0);
  const [activeTab, setActiveTab] = useState('orderbook');
  const [priceScale, setPriceScale] = useState('0.1');
  const [colorMode, setColorMode] = useState(1);
  
  // 添加最新成交数据状态
  const [trades, setTrades] = useState<{price: number; amount: number; time: string; type: 'buy' | 'sell'}[]>([]);
  const [lastPrice, setLastPrice] = useState(0);

  useEffect(() => {
    // 确保data存在且包含depth数据结构
    if (bookData && bookData.asks && bookData.bids) {
      // 处理卖单数据 - 需要合并相同价格的订单
      const askMap = new Map<number, number>();
      bookData.asks.forEach((item: [number, number]) => {
        const price = item[0];
        const amount = item[1];
        
        // 对相同价格的订单进行数量累加
        if (askMap.has(price)) {
          askMap.set(price, askMap.get(price)! + amount);
        } else {
          askMap.set(price, amount);
        }
      });
      
      // 转换为订单列表格式
      const processedSellOrders = Array.from(askMap.entries()).map(([price, amount]) => {
        const total = price * amount;
        return { price, amount, total };
      }).sort((a: Order, b: Order) => a.price - b.price); // 卖单按价格升序排列
      
      // 处理买单数据 - 需要合并相同价格的订单
      const bidMap = new Map<number, number>();
      bookData.bids.forEach((item: [number, number]) => {
        const price = item[0];
        const amount = Math.abs(item[1]); // 取绝对值，买单数量为负数
        
        // 对相同价格的订单进行数量累加
        if (bidMap.has(price)) {
          bidMap.set(price, bidMap.get(price)! + amount);
        } else {
          bidMap.set(price, amount);
        }
      });
      
      // 转换为订单列表格式
      const processedBuyOrders = Array.from(bidMap.entries()).map(([price, amount]) => {
        const total = price * amount;
        return { price, amount, total };
      }).sort((a: Order, b: Order) => b.price - a.price); // 买单按价格降序排列
      
      // 限制显示的订单数量，只显示前10个
      setSellOrders(processedSellOrders.slice(0, 10));
      setBuyOrders(processedBuyOrders.slice(0, 10));
      
      // 更新当前价格（使用中间价格）
      if (processedSellOrders.length > 0 && processedBuyOrders.length > 0) {
        const lowestAsk = processedSellOrders[0].price;
        const highestBid = processedBuyOrders[0].price;
        setCurrentPrice((lowestAsk + highestBid) / 2);
      }
      
      // 计算买单和卖单比例
      const totalBuyAmount = processedBuyOrders.reduce((sum, order) => sum + order.amount, 0);
      const totalSellAmount = processedSellOrders.reduce((sum, order) => sum + order.amount, 0);
      const total = totalBuyAmount + totalSellAmount;
      
      if (total > 0) {
        const buyPercentage = (totalBuyAmount / total) * 100;
        const sellPercentage = (totalSellAmount / total) * 100;
        setBuyRatio(Number(buyPercentage.toFixed(2)));
        setSellRatio(Number(sellPercentage.toFixed(2)));
      }
    }
  }, [bookData]); // 当data变化时重新处理数据

  // 添加处理交易数据的效果
  useEffect(() => {
    if (orderData && Array.isArray(orderData)) {
      const processedTrades = orderData.map((item) => {
        // 解析JSON字符串
        const tradeData = JSON.parse(item.data);
        return {
          price: tradeData.buy_price, // 或 sell_price，它们是相同的
          amount: tradeData.quantity,
          time: new Date(tradeData.timestamp).toLocaleTimeString(),
          type: tradeData.taker_side === 'Buy' ? 'buy' : 'sell'
        };
      });
      
      setTrades(processedTrades);
      
      // 更新最后成交价
      if (processedTrades.length > 0) {
        const newPrice = processedTrades[0].price;
        setLastPrice(prevPrice => {
          if (prevPrice > 0) {
            processedTrades[0].direction = newPrice >= prevPrice ? 'up' : 'down';
          }
          return newPrice;
        });
      }
      
      // 计算最近20条交易的买卖单占比
      const recentTrades = processedTrades.slice(0, 20);
      let buyCount = 0;
      let sellCount = 0;
      
      recentTrades.forEach(trade => {
        if (trade.type === 'buy') {
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
  }, [orderData]);

  const renderColorModeButtons = () => {
    const colorModes = [
      { id: 1, buyColor: '#00c788', sellColor: '#ff6347' },
      { id: 2, buyColor: '#00c788', sellColor: '#999' },
      { id: 3, buyColor: '#999', sellColor: '#ff6347' },
      { id: 4, buyColor: '#00c788', sellColor: '#00c788' },
      { id: 5, buyColor: '#ff6347', sellColor: '#ff6347' },
      { id: 6, buyColor: '#ff6347', sellColor: '#00c788' },
    ];

    return (
      <div className='flex' style={{gap:'10px'}}>
        <Image src='/images/exchange/icon_order_hover.png' alt="color-mode" width={20} height={20} style={{cursor:'pointer'}}/>
        <Image src='/images/exchange/icon_green_hover.png' alt="color-mode" width={20} height={20} style={{cursor:'pointer'}}/>
        <Image src='/images/exchange/icon_red_hover.png' alt="color-mode" width={20} height={20} style={{cursor:'pointer'}}/>
      </div>
    );
  };

  // 渲染最新成交列表
  const renderTrades = () => {
    return (
      <div className={styles.tradesContainer}>
        <div className={styles.labels}>
          <span>价格(USDT)</span>
          <span>数量(BTC)</span>
          <span>时间</span>
        </div>
        <div className={styles.tradesList} style={{ height: '450px', overflowY: 'auto' }}>
          {trades.map((trade, index) => (
            <div key={index} className={styles.tradeRow}>
              <span 
                className={`${styles.tradePrice} ${
                  trade.type === 'buy' ? styles.buyPrice : styles.sellPrice
                }`}
              >
                {trade.price.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})}
              </span>
              <span className={styles.tradeAmount}>
                {trade.amount.toFixed(8)}
              </span>
              <span className={styles.tradeTime}>{trade.time}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.tabContainer}>
        <div 
          className={`${styles.tab} ${activeTab === 'orderbook' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('orderbook')}
        >
          盘口
        </div>
        <div 
          className={`${styles.tab} ${activeTab === 'trades' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('trades')}
        >
          最新成交
        </div>
      </div>
      
      {
        activeTab === 'orderbook' && (
          <div className={styles.toolbar}>
          {renderColorModeButtons()}
          
          <select 
            className={styles.dropdown}
            value={priceScale}
            onChange={(e) => setPriceScale(e.target.value)}
          >
            <option value="0.1">0.1</option>
            <option value="1">1</option>
            <option value="10">10</option>
          </select>
        </div>
      )}
     

      {/* 根据活动标签显示不同内容 */}
      {activeTab === 'orderbook' ? (
        <>
          <div className={styles.labels}>
            <span>价格(USDT) <span className={styles.sortIcon}>⇅</span></span>
            <span>数量(BTC)</span>
            <span>总额(USDT) <span className={styles.sortIcon}>⇅</span></span>
          </div>

          {/* 卖单 */}
          <div className={styles.orderList}>
            {sellOrders.map((order, index) => {
              const percentWidth = (order.total / Math.max(...sellOrders.map(o => o.total))) * 100;
              return (
                <div key={index} className={`${styles.orderRow} ${styles.sell}`} style={{fontSize:'12px'}}>
                  <span className={styles.price}>{order.price.toFixed(1)}</span>
                  <span className={styles.amount}>{order.amount.toFixed(5)}</span>
                  <div className={styles.totalColumn}>
                    <div 
                      className={styles.background}
                      style={{ width: `${percentWidth}%` }}
                    />
                    <span className={styles.total}>
                      {order.total > 10000 
                        ? `${(order.total/10000).toFixed(2)}万` 
                        : order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 当前价格 */}
          <div className={styles.currentPrice}>
            <div className={styles.priceContainer}>
              <span className={styles.priceValue}>{currentPrice.toFixed(2)}</span>
              <span className={styles.priceChange}>↓</span>
              <span className={styles.priceCny}>¥ {(currentPrice * 7.18).toFixed(1)}</span>
            </div>
          </div>

          {/* 买单 */}
          <div className={styles.orderList} style={{fontSize:'12px'}}>
            {buyOrders.map((order, index) => {
              const percentWidth = (order.total / Math.max(...buyOrders.map(o => o.total))) * 100;
              return (
                <div key={index} className={`${styles.orderRow} ${styles.buy}`}>
                  <span className={styles.price}>{order.price.toFixed(1)}</span>
                  <span className={styles.amount}>{order.amount.toFixed(5)}</span>
                  <div className={styles.totalColumn}>
                    <div 
                      className={styles.background}
                      style={{ width: `${percentWidth}%` }}
                    />
                    <span className={styles.total}>
                      {order.total > 10000 
                        ? `${(order.total/10000).toFixed(2)}万` 
                        : order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

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