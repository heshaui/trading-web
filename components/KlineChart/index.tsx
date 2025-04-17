import React, { useEffect, useRef, useState } from "react";
import dynamic from 'next/dynamic';

// 动态导入 klinecharts
const initKlinecharts = async () => {
  const klinecharts = await import('klinecharts');
  return klinecharts;
};

interface KLineChartProps {
  socketData?: any;
  initialData?: any[]; // 初始K线数据
  height?: number;
  theme?: "light" | "dark";
  width?: number;
  period?: string; // 添加时间周期属性
}

const KLineChart: React.FC<KLineChartProps> = ({
  socketData,
  initialData = [],
  height = 500,
  width = 65,
  theme = "light",
  period = "1m", // 默认为1分钟，可设置为"15m"
}) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [chart, setChart] = useState<any>(null);
  const [lastVolume, setLastVolume] = useState<number>(0);

  // 初始化图表
  useEffect(() => {
    const initChart = async () => {
      if (chartRef.current) {
        const klinecharts = await initKlinecharts();
        const klineChart = klinecharts.init(chartRef.current);
        
        // 设置图表样式和初始数据
        if (initialData && initialData.length > 0 && klineChart) {
          // 传入初始数据时可能需要指定周期
          klineChart.applyNewData(initialData);
        }
       
        setChart(klineChart);
      }
    };

    initChart();
    
    return () => {
      if (chartRef.current) {
        const disposeChart = async () => {
          const klinecharts = await initKlinecharts();
          klinecharts.dispose(chartRef.current as HTMLElement);
        };
        disposeChart();
      }
    };
  }, [period]); // 保留period作为依赖项

  // 处理WebSocket数据
  useEffect(() => {
    if (!chart || !socketData) return;
    
    try {
      // 检查socketData是否为数组格式
      if (Array.isArray(socketData)) {
        // 获取数组中的最后一个元素（最新数据）
        const latestUpdate = socketData[socketData.length - 1];
        
        if (latestUpdate && latestUpdate.type === "kline" && Array.isArray(latestUpdate.data)) {
          // 解析K线数据
          const dataPoint = latestUpdate.data[0];
          if (dataPoint && dataPoint.length >= 6) {
            const klineData = {
              timestamp: dataPoint[0],  // 时间戳
              open: dataPoint[1],       // 开盘价
              high: dataPoint[2],       // 最高价
              low: dataPoint[3],        // 最低价
              close: dataPoint[4],      // 收盘价
              volume: dataPoint[5]      // 成交量
            };
            
            // 更新最新成交量
            setLastVolume(klineData.volume);
            
            // 更新图表数据
            chart.updateData(klineData);
          }
        }
      }
    } catch (error) {
      console.error("处理K线数据失败:", error);
    }
  }, [socketData, chart]);

  return <div ref={chartRef} id="chart" style={{ width: `${width}%`, height: `${height}px` }} />;
};

export default KLineChart;