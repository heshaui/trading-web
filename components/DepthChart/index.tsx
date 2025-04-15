'use client';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

interface DepthChartProps { 
  data: any[];  // 修改为数组类型
}

const DepthChart = ({ data }: DepthChartProps) => {

  console.log("DepthChartProps", data);
  
  // 检查数据是否有效
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div style={{ width: '100%', height: '500px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        无数据或数据格式不正确
      </div>
    );
  }
  
  // 合并所有深度数据
  const mergeDepthData = (depthArray: any[]) => {
    const mergedBids: Map<number, number> = new Map();
    const mergedAsks: Map<number, number> = new Map();
    
    depthArray.forEach(item => {
      // 处理买单
      if (item.bids && Array.isArray(item.bids)) {
        item.bids.forEach((bid: [number, number]) => {
          const [price, quantity] = bid;
          // 如果数量为负，表示移除或减少该价格的挂单
          if (mergedBids.has(price)) {
            mergedBids.set(price, mergedBids.get(price)! + quantity);
            // 如果数量变为零或负，移除该价位
            if (mergedBids.get(price)! <= 0) {
              mergedBids.delete(price);
            }
          } else if (quantity > 0) {
            mergedBids.set(price, quantity);
          }
        });
      }
      
      // 处理卖单
      if (item.asks && Array.isArray(item.asks)) {
        item.asks.forEach((ask: [number, number]) => {
          const [price, quantity] = ask;
          const absQuantity = Math.abs(quantity);  // 使用绝对值来处理数量
          
          if (mergedAsks.has(price)) {
            // 如果quantity为正，表示移除卖单；如果为负，表示增加卖单
            if (quantity > 0) {
              mergedAsks.set(price, Math.max(0, mergedAsks.get(price)! - absQuantity));
              if (mergedAsks.get(price) === 0) {
                mergedAsks.delete(price);
              }
            } else {
              mergedAsks.set(price, mergedAsks.get(price)! + absQuantity);
            }
          } else if (quantity < 0) {
            // 负数表示卖单，添加到卖单列表
            mergedAsks.set(price, absQuantity);
          }
        });
      }
    });
    
    // 转换回数组格式
    const bidsArray = Array.from(mergedBids).map(([price, quantity]) => [price, quantity]);
    const asksArray = Array.from(mergedAsks).map(([price, quantity]) => [price, quantity]);
    
    return {
      bids: bidsArray.sort((a, b) => b[0] - a[0]),  // 买单按价格降序
      asks: asksArray.sort((a, b) => a[0] - b[0])   // 卖单按价格升序
    };
  };

  const mergedData = mergeDepthData(data);
  
  // 处理相同价格的情况：为每个价格点添加更小的偏移，使其可见但间距更小
  const processDataWithOffset = (data: any, isBid: boolean) => {
    let total = 0;
    let lastPrice = 0;
    
    return data.map((item: any, index: number) => {
      // 确保买单数量始终为正数用于计算
      const quantity = Math.abs(item[1]);
      total += quantity;
      
      // 如果价格相同，添加微小偏移，减小偏移量以使点更紧凑
      let price = item[0];
      if (price === lastPrice) {
        // 买单向左偏移，卖单向右偏移，偏移量减小10倍
        price = isBid ? price - index * 0.05 : price + index * 0.05;
      }
      lastPrice = item[0]; // 保存原始价格
      
      return [price, total];
    }).sort((a: any, b: any) => isBid ? b[0] - a[0] : a[0] - b[0]);
  };

  const processedBids = processDataWithOffset(mergedData.bids, true);
  const processedAsks = processDataWithOffset(mergedData.asks, false);
  
  // 计算基准价格和x轴显示范围
  // 根据买卖单价格计算中间价格
  const calculateMidPrice = () => {
    if (mergedData.bids.length === 0 && mergedData.asks.length === 0) {
      return 50000; // 默认值
    }
    
    const highestBid = mergedData.bids.length > 0 ? mergedData.bids[0][0] : 0;
    const lowestAsk = mergedData.asks.length > 0 ? mergedData.asks[0][0] : 0;
    
    if (highestBid === 0) return lowestAsk;
    if (lowestAsk === 0) return highestBid;
    
    return (highestBid + lowestAsk) / 2;
  };
  
  const basePrice = calculateMidPrice();
  const priceRange = Math.max(1000, basePrice * 0.1); // 10%的价格范围或至少1000
  const minPrice = basePrice - priceRange;
  const maxPrice = basePrice + priceRange;

  // ECharts 配置项
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params:any) => {
        const data = params[0].data;
        return `价格: ${data[0].toFixed(2)}<br/>累积量: ${data[1].toFixed(4)}`;
      },
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['买盘', '卖盘'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '价格',
      min: minPrice, // 设置x轴最小值
      max: maxPrice, // 设置x轴最大值
      // axisLabel: {
      //   formatter: (value: number) => value.toFixed(2)
      // },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          opacity: 0.3
        }
      },
      axisPointer: {
        snap: true
      }
    },
    yAxis: {
      type: 'value',
      name: '累积量',
      position: 'right',
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          opacity: 0.3
        }
      },
      axisTick: {
        show: false
      },
      axisLine: {
        show: false
      },
      axisLabel: {
        formatter: (value:any) => {
          if (value >= 1000) {
            return (value / 1000).toFixed(2) + 'K';
          }
          return value.toFixed(2);
        }
      }
    },
    series: [
      {
        name: '买盘',
        type: 'line',
        data: processedBids,
        step: 'start',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 255, 0, 0.5)' },
            { offset: 1, color: 'rgba(0, 255, 0, 0.1)' }
          ])
        },
        lineStyle: {
          width: 2,
          color: 'rgb(0, 180, 0)'
        },
        smooth: false,
        symbol: 'none'
      },
      {
        name: '卖盘',
        type: 'line',
        data: processedAsks,
        step: 'start',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 0, 0, 0.5)' },
            { offset: 1, color: 'rgba(255, 0, 0, 0.1)' }
          ])
        },
        lineStyle: {
          width: 2,
          color: 'rgb(255, 0, 0)'
        },
        smooth: false,
        symbol: 'none'
      },
      {
        name: '中间价格',
        type: 'line',
        markLine: {
          symbol: 'none',
          data: [
            {
              xAxis: basePrice,
              lineStyle: {
                color: '#999',
                type: 'dashed'
              }
            }
          ],
          label: {
            show: false
          }
        },
        data: []
      }
    ]
  };

  return (
    <div style={{ width: '100%', height: '500px' }}>
      <ReactECharts
        echarts={echarts}
        option={option}
        style={{ height: '100%', width: '100%' }}
        notMerge={true}
      />
    </div>
  );
};

export default DepthChart;