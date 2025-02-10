import React, { PureComponent } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import styles from '../../styles/areaCharts.module.css';

// 定义 props 类型
interface FundingAreaChartProps {
    data: Array<{ date: string; value: number }>;
}
const CustomTooltip = ({ payload }: any) => {
    if (payload && payload.length) {
        // console.log('payload', payload);
        return (
            <div className={styles.areaTooltip}>
                <span className={styles.date}>日期：<span className={styles.dateContent}>{payload[0].payload.date}</span></span>
                <span className={styles.funding}>资产：<span className={styles.fundingContent}>{payload[0].payload.value}</span></span>
            </div>
        );
    }

    return null;
};

export default class FundingAreaChart extends PureComponent<FundingAreaChartProps> {
    render() {
        // console.log('this', this);
        const { data } = this.props; // 从 props 中获取数据
        // 计算 Y 轴的刻度
        // const ticks = [];
        // for (let i = 0; i <= 3000; i += 500) {
        //     ticks.push(i);
        // }
        return (
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 18,
                        left: -18,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#1F40FF" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="#1F40FF" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="1" stroke='#373949' />
                    <XAxis dataKey="date" axisLine={false} interval={0} tickLine={false} padding={{ left: 21 }} tick={{ fontSize: 12, fill: '#6D6F7A' }} />
                    <YAxis dataKey="value" axisLine={false} interval={0} tickLine={false} tick={{ fontSize: 12, fill: '#6D6F7A' }} />
                    {/* <YAxis dataKey="value" axisLine={false} interval={0} tickLine={false} tick={{ fontSize: 12, fill: '#6D6F7A' }} ticks={ticks} /> */}
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="value" stroke="#1F40FF" fill="url(#gradient)" />
                </AreaChart>
            </ResponsiveContainer>
        );
    }
}