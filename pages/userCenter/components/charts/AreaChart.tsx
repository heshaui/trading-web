import styles from "../../styles/areaChart.module.css";
import React from "react";
import {
    AreaChart,
    Area,
    // XAxis,
    // YAxis,
    // CartesianGrid,
    Tooltip,
} from "recharts";

interface DataPoint {
    name: string;
    uv: number;
    pv: number;
    amt: number;
}

const data: DataPoint[] = [
    {
        name: "Page A",
        uv: 4000,
        pv: 2400,
        amt: 2400,
    },
    {
        name: "Page B",
        uv: 3000,
        pv: 1398,
        amt: 2210,
    },
    {
        name: "Page C",
        uv: 2000,
        pv: 9800,
        amt: 2290,
    },
    {
        name: "Page D",
        uv: 2780,
        pv: 3908,
        amt: 2000,
    },
    // ... existing code ...
];
// 自定义 Tooltip 组件
const CustomTooltip: React.FC<any> = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    return (
        <div
            className={`font-12 ${styles.area_tooltip}`}
        >
            <p >{payload[0].payload.name}</p>
            <p >
                <span
                    className={`mr-1 ${styles.tooltip_circle}`}
                />
                {payload[0].value}</p>
        </div>
    );
};

const AssetsAreaChart: React.FC = (): React.JSX.Element => {
    return (
        <AreaChart
            width={250}
            height={140}
            data={data}
            margin={{
                top: 0,
                right: 60,
                left: 0,
                bottom: 0,
            }}
        >
            {/* <CartesianGrid strokeDasharray="3 3" /> */}
            {/* <XAxis dataKey="name" />
            <YAxis /> */}
            <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF5F1F" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#FF5F1F" stopOpacity={0} />
                </linearGradient>
            </defs>
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="uv" stroke="#FF5F1F"
                fill="url(#gradient)" />
        </AreaChart>
    );
};

export default AssetsAreaChart;