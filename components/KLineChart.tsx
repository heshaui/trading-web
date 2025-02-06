import React, { useEffect, useRef } from "react";
import { init, Chart, KLineData } from "klinecharts";

interface KLineChartProps {
  data: KLineData[]; // K线图的数据
  height?: number;   // 图表高度
  theme?: "light" | "dark"; // 主题颜色
}

const KLineChart: React.FC<KLineChartProps> = ({
  data,
  height = 400,
  theme = "light",
}) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // 初始化图表
      chartInstance.current = init(chartRef.current);
      // 设置数据
      if (chartInstance.current) {
     
        chartInstance.current.applyNewData(data);
      }
    }

    return () => {
      // 销毁图表实例
      if (chartInstance.current) {
        chartInstance.current = null;
      }
    };
  }, [data, theme]);

  return <div ref={chartRef} style={{ width: "100%", height: `${height}px` }} />;
};

export default KLineChart;