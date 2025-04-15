'use client';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

interface DepthChartProps { 
  data: any;
}

const DepthChart = ({ data }: DepthChartProps) => {

  console.log("DepthChartProps", data);
  
  // 检查数据是否有效
  if (!data) {
    return (
      <div style={{ width: '100%', height: '500px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        无数据
      </div>
    );
  }
  
  // 处理相同价格的情况：为每个价格点添加更小的偏移，使其可见但间距更小
  const processDataWithOffset = (data: any, isBid: boolean) => {
    let total = 0;
    let lastPrice = 0;
    
    return data.map((item: any, index: number) => {
      // 确保买单数量始终为正数用于计算
      const quantity = isBid ? Math.abs(item[1]) : item[1];
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
  const basePrice = 50000;
  const minPrice = basePrice - 20; // 控制x轴最小值
  const maxPrice = basePrice + 20; // 控制x轴最大值

  // ECharts 配置项
  const option = {
    title: {
      text: '市场深度图',
      left: 'center'
    },
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