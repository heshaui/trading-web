import { CurrencyTradingProps, Table1Data, Table2Data } from '@/type/types';
import styles from '../styles/currencyTrading.module.css';
import AreaChart from '../components/charts/AreaChart';
import PieChart from '../components/charts/PieChart';
import FundingTable from './table/FundingTable';
import TableItem from '../components/table/TableItem';
import FundingCalendar from './calendar/FundingCalendar';

import { Card, Col, Row, ConfigProvider, Select, Tabs, Checkbox, TableColumnsType, Progress } from 'antd';
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
    // 饼图数据1
    const pieData = [
        { name: 'USDT', value: 400, fill: '#00EEFF' },
        { name: 'ETH', value: 300, fill: '#1F40FF' },
        { name: 'BTC', value: 300, fill: '#E4E7F1' },
        { name: '其他', value: 200, fill: '#FFC507' },
    ];
    // 饼图数据2
    const pieTableData = [
        { name: '现货账户', value: 100, fill: '#00EEFF' },
        { name: '合约账户', value: 200, fill: '#1F40FF' },
        { name: 'OTC账户', value: 300, fill: '#E4E7F1' },
        { name: '资金账户', value: 350, fill: '#FF9741' },
        { name: '矿池账户', value: 50, fill: '#FFC507' },
    ];


    // 表格数据1
    const columns1: TableColumnsType<Table1Data> = [
        {
            title: '币种',
            dataIndex: 'currency',
        },
        {
            title: '持有数量',
            dataIndex: 'quantityHeld',
            align: 'right',
            sorter: {
                compare: (a, b) => a.quantityHeld - b.quantityHeld,
                multiple: 3,
            },
        },
        {
            title: '折合USDT',
            dataIndex: 'convertedToUSDT',
            align: 'right',
            sorter: {
                compare: (a, b) => a.convertedToUSDT - b.convertedToUSDT,
                multiple: 2,
            },
        },
        {
            title: '今日盈亏USDT',
            dataIndex: 'todayPLUSDT',
            align: 'right',
            render: (_, { todayPLUSDT }) => (
                <>
                    {
                        todayPLUSDT.map((PL) => {
                            let color = PL.includes('+') ? '#00C788' : '#F73711';
                            return (
                                <span style={{ color: color, display: 'block' }} key={PL}>
                                    {PL}
                                </span>
                            );
                        })
                    }
                </>
            ),
        },
        {
            title: '可用/冻结',
            dataIndex: 'availableOrFrozen',
            align: 'right',
            render: (_, { availableOrFrozen }) => (
                <>
                    <span style={{ color: '#FFFFFF', fontWeight: '500', fontSize: '14px', display: 'block' }}>{availableOrFrozen[0]}</span>
                    <span style={{ color: '#A4A5AC', fontWeight: '400', fontSize: '12px', display: 'block' }}>{availableOrFrozen[1]}</span>
                </>
            ),
        },
        {
            title: '锁仓',
            dataIndex: 'lockPosition',
            align: 'right',
            sorter: {
                compare: (a, b) => a.lockPosition - b.lockPosition,
                multiple: 1,
            },
        },
        {
            title: '日变化',
            dataIndex: 'dailyVariation',
            align: 'right',
            render: (_, { dailyVariation }) => (
                <>
                    <span style={{ color: dailyVariation.includes('+') ? '#00C788' : '#F73711' }}>{dailyVariation}</span>
                </>
            ),
        },
        {
            title: '持币价格走势',
            dataIndex: 'currencyPriceTrend',
            align: 'right',
        },
        {
            title: '操作',
            dataIndex: '',
            align: 'right',
            key: 'x',
            render: () => {
                return (
                    <div className={styles.controlsBox} style={{ display: 'flex', justifyContent: 'right', fontSize: '14px' }}>
                        <a className={styles.controls} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '36px',
                            backgroundColor: '#1F40FF',
                            color: '#FFFFFF',
                            width: '80px',
                            height: '32px',
                            fontSize: '14px',
                            marginRight: '11px'
                        }}>
                            划转
                        </a>
                        <a className={styles.controls} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '36px',
                            backgroundColor: '#1F40FF',
                            color: '#FFFFFF',
                            width: '80px',
                            height: '32px',
                            fontSize: '14px'
                        }}>
                            去交易
                            <RightOutlined />
                        </a>
                    </div>
                )
            },
        },
    ];
    const data1: Table1Data[] = [
        {
            key: '1',
            currency: <TableItem currency='USDT' imgSrc='/images/currency_trading/USDT.png' />,
            quantityHeld: 98,
            convertedToUSDT: 60,
            todayPLUSDT: ['+13.4%', '+191.22%'],
            availableOrFrozen: ['1,653.0', '冻结 1,453.1234'],
            lockPosition: 0,
            dailyVariation: '+1234',
            currencyPriceTrend: <div>changes</div>,
        },
        {
            key: '2',
            currency: <TableItem currency='BTC' imgSrc='/images/currency_trading/BTC.png' />,
            quantityHeld: 108,
            convertedToUSDT: 50,
            todayPLUSDT: ['+13.4%', '-191.22%'],
            availableOrFrozen: ['1,653.0', '冻结 1,453.1234'],
            lockPosition: 0,
            dailyVariation: '-1234',
            currencyPriceTrend: <div>changes</div>,
        },
        {
            key: '3',
            currency: <TableItem currency='BTC' imgSrc='/images/currency_trading/BTC.png' />,
            quantityHeld: 88,
            convertedToUSDT: 90,
            todayPLUSDT: ['-13.4%', '-191.22%'],
            availableOrFrozen: ['1,653.0', '冻结 1,453.1234'],
            lockPosition: 0,
            dailyVariation: '+1234',
            currencyPriceTrend: <div>changes</div>,
        },
    ];

    // 表格数据2

    const columns2: TableColumnsType<Table2Data> = [
        {
            title: '账户名称',
            dataIndex: 'accountName',
        },
        {
            title: '折合USDT',
            dataIndex: 'convertedToUSDT',
            align: 'right',
            // sorter: {
            //     compare: (a, b) => a.convertedToUSDT - b.convertedToUSDT,
            //     multiple: 3,
            // },
        },
        {
            title: '今日盈亏USDT',
            dataIndex: 'todayPLUSDT',
            align: 'right',
            render: (_, { todayPLUSDT }) => (
                <>
                    <span style={{ color: todayPLUSDT.includes('+') ? '#00C788' : '#F73711' }}>{todayPLUSDT}</span>
                </>
            ),
            // sorter: {
            //     compare: (a, b) => a.todayPLUSDT - b.todayPLUSDT,
            //     multiple: 3,
            // },
        },
        {
            title: '资产占比',
            dataIndex: 'assetProportion',
            align: 'right',
            render: (_, { assetProportion }) => (
                <>
                    <span style={{ color: assetProportion.includes('+') ? '#00C788' : '#F73711' }}>{assetProportion}</span>
                </>
            ),
            // sorter: {
            //     compare: (a, b) => a.assetProportion - b.assetProportion,
            //     multiple: 3,
            // },
        },
        {
            title: '资产占比',
            dataIndex: 'assetProportionNode',
            align: 'right',
            render: (_, { assetProportionNode }) => (
                <>
                    <span style={{ color: '#A4A5AC', fontSize: '12px' }}>{assetProportionNode}</span>
                    <Progress showInfo={false} trailColor='#373949' strokeColor='#1F40FF' percent={parseFloat(assetProportionNode.replace('%', ''))} size="small" />
                </>
            ),
        },
    ];
    const data2: Table2Data[] = [
        {
            key: '1',
            accountName: '现货账户',
            convertedToUSDT: '1,653.12',
            todayPLUSDT: '+226.87',
            assetProportion: '-15.9%',
            assetProportionNode: '95.9%',
        },
        {
            key: '2',
            accountName: '合约账户',
            convertedToUSDT: '1,653.12',
            todayPLUSDT: '-226.87',
            assetProportion: '+15.9%',
            assetProportionNode: '1.01%',
        },
        {
            key: '3',
            accountName: 'OTC账户',
            convertedToUSDT: '1,653.12',
            todayPLUSDT: '-226.87',
            assetProportion: '-15.9%',
            assetProportionNode: '2%',
        },
        {
            key: '4',
            accountName: '资金账户',
            convertedToUSDT: '1,653.12',
            todayPLUSDT: '+226.87',
            assetProportion: '+15.9%',
            assetProportionNode: '2%',
        },
        {
            key: '5',
            accountName: '矿池账户',
            convertedToUSDT: '0',
            todayPLUSDT: '0',
            assetProportion: '0%',
            assetProportionNode: '0%',
        },
    ]

    // 表格tabs数据
    const items = [
        {
            key: '1',
            label: '币种分布',
            children: <FundingTable columns={columns1} tableData={data1} exceptTable={false} />,
        },
        {
            key: '2',
            label: '账户分布',
            children: <FundingTable columns={columns2} tableData={data2} pieData={pieTableData || []} exceptTable />,
        },
        {
            key: '3',
            label: '分析',
            children: <FundingCalendar />,
        },
        {
            key: '4',
            label: '流水',
            children: 'Content of Tab Pane 4',
        },
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
                                            activeBorderColor: '#373949',
                                            hoverBorderColor: '#373949',
                                            selectorBg: '#1A1F39',
                                            optionSelectedColor: '#000',
                                            optionSelectedBg: '#3739494D',
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
                                                    colorBorder: '#373949',
                                                    colorTextQuaternary: '#FFFFFF', // 第四层-表单提示文本颜色
                                                    fontSize: 12,
                                                },
                                            }}
                                        >
                                            <Select
                                                showSearch
                                                placeholder="累计盈亏"
                                                optionFilterProp="label"
                                                options={[
                                                    {
                                                        value: '累计盈亏',
                                                        label: '累计盈亏',
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
                        <Card style={{ backgroundColor: '#1A1F39' }} bordered={false}>
                            <div className={styles.bottomContent_tabs}>
                                <ConfigProvider
                                    theme={{
                                        components: {
                                            Tabs: {
                                                inkBarColor: '#1F40FF',
                                                itemColor: '#A4A5AC',
                                                itemActiveColor: '#FFFFFF',
                                                itemHoverColor: '#FFFFFF',
                                                itemSelectedColor: '#FFFFFF',
                                                horizontalItemPadding: '0 0 20px 0',
                                                titleFontSize: 16
                                            },
                                        },
                                        token: {
                                            colorBorderSecondary: '#373949',
                                            colorText: '#FFFFFF',
                                        },
                                    }}
                                >
                                    <Tabs
                                        defaultActiveKey="1"
                                        items={items} indicator={{
                                            size: 26,
                                            align: 'center',
                                        }}
                                    />
                                </ConfigProvider>
                                <div className={styles.tabs_right}>
                                    <ConfigProvider
                                        theme={{
                                            token: {
                                                colorBgContainer: 'linear-gradient(180deg, rgba(31, 64, 255, 0.35) 0%, rgba(31, 64, 255, 0) 100%)',
                                                colorPrimaryBorder: '#FFFFFF'
                                            },
                                        }}
                                    >
                                        <Checkbox defaultChecked />
                                    </ConfigProvider>
                                    <span className={styles.right_words}>隐藏小额资产</span>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    )
}