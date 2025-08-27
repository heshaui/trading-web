"use client";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";

interface DepthChartProps {
  data: {
    buys?: [number, number, number][];
    bids?: [number, number][];
    asks: [number, number, number][];
    middle?: number;
    spot_log_last_seq?: number;
  };
}

const DepthChart = ({ data }: DepthChartProps) => {

  // 检查数据是否有效
  if (!data || !data.asks) {
    return (
      <div
        style={{
          width: "100%",
          height: "500px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      ></div>
    );
  }

  // 数据格式转换：将后端数据转为组件期望格式
  const bidsData: [number, number][] = data.buys 
    ? data.buys.map(([price, quantity]) => [price, quantity])
    : data.bids || [];
  const asksData: [number, number][] = data.asks.map(([price, quantity]) => [price, quantity]);

  // 处理深度数据，计算累积数量
  const processDepthData = (data: [number, number][], isBid: boolean) => {
    // 先按价格排序：买单从高到低，卖单从低到高
    const sortedData = [...data].sort((a, b) =>
      isBid ? b[0] - a[0] : a[0] - b[0]
    );

    let cumulativeQuantity = 0;
    return sortedData.map(([price, quantity]) => {
      cumulativeQuantity += Math.abs(quantity);
      return [price, cumulativeQuantity];
    });
  };

  const processedBids = processDepthData(bidsData, true);
  const processedAsks = processDepthData(asksData, false);

  // 计算基准价格和x轴显示范围
  const calculatePriceRange = () => {
    if (bidsData.length === 0 && asksData.length === 0) {
      // 如果有中间价，使用中间价作为参考
      const basePrice = data.middle || 50000;
      return { 
        midPrice: basePrice, 
        minPrice: basePrice - 1000, 
        maxPrice: basePrice + 1000 
      };
    }

    // 获取最高买价和最低卖价
    const highestBid =
      bidsData.length > 0 ? Math.max(...bidsData.map((bid) => bid[0])) : 0;
    const lowestAsk =
      asksData.length > 0 ? Math.min(...asksData.map((ask) => ask[0])) : 0;

    let midPrice;
    if (data.middle) {
      // 优先使用后端提供的中间价
      midPrice = data.middle;
    } else if (highestBid === 0) {
      midPrice = lowestAsk;
    } else if (lowestAsk === 0) {
      midPrice = highestBid;
    } else {
      midPrice = (highestBid + lowestAsk) / 2;
    }

    // 计算所有价格的范围
    const allPrices = [
      ...bidsData.map((bid) => bid[0]),
      ...asksData.map((ask) => ask[0]),
    ];
    const minDataPrice = Math.min(...allPrices);
    const maxDataPrice = Math.max(...allPrices);

    // 添加一些边距使图表更美观
    const priceSpread = maxDataPrice - minDataPrice;
    const margin = Math.max(priceSpread * 0.1, 1); // 10%的边距或至少1

    return {
      midPrice,
      minPrice: minDataPrice - margin,
      maxPrice: maxDataPrice + margin,
    };
  };

  const { minPrice, maxPrice } = calculatePriceRange();

  // ECharts 配置项
  const option = {
    tooltip: {
      show: true,
      trigger: "axis",
      axisPointer: {
        type: "cross",
      },
      formatter: (params: any) => {
        if (params && params.length > 0) {
          const param = params[0];
          const price = param.data[0];
          const quantity = param.data[1];
          const orderType = param.seriesName;
          return `${orderType}<br/>价格: ${price.toFixed(
            2
          )}<br/>累积数量: ${quantity.toFixed(4)}`;
        }
        return "";
      },
    },
    grid: {
      left: "3%",
      right: "8%",
      bottom: "3%",
      top: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      min: minPrice,
      max: maxPrice,
      axisLabel: {
        formatter: (value: number) => value.toFixed(2),
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: "dashed",
          opacity: 0.3,
        },
      },
      axisPointer: {
        snap: true,
      },
    },
    yAxis: {
      type: "value",
      position: "right",
      splitLine: {
        show: true,
        lineStyle: {
          type: "dashed",
          opacity: 0.3,
        },
      },
      axisTick: {
        show: false,
      },
      axisLine: {
        show: false,
      },
      axisLabel: {
        formatter: (value: number) => {
          if (value >= 1000) {
            return (value / 1000).toFixed(1) + "K";
          }
          return value.toFixed(1);
        },
      },
    },
    series: [
      {
        name: "买单",
        type: "line",
        data: processedBids,
        step: "after", // 改为 after 以正确显示深度图的阶梯效果
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(0, 199, 136, 0.3)" },
            { offset: 1, color: "rgba(0, 199, 136, 0.05)" },
          ]),
        },
        lineStyle: {
          width: 2,
          color: "rgba(0, 199, 136, 0.8)",
        },
        smooth: false,
        symbol: "none",
      },
      {
        name: "卖单",
        type: "line",
        data: processedAsks,
        step: "after", // 改为 after 以正确显示深度图的阶梯效果
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(255, 77, 79, 0.3)" },
            { offset: 1, color: "rgba(255, 77, 79, 0.05)" },
          ]),
        },
        lineStyle: {
          width: 2,
          color: "rgba(255, 77, 79, 0.8)",
        },
        smooth: false,
        symbol: "none",
      },
    ],
  };

  return (
    <div style={{ width: "100%", height: "500px" }}>
      <ReactECharts
        echarts={echarts}
        option={option}
        style={{ height: "100%", width: "100%" }}
        notMerge={true}
      />
    </div>
  );
};

export default DepthChart;
