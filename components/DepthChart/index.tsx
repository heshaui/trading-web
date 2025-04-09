'use client';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

const DepthChart = () => {
  // 示例数据（买卖深度数据）
  const bids = [
    [10.0, 100],
    [9.9, 200],
    [9.8, 300],
    [9.7, 400],
    [9.6, 500],
  ];

  const asks = [
    [10.1, 100],
    [10.2, 200],
    [10.3, 300],
    [10.4, 400],
    [10.5, 500],
  ];

  // 计算中间价格（买卖盘的交界处）
  const midPrice = (bids[0][0] + asks[0][0]) / 2;
  
  // 处理数据：计算累积量
  const processData = (data, isBid) => {
    let total = 0;
    return data
      .sort((a, b) => isBid ? b[0] - a[0] : a[0] - b[0])
      .map(item => {
        total += item[1];
        return [item[0], total];
      });
  };

  const processedBids = processData(bids, true);
  const processedAsks = processData(asks, false);

  // ECharts 配置项
  const option = {
    title: {
      text: '市场深度图',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const data = params[0].data;
        return `价格: ${data[0]}<br/>累积量: ${data[1]}`;
      },
      axisPointer: {
        type: 'cross'
      }
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
      axisLabel: {
        formatter: (value) => value.toFixed(2)
      },
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
      name: '',
      position: 'right',
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          opacity: 0.3
        }
      },
      axisTick: {
        show: false  // 隐藏刻度线
      },
      axisLine: {
        show: false  // 隐藏轴线
      },
      axisLabel: {
        formatter: (value) => {
          if (value >= 1000) {
            return (value / 1000).toFixed(2) + 'K';
          }
          return value;
        }
      }
    },
    series: [
      {
        name: '买盘',
        type: 'line',
        data: processedBids,
        step: 'end',
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
              xAxis: midPrice,
              lineStyle: {
                color: '#999',
                type: 'dashed'
              }
            }
          ],
          label: {
            formatter: '{c}'
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