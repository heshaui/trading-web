import { Col, Row, Badge, Calendar, ConfigProvider, Segmented, Select } from 'antd';

import styles from '../../styles/calendar.module.css';
import AreaChart from '../charts/AreaChart';

const FundingCalendar: React.FC = () => {
    // 资产趋势数据
    const trendData1 = [
        { date: '05/01', value: 0.07 },
        { date: '05/02', value: -0.05 },
        { date: '05/03', value: 0.1 },
        { date: '05/04', value: 0.04 },
        { date: '05/05', value: 0.05 },
        { date: '05/06', value: 0.015 },
        { date: '05/07', value: 0.125 },
    ];
    const trendData2 = [
        { date: '05/01', value: 2000 },
        { date: '05/02', value: 500 },
        { date: '05/03', value: 2500 },
        { date: '05/04', value: 1456.21 },
        { date: '05/05', value: 1500 },
        { date: '05/06', value: 1000 },
        { date: '05/07', value: 3000 },
    ];
    return (
        <Row gutter={24}>
            <Col span={16}>
                <Row align='middle'>
                    <Col span={12}><span className={styles.spanLarge}>资产日历</span></Col>
                    <Col span={12}>
                        <div className={styles.spanMonthContainer}>
                            <span className={styles.spanMonthAll}>5月份总盈亏</span>
                            <span className={styles.spanMonthAllNum}>-912.12</span>
                            <span className={styles.spanMonthAll}>盈利天数</span>
                            <span className={styles.spanMonthAllNum}>1</span>
                            <span className={styles.spanMonthAll}>亏损天数</span>
                            <span className={styles.spanMonthAllNum}>2</span>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <div className={styles.leftCalendarContainer}>
                            <ConfigProvider
                                theme={{
                                    components: {
                                        Calendar: {
                                            fullBg: '#1A1F39',
                                            itemActiveBg: '#1C2343',
                                            // fullPanelBg: '#1A1F39'
                                        },
                                    },
                                    token: {
                                        colorBgContainer: '#1A1F39'
                                    }
                                }}
                            >
                                {/* <Calendar /> */}
                            </ConfigProvider>
                        </div>
                    </Col>
                </Row>
            </Col>
            <Col span={8}>
                <Row align='middle'>
                    <Col span={10}><span className={styles.spanLarge}>收益分析及走势</span></Col>
                    <Col span={14}>
                        <div style={{ textAlign: 'right' }}>
                            <ConfigProvider
                                theme={{
                                    components: {
                                        Segmented: {
                                            trackBg: '#121528',
                                            itemActiveBg: '#000317',
                                            itemColor: '#A4A5AC',
                                            itemSelectedBg: '#000317',
                                            itemSelectedColor: '#FFFFFF'
                                        },
                                    },
                                }}
                            >
                                <Segmented
                                    size='small'
                                    options={['7天', '30天', '90天']}
                                // onChange={(value) => {
                                //     console.log(value); // string
                                // }}
                                />
                            </ConfigProvider>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <div className={styles.leftChartContainer}>
                            <Row align='middle'>
                                <Col span={12}>
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
                                            size='middle'
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
                                </Col>
                                <Col span={12}>
                                    <div className={styles.chartNumContainer}>
                                        <span className={styles.dateAndPoint}>05/07</span>
                                        <span className={styles.dateAndPoint}>累计盈亏率</span>
                                        <span className={styles.result}>+19%</span>
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={24}>
                                    <div style={{ height: '191px', marginTop: '12px' }}>
                                        <AreaChart data={trendData1} />
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <div className={`${styles.leftChartContainer} ${styles.leftChartContainerTop}`}>
                            <Row align='middle'>
                                <Col span={10}>
                                    <span>资产走势</span>
                                </Col>
                                <Col span={14}>
                                    <div className={styles.chartNumContainer}>
                                        <span className={styles.dateAndPoint}>05/07</span>
                                        <span className={styles.dateAndPoint}>资产总额(USDT):</span>
                                        <span className={styles.result}>+19%</span>
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={24}>
                                    <div style={{ height: '191px', marginTop: '12px' }}>
                                        <AreaChart data={trendData2} />
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                </Row>
            </Col>
        </Row>
    )
}
export default FundingCalendar;