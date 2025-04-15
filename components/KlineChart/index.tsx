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
}

const KLineChart: React.FC<KLineChartProps> = ({
  socketData,
  initialData = [],
  height = 500,
  width = 65,
  theme = "light",
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
        
        // 加载初始数据
        if (initialData && initialData.length > 0 && klineChart) {
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
  }, []);  // 只在组件挂载时执行一次

  // 处理WebSocket数据
  useEffect(() => {
    if (!chart || !socketData || !Array.isArray(socketData)) return;
    
    try {
      // 遍历socketData数组中的每个对象
      socketData.forEach(item => {
        if (item.type === "kline") {
          const parsedData = JSON.parse(item.data);
          // 解析K线数据为正确的格式
          const klineData = {
            timestamp: parsedData[2],  // 时间戳
            open: parsedData[3],       // 开盘价
            high: parsedData[4],       // 最高价
            low: parsedData[5],        // 最低价
            close: parsedData[6],      // 收盘价
            volume: parsedData[7]      // 成交量
          };
          
          // 更新最新成交量
          setLastVolume(klineData.volume);
          
          // 更新图表数据
          chart.updateData(klineData);
        }
      });
      
    } catch (error) {
      console.error("处理K线数据失败:", error);
    }
  }, [socketData, chart]);

  return <div ref={chartRef} id="chart" style={{ width: `${width}%`, height: `${height}px` }} />;
};

export default KLineChart;