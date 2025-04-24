// components/OrderBook.js
import { useState, useEffect } from 'react';
import styles from './style/OrderBook.module.css';
import Image from 'next/image';
import appStore from '@/store';
import { Tooltip,Select } from 'antd';
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
  const currentPair = appStore.getCurrentPair() || appStore.currencyPairs[0];
  const [sellOrders, setSellOrders] = useState<Order[]>([]);
  const [buyOrders, setBuyOrders] = useState<Order[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [buyRatio, setBuyRatio] = useState(0);
  const [sellRatio, setSellRatio] = useState(0);
  const [activeTab, setActiveTab] = useState('orderbook');
  const [priceScale, setPriceScale] = useState(currentPair?.depthOne);
  const [colorMode, setColorMode] = useState(1);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | ''>('');
  const [priceSource, setPriceSource] = useState<'buy' | 'sell' | ''>('');
  // 假设已有displayType状态变量，控制显示类型：'both'|'buy'|'sell'


    // 获取当前选中的货币对，如果没有则使用币对列表的第一个数据
   
  
  // 添加最新成交数据状态
  const [trades, setTrades] = useState<{price: number; amount: number; time: string; type: 'buy' | 'sell'}[]>([]);
  const [lastPrice, setLastPrice] = useState(0);

  useEffect(() => {
    // console.log('bookData updated:', bookData);
    
    // 确保data存在且包含depth数据结构
    if (bookData && (bookData.asks || bookData.bids)) {
      // 处理卖单数据 - 需要合并相同价格的订单
      const askMap = new Map<number, number>();
      if (bookData.asks && Array.isArray(bookData.asks)) {
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
      }
      
      // 转换为订单列表格式
      const processedSellOrders = Array.from(askMap.entries()).map(([price, amount]) => {
        const total = price * amount;
        return { price, amount, total };
      }).sort((a: Order, b: Order) => a.price - b.price); // 卖单按价格升序排列
      
      // 处理买单数据 - 需要合并相同价格的订单
      const bidMap = new Map<number, number>();
      if (bookData.bids && Array.isArray(bookData.bids)) {
        bookData.bids.forEach((item: [number, number]) => {
          const price = item[0];
          const amount = Math.abs(item[1]); // 确保数量为正值
          
          // 对相同价格的订单进行数量累加
          if (bidMap.has(price)) {
            bidMap.set(price, bidMap.get(price)! + amount);
          } else {
            bidMap.set(price, amount);
          }
        });
      }
      
      // 转换为订单列表格式
      const processedBuyOrders = Array.from(bidMap.entries()).map(([price, amount]) => {
        const total = price * amount;
        return { price, amount, total };
      }).sort((a: Order, b: Order) => b.price - a.price); // 买单按价格降序排列
      
      // 根据priceScale过滤订单
      const filterOrdersByDepth = (orders, currentPrice, depth) => {
        return orders.filter(order => 
          Math.abs(order.price - currentPrice) <= depth
        );
      };

      // 处理卖单和买单
      const filteredSellOrders = filterOrdersByDepth(processedSellOrders, currentPrice, priceScale);
      const filteredBuyOrders = filterOrdersByDepth(processedBuyOrders, currentPrice, priceScale);

      // 设置状态
      setSellOrders(filteredSellOrders.slice(0, 10));
      setBuyOrders(filteredBuyOrders.slice(0, 10));
      
      // 修改条件判断，分别处理只有买盘和只有卖盘的情况
      // 更新当前价格的逻辑
      if (colorMode === 2 && processedBuyOrders.length > 0) {
        // 只显示买盘且有买单数据时，使用最高买入价
        const highestBid = processedBuyOrders[0].price;
        setCurrentPrice(highestBid);
        setPriceSource('buy');
      } else if (colorMode === 3 && processedSellOrders.length > 0) {
        // 只显示卖盘且有卖单数据时，使用最低卖出价
        const lowestAsk = processedSellOrders[0].price;
        setCurrentPrice(lowestAsk);
        setPriceSource('sell');
      } else if (colorMode === 1) {
        // 显示买卖盘时
        if (processedBuyOrders.length > 0 && processedSellOrders.length > 0) {
          // 有买有卖时
          if (lastPrice === 0) {
            // 尚无成交价，使用中间价
            const lowestAsk = processedSellOrders[0].price;
            const highestBid = processedBuyOrders[0].price;
            setCurrentPrice((lowestAsk + highestBid) / 2);
            setPriceSource('');
          }
        } else if (processedBuyOrders.length > 0) {
          // 只有买盘数据时
          const highestBid = processedBuyOrders[0].price;
          setCurrentPrice(highestBid);
          setPriceSource('buy');
        } else if (processedSellOrders.length > 0) {
          // 只有卖盘数据时
          const lowestAsk = processedSellOrders[0].price;
          setCurrentPrice(lowestAsk);
          setPriceSource('sell');
        }
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
  }, [bookData, lastPrice, colorMode]); // 添加colorMode作为依赖项

  // 添加处理交易数据的效果
  useEffect(() => {
    if (orderData && Array.isArray(orderData)) {
      const processedTrades = orderData.map((item) => {
        // 解析JSON字符串
        const tradeData = item.data
        return {
          price: tradeData?.buy_price, // 或 sell_price，它们是相同的
          amount: tradeData?.quantity,
          time: new Date(tradeData?.timestamp).toLocaleTimeString(),
          type: tradeData?.taker_side === 'Buy' ? 'buy' : 'sell'
        };
      });
      
      // 确保 processedTrades 中的 type 字段是 "buy" 或 "sell"
      const typedProcessedTrades = processedTrades.map(trade => ({
        ...trade,
        price: Number(trade.price),
        amount: Number(trade.amount),
        type: trade.type === 'buy' ? 'buy' : 'sell' as 'buy' | 'sell'
      }));
      
      setTrades(typedProcessedTrades);
      
      // 更新最后成交价
      if (typedProcessedTrades.length > 0) {
        const newPrice = typedProcessedTrades[0].price;
        const newType = typedProcessedTrades[0].type;
        
        setLastPrice(prevPrice => {
          if (prevPrice > 0) {
            // 设置价格方向
            setPriceDirection(newPrice > prevPrice ? 'up' : newPrice < prevPrice ? 'down' : '');
            
            // 更新trades数组中的第一个元素
            setTrades(prev => {
              return [typedProcessedTrades[0], ...prev.slice(1)];
            });
          }
          
          // 无论当前显示模式如何，始终将当前价格更新为最新成交价
          setCurrentPrice(newPrice);
          setPriceSource(newType);
          
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
  }, [orderData]); // 移除colorMode依赖，确保总是更新最新成交价

  const renderColorModeButtons = () => {
    return (
      <div className='flex' style={{gap:'10px'}}>
        {/* 显示买卖盘 */}
        <Tooltip title="买卖盘">
        <Image 
          src={colorMode === 1 ? '/images/exchange/icon_order_hover.png' : '/images/exchange/icon_order.png'} 
          alt="color-mode" 
          width={20} 
          height={20} 
          style={{cursor:'pointer'}}
          onClick={() => setColorMode(1)}
        /> 
        </Tooltip>
        {/* 显示买盘 */}
        <Tooltip title="买盘">
        <Image 
          src={colorMode === 2 ? '/images/exchange/icon_green_hover.png' : '/images/exchange/icon_green.png'} 
          alt="color-mode" 
          width={20} 
          height={20} 
          style={{cursor:'pointer'}}
          onClick={() => setColorMode(2)}
        />
        </Tooltip>
        {/* 显示卖盘 */}
        <Tooltip title="卖盘">
        <Image 
          src={colorMode === 3 ? '/images/exchange/icon_red_hover.png' : '/images/exchange/icon_red.png'} 
          alt="color-mode" 
          width={20} 
          height={20} 
          style={{cursor:'pointer'}}
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
        <div className={styles.labels}>
          <span>价格({currentPair?.baseSymbol})</span>
          <span>数量({currentPair?.coinSymbol})</span>
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
          
          <Select 
            value={priceScale}
            bordered={false}
            onChange={(e) => setPriceScale(e)}
          >
            <Select.Option value={currentPair?.depthOne}>{currentPair?.depthOne} </Select.Option>
            <Select.Option value={currentPair?.depthTwo}>{currentPair?.depthTwo}</Select.Option>
            <Select.Option value={currentPair?.depthThree}>{currentPair?.depthThree}</Select.Option>
            <Select.Option value={currentPair?.depthFour}>{currentPair?.depthFour}</Select.Option>
          </Select>
        </div>
      )}
     

      {/* 根据活动标签显示不同内容 */}
      {activeTab === 'orderbook' ? (
        <>
          <div className={styles.labels}>
            <span>价格({currentPair?.baseSymbol}) <span className={styles.sortIcon}>⇅</span></span>
            <span>数量({currentPair?.coinSymbol})</span>
            <span>总额({currentPair?.baseSymbol}) <span className={styles.sortIcon}>⇅</span></span>
          </div>

          {/* 卖单 */}
          {(colorMode === 1 || colorMode === 3) && (
            <div className={styles.orderList}>
              {sellOrders.map((order, index) => {
                const percentWidth = Math.min((order.total / Math.max(...sellOrders.map(o => o.total))) * 100, 100);
                return (
                  <div key={index} className={`${styles.orderRow} ${styles.sell}`} style={{fontSize:'12px'}}>
                    <span className={styles.price}>{order.price.toFixed(1)}</span>
                    <span className={styles.amount}>{order.amount.toFixed(5)}</span>
                    <div className={styles.totalColumn}>
                      <div 
                        className={styles.background}
                        style={{ 
                          width: `${percentWidth}%`,
                          transition: 'width 0.3s ease-in-out'
                        }}
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
          )}

          {/* 当前价格 */}
          <div className={styles.currentPrice}>
            <div className={styles.priceContainer}>
              <span 
                className={styles.priceValue}
                style={{ 
                  color: priceSource === 'buy' || priceDirection === 'up' 
                    ? '#00b373' // 绿色
                    : priceSource === 'sell' || priceDirection === 'down' 
                      ? '#ff5252' // 红色
                      : 'inherit' 
                }}
              >
                {currentPrice.toFixed(2)}
              </span>
              <span 
                className={styles.priceChange}
                style={{ 
                  color: priceDirection === 'up' 
                    ? '#00b373' 
                    : priceDirection === 'down' 
                      ? '#ff5252' 
                      : 'inherit' 
                }}
              >
                {priceDirection === 'up' ? '↑' : priceDirection === 'down' ? '↓' : '-'}
              </span>
              <span className={styles.priceCny}>¥ {(currentPrice * 7.18).toFixed(1)}</span>
            </div>
          </div>

          {/* 买单 */}
          {(colorMode === 1 || colorMode === 2) && (
            <div className={styles.orderList} style={{fontSize:'12px'}}>
              {buyOrders.map((order, index) => {
                const percentWidth = Math.min((order.total / Math.max(...buyOrders.map(o => o.total))) * 100, 100);
                return (
                  <div key={index} className={`${styles.orderRow} ${styles.buy}`}>
                    <span className={styles.price}>{order.price.toFixed(1)}</span>
                    <span className={styles.amount}>{order.amount.toFixed(5)}</span>
                    <div className={styles.totalColumn}>
                      <div 
                        className={styles.background}
                        style={{ 
                          width: `${percentWidth}%`,
                          transition: 'width 0.3s ease-in-out'
                        }}
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