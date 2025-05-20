// components/OrderBook.js
import { useState, useEffect } from 'react';
import styles from './style/OrderBook.module.css';
import Image from 'next/image';
import appStore from '@/store';
import { Tooltip,Select } from 'antd';
import { add,cut,nul,roundDown } from '@/utils/index';
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

const OrderBook = ({  bookData, orderData, priceClickHandler }: OrderBookProps) => {
  console.log(bookData, 'bookData');
  console.log(orderData, 'orderData');
  const currentPair = appStore.getCurrentPair() || appStore.currencyPairs[0];
  const [sellOrders, setSellOrders] = useState<Order[]>([]);
  const [buyOrders, setBuyOrders] = useState<Order[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [buyRatio, setBuyRatio] = useState(0);
  const [sellRatio, setSellRatio] = useState(0);
  const [activeTab, setActiveTab] = useState('orderbook');
  const [priceScale, setPriceScale] = useState();
  const [colorMode, setColorMode] = useState(1);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | ''>('');
  const [priceSource, setPriceSource] = useState<'buy' | 'sell' | ''>('');
  // 假设已有displayType状态变量，控制显示类型：'both'|'buy'|'sell'


    // 获取当前选中的货币对，如果没有则使用币对列表的第一个数据
   
  
  // 添加最新成交数据状态
  const [trades, setTrades] = useState<{price: number; amount: number; time: string; type: 'buy' | 'sell'}[]>([]);
  const [lastPrice, setLastPrice] = useState(0);

  useEffect(() => {
    console.log('原始数据:', bookData); // 添加日志输出查看原始数据
    
    // 直接使用bookData中的asks和bids数据
    if (bookData && (bookData.asks || bookData.bids)) {
      // 处理卖单数据 - 直接使用asks数据
      if (bookData.asks && Array.isArray(bookData.asks)) {
        // 获取当前卖单列表的副本
        const currentSellOrders = [...sellOrders];
        const updatedSellOrders: Order[] = [];
        const priceMap = new Map<number, number>();
        
        // 首先将现有的价格和数量存入Map中
        currentSellOrders.forEach(order => {
          priceMap.set(order.price, order.amount);
        });
        
        // 处理新的数据
        bookData.asks.forEach((item: [number, number]) => {
          const price = Number(item[0]);
          const amount = Number(item[1]);
          
          if (amount < 0) {
            // 如果数量为负，从现有数量中减去
            const existingAmount = priceMap.get(price) || 0;
            const newAmount = Math.max(0, existingAmount + amount); // 加上负数就是减去
            if (newAmount > 0) {
              priceMap.set(price, newAmount);
            } else {
              priceMap.delete(price); // 如果数量变为0或负数，删除此价格
            }
          } else {
            // 如果数量为正，正常添加或更新
            priceMap.set(price, amount);
          }
        });
        
        // 将Map转换回数组并过滤掉数量为0的订单
        priceMap.forEach((amount, price) => {
          if (amount > 0) {  // 只添加数量大于0的订单
            const total = nul(price, amount);
            updatedSellOrders.push({ price, amount, total });
          }
        });
        
        // 卖单按价格降序排列
        updatedSellOrders.sort((a: Order, b: Order) => b.price - a.price);
        if (colorMode === 1) {
          setSellOrders(updatedSellOrders.splice(0, 10));
        } else {
          setSellOrders(updatedSellOrders.splice(0, 20));
        }
        
      }
      
      // 处理买单数据 - 直接使用bids数据
      if (bookData.bids && Array.isArray(bookData.bids)) {
        // 获取当前买单列表的副本
        const currentBuyOrders = [...buyOrders];
        const updatedBuyOrders: Order[] = [];
        const priceMap = new Map<number, number>();
        
        // 首先将现有的价格和数量存入Map中
        currentBuyOrders.forEach(order => {
          priceMap.set(order.price, order.amount);
        });
        
        // 处理新的数据
        bookData.bids.forEach((item: [number, number]) => {
          const price = Number(item[0]);
          const amount = Number(item[1]);
          
          if (amount < 0) {
            // 如果数量为负，从现有数量中减去
            const existingAmount = priceMap.get(price) || 0;
            // const newAmount = Math.max(0, existingAmount - Math.abs(amount));
           const  newAmount=cut(Number(existingAmount),Number(amount))
            if (Number(newAmount) > 0) {  
              priceMap.set(price,Number(newAmount));
            } else {
              priceMap.delete(price); // 如果数量变为0或负数，删除此价格
            }
          } else {
            // 如果数量为正，正常添加或更新
            priceMap.set(price, amount);
          }
        });
        
        // 将Map转换回数组并过滤掉数量为0的订单
        priceMap.forEach((amount, price) => {
          if (amount > 0) {  // 只添加数量大于0的订单
            const total = nul(price, amount);
            updatedBuyOrders.push({ price, amount, total });
          }
        });
        
        // 买单按价格降序排列
        updatedBuyOrders.sort((a: Order, b: Order) => b.price - a.price);
        if (colorMode === 1) {
          setBuyOrders(updatedBuyOrders.splice(0, 10));
        } else {
          setBuyOrders(updatedBuyOrders.splice(0, 20));
        }
      }
      
      console.log('处理后卖单数据:', sellOrders);
      console.log('处理后买单数据:', buyOrders);

      // 计算当前价格
      if (bookData.asks?.length > 0 && bookData.bids?.length > 0) {
        const topAskPrice = Number(bookData.asks[0][0]);
        const topBidPrice = Number(bookData.bids[0][0]);
        const midPrice = (topAskPrice + topBidPrice) / 2;
        // if (currentPrice === 0) {
        //   setCurrentPrice(midPrice);
        // }
        
        // 计算买卖比例
        const totalSellAmount = bookData.asks.reduce((sum: number, item: [number, number]) => sum + Number(item[1]), 0);
        const totalBuyAmount = bookData.bids.reduce((sum: number, item: [number, number]) => sum + Math.abs(Number(item[1])), 0);
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
  }, [bookData, currentPrice, priceScale]); // 将sellOrders和buyOrders从依赖数组中排除，以避免潜在的循环更新
  // 注意：这里故意不将sellOrders和buyOrders添加到依赖数组中，因为每次更新这些状态会触发新的effect执行，造成无限循环

  // 添加处理交易数据的效果
  useEffect(() => {
    if (orderData && Array.isArray(orderData)) {
      const processedTrades = orderData.map((item) => {
        // 解析JSON字符串
        const tradeData = item.data
        // 检查数据是否有效
        if (!tradeData) return null;
        
        return {
          price: Number(tradeData?.buy_price) || 0, // 确保数值有效
          amount: Number(tradeData?.quantity) || 0,
          time: tradeData?.timestamp ? new Date(tradeData.timestamp).toLocaleTimeString() : '--',
          type: tradeData?.taker_side === 'Buy' ? 'buy' : 'sell',
          tradePrice:tradeData?.trade_price || 0

        };
      }).filter(trade => trade !== null); // 过滤掉无效的交易数据
      
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
        const newTradePrice = typedProcessedTrades[0].tradePrice;
        
        setLastPrice(prevPrice => {
          if (prevPrice > 0) {
            // 设置价格方向
            setPriceDirection(newPrice > prevPrice ? 'up' : newPrice < prevPrice ? 'down' : '');
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
    if(!orderData || orderData.length === 0) {
      setCurrentPrice(0);
    }
  }, [orderData]); // 保持正确的依赖项

  const renderColorModeButtons = () => {
    return (
      <div className='flex' style={{gap:'10px'}}>
        {/* 显示买卖盘 */}
        <Tooltip title="买卖盘" overlayInnerStyle={{fontSize: '12px'}}>
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
        <Tooltip title="买盘" overlayInnerStyle={{fontSize: '12px'}}>
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
        <Tooltip title="卖盘" overlayInnerStyle={{fontSize: '12px'}}>
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
        <div className={styles.labels} style={{fontSize:'12px'}}>
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
      {activeTab === 'orderbook' ? (
        <>
          <div className={styles.labels} style={{fontSize:'12px'}}>
            <span>价格({currentPair?.baseSymbol}) </span>
            <span>数量({currentPair?.coinSymbol})</span>
            <span>总额({currentPair?.baseSymbol}) </span>
          </div>

          {/* 卖单 */}
          {(colorMode === 1 || colorMode === 3) && (
            <div className={styles.orderList}>
              {sellOrders.map((order, index) => {
                const percentWidth = Math.min((order.total / Math.max(...sellOrders.map(o => o.total))) * 100, 100);
                return (
                  <div key={index} className={`${styles.orderRow} ${styles.sell}`} style={{fontSize:'12px'}}>
                    <span className={styles.price} style={{ cursor:'pointer' }} onClick={() => handlePriceClick(order.price)}>
                      {order.price.toFixed(currentPair?.coinScale)} 
                        
                    </span>
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
                {currentPrice.toFixed(currentPair?.baseCoinScale || 1)}
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
                    <span className={styles.price} style={{ cursor:'pointer' }} onClick={() => handlePriceClick(order.price)}>
                      {order.price.toFixed(currentPair?.baseCoinScale)}
                    </span>
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