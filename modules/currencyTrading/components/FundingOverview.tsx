import { CurrencyTradingProps } from '@/utils/types';
import styles from '../styles/currencyTrading.module.css';
import AreaChart from '../components/charts/AreaChart';
import PieChart from '../components/charts/PieChart';

import { Card, Col, Row, ConfigProvider, Select } from 'antd';
import {
    InfoCircleOutlined,
    CheckCircleFilled,
    RightOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';

export default function FundingOverview({ title }: CurrencyTradingProps) {
    // 时间切换 - 默认选中7天
    const [selectedTime, setSelectedTime] = useState<string>('7天');
    // 遍历数据
    const contentData = [
        {
            pText: '今日盈亏',
            PL: '+222.5',
            percentagePL: '+30.12%',
        },
        {
            pText: '历史盈亏',
            PL: '-456.36',
            percentagePL: '+30.12%',
        },
    ];
    // 根据PL的值动态设置类名
    const getPLClassName = (PL: string) => {
        if (PL.includes('-')) {
            return styles.loss;
        } else if (PL.includes('+')) {
            return styles.profit;
        }
        return '';
    };

    // 资产异动数据
    const assetMovements = [
        { spanText: '资产异动1' },
        { spanText: '资产异动2' },
        { spanText: '资产异动3' },
        { spanText: '资产异动4' },
    ];

    // 点击不同时间显示
    const handleTimeClick = (time: string) => {
        setSelectedTime(time);
    };
    // 时间段选项
    const timeOptions = [
        { key: '7天', text: '7天', className: styles.time_sevenDays },
        { key: '30天', text: '30天', className: styles.time_thirtyDays },
        { key: '90天', text: '90天', className: styles.time_nintyDays },
    ];

    // 资产趋势数据
    const trendData = [
        { date: '05/01', value: 2000 },
        { date: '05/02', value: 500 },
        { date: '05/03', value: 2500 },
        { date: '05/04', value: 1456.21 },
        { date: '05/05', value: 1500 },
        { date: '05/06', value: 1000 },
        { date: '05/07', value: 3000 },
    ];
    // 饼图数据
    const pieData = [
        { name: 'USDT', value: 400, fill: '#00EEFF' },
        { name: 'ETH', value: 300, fill: '#1F40FF' },
        { name: 'BTC', value: 300, fill: '#E4E7F1' },
        { name: '其他', value: 200, fill: '#FFC507' },
    ];
    return (
        <div className={styles.CTContainerContent}>
            <h5>{title}</h5>
            <div className={styles.topContent}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Card style={{ backgroundColor: '#1F40FF' }} bordered={false}>
                            <div className={styles.topContent_left}>
                                <p>总资产折合USDT</p>
                                <h5>1947.91</h5>
                                <div className={styles.todayAndHistory}>
                                    {contentData.map((item, index) => (
                                        <div className={styles.content} key={index}>
                                            <p>{item.pText}<InfoCircleOutlined style={{ marginLeft: '2px' }} /></p>
                                            <div style={{ marginTop: '8px' }}>
                                                <span className={styles.span1}>{item.PL}</span>
                                                <span className={getPLClassName(item.PL)}>{item.percentagePL}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className={styles.fundingContent}>
                                    <div className={styles.shadowImg}>
                                        <img src="/images/currency_trading/image 15.png" alt="" />
                                    </div>
                                    <div className={styles.shadow}></div>
                                    <div className={styles.contentList}>
                                        <ul className={styles.list}>
                                            {assetMovements.map((item, index) => (
                                                <li key={index}>
                                                    <CheckCircleFilled style={{ marginRight: '6px' }} />
                                                    <span>{item.spanText}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card style={{ backgroundColor: '#1A1F39' }} bordered={false}>
                            <ConfigProvider
                                theme={{
                                    components: {
                                        Select: {
                                            activeBorderColor: '#A4A5AC',
                                            hoverBorderColor: '#A4A5AC',
                                            selectorBg: '#1A1F39',
                                            optionSelectedColor: '#000',
                                            optionSelectedBg: '#A4A5AC4D',
                                            optionFontSize: 12,
                                        },
                                    },
                                }}
                            >
                                <div className={styles.topContent_middle}>
                                    <div className={styles.selectedAndMore}>
                                        <ConfigProvider
                                            theme={{
                                                token: {
                                                    colorText: '#A4A5AC',
                                                    colorTextPlaceholder: '#A4A5AC',
                                                    colorBorder: '#A4A5AC',
                                                    colorTextQuaternary: '#FFFFFF', // 第四层-表单提示文本颜色
                                                    fontSize: 12,
                                                },
                                            }}
                                        >
                                            <Select
                                                showSearch
                                                placeholder="资产走势"
                                                optionFilterProp="label"
                                                options={[
                                                    {
                                                        value: '资产走势',
                                                        label: '资产走势',
                                                    },
                                                ]}
                                            />
                                        </ConfigProvider>
                                        <div className={styles.timeSelected}>
                                            {timeOptions.map((option) => (
                                                <span
                                                    key={option.key}
                                                    className={`${option.className} ${selectedTime === option.key ? styles.selected : ''}`}
                                                    onClick={() => handleTimeClick(option.key)}
                                                >
                                                    {option.text}
                                                </span>
                                            ))}
                                        </div>
                                        <div className={styles.more}>
                                            <span>更多</span>
                                            <RightOutlined />
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '14px', color: '#A4A5AC', fontSize: '12px' }}>
                                        <span style={{ marginRight: '10px' }}>05/07</span>
                                        <span style={{ marginRight: '6px' }}>资产总额(USDT):</span>
                                        <span style={{ color: '#FFFFFF' }}>1,947.91</span>
                                    </div>
                                    <div style={{ height: '152px', marginTop: '12px' }}>
                                        <AreaChart data={trendData} />
                                    </div>
                                </div>
                            </ConfigProvider>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card style={{ backgroundColor: '#1A1F39' }} bordered={false}>
                            <div className={styles.topContent_right}>
                                <div className={styles.topTitle}>
                                    <h5>持有币种：<span>25</span></h5>
                                    <div className={styles.more}>
                                        <span>更多</span>
                                        <RightOutlined />
                                    </div>
                                </div>
                                <div className={styles.pieChart} style={{ marginTop: '30px', height: '178px' }}>
                                    <div className={styles.showPieAnalyzeData}>
                                        <ul>
                                            {pieData.map((item, index) => (
                                                <li key={index}>
                                                    <div className={`${styles.colorBox} ${styles[item.fill]}`} style={{ backgroundColor: item.fill }}></div>
                                                    <div className={styles.contentBox}>
                                                        <span>{item.name}</span>
                                                        <p>{item.value}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <PieChart data={pieData} />
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
            <div className={styles.bottomContent}>
                <Row gutter={16}>
                    <Col span={24}>
                        <Card title="Card title" bordered={false}>
                            Card content
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    )
}