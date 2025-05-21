'use client';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { useTranslation } from 'next-i18next';

interface DepthChartProps { 
  data: {
    bids: [number, number][];
    asks: [number, number][];
    spot_log_last_seq?: number;
  };  // 修改为对象类型
}

const DepthChart = ({ data }: DepthChartProps) => {
  const { t } = useTranslation(['common']);

  console.log("DepthChartProps", data);
  
  // 检查数据是否有效
  if (!data || !data.bids || !data.asks) {
    return (
      <div style={{ width: '100%', height: '500px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
       
      </div>
    );
  }
  
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

  const processedBids = processDataWithOffset(data.bids, true);
  const processedAsks = processDataWithOffset(data.asks, false);
  
  // 计算基准价格和x轴显示范围
  const calculateMidPrice = () => {
    if (data.bids.length === 0 && data.asks.length === 0) {
      return 50000; // 默认值
    }
    
    const highestBid = data.bids.length > 0 ? data.bids[0][0] : 0;
    const lowestAsk = data.asks.length > 0 ? data.asks[0][0] : 0;
    
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
      show:false
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
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
        name: t('depthChart.buyOrders'),
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
          color: 'rgb(0, 180, 0,0.5)'
        },
        smooth: false,
        symbol: 'none'
      },
      {
        name: t('depthChart.sellOrders'),
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
          color: 'rgb(255, 0, 0,0.5)'
        },
        smooth: false,
        symbol: 'none'
      },
      {
        name: t('depthChart.midPrice'),
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