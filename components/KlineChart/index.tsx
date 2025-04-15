import React, { useEffect, useRef, useState } from "react";
import { init, Chart, KLineData, dispose } from "klinecharts";

interface KLineChartProps {
  socketData?: any;
  initialData?: KLineData[]; // 初始K线数据
  height?: number;
  theme?: "light" | "dark";
  width?: number;
}

const KLineChart: React.FC<KLineChartProps> = ({
  socketData,
  initialData = [],
  height = 400,
  width = 65,
  theme = "light",
}) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [chart, setChart] = useState<Chart | null>(null);
  const [lastVolume, setLastVolume] = useState<number>(0);

  // 初始化图表
  useEffect(() => {
    console.log("socketData1", socketData);
    if (chartRef.current) {
      const klineChart = init(chartRef.current);
      
   
      
      // 加载初始数据
      if (initialData && initialData.length > 0 && klineChart) {
        klineChart.applyNewData(initialData);
      }
      
      setChart(klineChart);
    }
    
    return () => {
      if (chartRef.current) {
        dispose(chartRef.current);
      }
    };
  }, []);  // 只在组件挂载时执行一次

  // 处理WebSocket数据
  useEffect(() => {
    console.log("socketData2", socketData);
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

  return <div ref={chartRef} id="chart" style={{ width: `${width}%`, height: `${548}px` }} />;
};

export default KLineChart;