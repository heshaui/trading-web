import React, { useState } from 'react';
import { Col, Row, Badge, Calendar, ConfigProvider, Segmented, Select, Radio, Button } from 'antd';
import type { CalendarProps } from 'antd';
import { RightOutlined, LeftOutlined } from '@ant-design/icons';
import { createStyles } from 'antd-style';
import classNames from 'classnames';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { HolidayUtil, Lunar } from 'lunar-typescript';

import styless from '../../styles/calendar.module.css';
import AreaChart from '../charts/AreaChart';

const useStyle = createStyles(({ token, css, cx }) => {
    const lunar = css`
    color: '#FFFFFF';
    font-size: ${token.fontSizeSM}px;
  `;
    const weekend = css`
    color: ${token.colorError};
    &.gray {
      opacity: 0.4;
    }
  `;
    return {
        wrapper: css`
      border-radius: ${token.borderRadiusOuter};
      padding: 5px;
    `,
        dateCell: css`
      position: relative;
      &:before {
        content: '';
        position: absolute;
        inset-inline-start: 0;
        inset-inline-end: 0;
        top: 0;
        bottom: 0;
        margin: auto;
        max-width: 40px;
        max-height: 40px;
        background: transparent;
        transition: background-color 300ms;
        border-radius: ${token.borderRadiusOuter}px;
        border: 1px solid transparent;
        box-sizing: border-box;
      }
      &:hover:before {
        background: rgba(0, 0, 0, 0.04);
      }
    `,
        today: css`
      &:before {
        border: 1px solid ${token.colorPrimary};
      }
    `,
        text: css`
      position: relative;
      z-index: 1;
    `,
        lunar,
        current: css`
      color: ${token.colorTextLightSolid};
      &:before {
        background: ${token.colorPrimary};
      }
      &:hover:before {
        background: ${token.colorPrimary};
        opacity: 0.8;
      }
      .${cx(lunar)} {
        color: ${token.colorTextLightSolid};
        opacity: 0.9;
      }
      .${cx(weekend)} {
        color: ${token.colorTextLightSolid};
      }
    `,
        monthCell: css`
      width: 120px;
      color: ${token.colorTextBase};
      border-radius: ${token.borderRadiusOuter}px;
      padding: 5px 0;
      &:hover {
        background: rgba(0, 0, 0, 0.04);
      }
    `,
        monthCellCurrent: css`
      color: ${token.colorTextLightSolid};
      background: ${token.colorPrimary};
      &:hover {
        background: ${token.colorPrimary};
        opacity: 0.8;
      }
    `,
        weekend,
    };
});

const FundingCalendar: React.FC = () => {
    // 日历
    const { styles } = useStyle({ test: true });

    const [selectDate, setSelectDate] = React.useState<Dayjs>(dayjs());
    const [panelDateDate, setPanelDate] = React.useState<Dayjs>(dayjs());
    const onPanelChange = (value: Dayjs, mode: CalendarProps<Dayjs>['mode']) => {
        console.log(value.format('YYYY-MM-DD'), mode);
        setPanelDate(value);
    };
    const onDateChange: CalendarProps<Dayjs>['onSelect'] = (value, selectInfo) => {
        if (selectInfo.source === 'date') {
            setSelectDate(value);
        }
    };

    const cellRender: CalendarProps<Dayjs>['fullCellRender'] = (date, info) => {
        const d = Lunar.fromDate(date.toDate());
        const lunar = d.getDayInChinese();
        const solarTerm = d.getJieQi();
        const isWeekend = date.day() === 6 || date.day() === 0;
        const h = HolidayUtil.getHoliday(date.get('year'), date.get('month') + 1, date.get('date'));
        const displayHoliday = h?.getTarget() === h?.getDay() ? h?.getName() : undefined;
        if (info.type === 'date') {
            return React.cloneElement(info.originNode, {
                ...(info.originNode as React.ReactElement<any>).props,
                className: classNames(styles.dateCell, {
                    [styles.current]: selectDate.isSame(date, 'date'),
                    [styles.today]: date.isSame(dayjs(), 'date'),
                }),
                children: (
                    <div className={styles.text}>
                        <span
                            className={classNames({
                                [styles.weekend]: isWeekend,
                                gray: !panelDateDate.isSame(date, 'month'),
                            })}
                        >
                            {date.get('date')}
                        </span>
                        {info.type === 'date' && (
                            <div className={styles.lunar}>{displayHoliday || solarTerm || lunar}</div>
                        )}
                    </div>
                ),
            });
        }

        if (info.type === 'month') {
            // Due to the fact that a solar month is part of the lunar month X and part of the lunar month X+1,
            // when rendering a month, always take X as the lunar month of the month
            const d2 = Lunar.fromDate(new Date(date.get('year'), date.get('month')));
            const month = d2.getMonthInChinese();
            return (
                <div
                    className={classNames(styles.monthCell, {
                        [styles.monthCellCurrent]: selectDate.isSame(date, 'month'),
                    })}
                >
                    {date.get('month') + 1}月（{month}月）
                </div>
            );
        }
    };
    const getYearLabel = (year: number) => {
        const d = Lunar.fromDate(new Date(year + 1, 0));
        return `${d.getYearInChinese()}年（${d.getYearInGanZhi()}${d.getYearShengXiao()}年）`;
    };

    const getMonthLabel = (month: number, value: Dayjs) => {
        const d = Lunar.fromDate(new Date(value.year(), month));
        const lunar = d.getMonthInChinese();
        return `${month + 1}月（${lunar}月）`;
    };

    // 年月日选择
    const [date, setDate] = useState<dayjs.Dayjs>(dayjs());

    const handleNextMonth = () => {
        const newDate = date.add(1, 'month');
        setDate(newDate);
    };

    const handlePreviousMonth = () => {
        const newDate = date.subtract(1, 'month');
        setDate(newDate);
    };

    const onHandleChange = (value: Dayjs) => {
        console.log(value.format('YYYY-MM-DD'));
        setDate(value);
    };

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
                    <Col span={12}><span className={styless.spanLarge}>资产日历</span></Col>
                    <Col span={12}>
                        <div className={styless.spanMonthContainer}>
                            <span className={styless.spanMonthAll}>5月份总盈亏</span>
                            <span className={styless.spanMonthAllNum}>-912.12</span>
                            <span className={styless.spanMonthAll}>盈利天数</span>
                            <span className={styless.spanMonthAllNum}>1</span>
                            <span className={styless.spanMonthAll}>亏损天数</span>
                            <span className={styless.spanMonthAllNum}>2</span>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <div className={styless.leftCalendarContainer}>
                            <ConfigProvider
                                theme={{
                                    components: {
                                        Calendar: {
                                            fullBg: '#1A1F39',
                                            itemActiveBg: '#1C2343',
                                            miniContentHeight: 486.4
                                        },
                                    },
                                    token: {
                                        colorBgContainer: '#1A1F39',
                                        colorTextDisabled: '#FFFFFF40',
                                        fontSize: 12,
                                        colorTextTertiary: '#FFFFFF'
                                    }
                                }}
                            >
                                <Calendar
                                    fullscreen={false}
                                    fullCellRender={cellRender}
                                    onPanelChange={onPanelChange}
                                    onChange={onHandleChange}
                                    onSelect={onDateChange}
                                    headerRender={({ value, type, onChange, onTypeChange }) => {
                                        const start = 0;
                                        const end = 12;
                                        const monthOptions = [];

                                        let current = value.clone();
                                        const localeData = value.localeData();
                                        const months = [];
                                        for (let i = 0; i < 12; i++) {
                                            current = current.month(i);
                                            months.push(localeData.monthsShort(current));
                                        }

                                        for (let i = start; i < end; i++) {
                                            monthOptions.push({
                                                label: getMonthLabel(i, value),
                                                value: i,
                                            });
                                        }

                                        const year = value.year();
                                        const month = value.month();
                                        const options = [];
                                        for (let i = year - 10; i < year + 10; i += 1) {
                                            options.push({
                                                label: getYearLabel(i),
                                                value: i,
                                            });
                                        }
                                        return (
                                            <Row justify="space-between" align="middle" gutter={8} style={{ padding: 20 }}>
                                                <Col>
                                                    {/* <Select
                                                        size="small"
                                                        popupMatchSelectWidth={false}
                                                        className="my-year-select"
                                                        value={year}
                                                        options={options}
                                                        onChange={(newYear) => {
                                                            const now = value.clone().year(newYear);
                                                            onChange(now);
                                                        }}
                                                    /> */}
                                                    <Row align="middle">
                                                        <Col>
                                                            <span style={{ fontSize: '14px', fontWeight: 500 }}>
                                                                {date.format('YYYY年M月')}
                                                            </span>
                                                        </Col>
                                                        <Col>
                                                            <div
                                                                style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center',
                                                                    border: '1px solid #1F40FF4D',
                                                                    width: '20px',
                                                                    height: '20px',
                                                                    cursor: 'pointer',
                                                                    marginLeft: '6px'
                                                                }}
                                                                onClick={handlePreviousMonth}
                                                            >
                                                                <LeftOutlined style={{ color: '#1F40FF', fontSize: '10px' }} />
                                                            </div>
                                                        </Col>
                                                        <Col>
                                                            <div
                                                                style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center',
                                                                    border: '1px solid #1F40FF4D',
                                                                    width: '20px',
                                                                    height: '20px',
                                                                    cursor: 'pointer',
                                                                    marginLeft: '6px'
                                                                }}
                                                                onClick={handleNextMonth}
                                                            >
                                                                <RightOutlined style={{ color: '#1F40FF', fontSize: '10px' }} />
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                                <Col>
                                                    <Radio.Group
                                                        size="small"
                                                        onChange={(e) => onTypeChange(e.target.value)}
                                                        value={type}
                                                    >
                                                        {/* <Radio.Button value="date">今日</Radio.Button> */}
                                                        <Radio.Button value="month">月</Radio.Button>
                                                        <Radio.Button value="year">年</Radio.Button>
                                                    </Radio.Group>
                                                </Col>
                                                <Col>
                                                    <Row justify="start" align="middle" gutter={4}>
                                                        <Col>
                                                            <img src="/images/currency_trading/icon_Profit_or_loss_ratio.png" alt="" />
                                                        </Col>
                                                        <Col>
                                                            <span>盈亏率</span>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </Row>
                                        );
                                    }}
                                />
                            </ConfigProvider>
                        </div>
                    </Col>
                </Row>
            </Col>
            <Col span={8}>
                <Row align='middle'>
                    <Col span={10}><span className={styless.spanLarge}>收益分析及走势</span></Col>
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
                        <div className={styless.leftChartContainer}>
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
                                    <div className={styless.chartNumContainer}>
                                        <span className={styless.dateAndPoint}>05/07</span>
                                        <span className={styless.dateAndPoint}>累计盈亏率</span>
                                        <span className={styless.result}>+19%</span>
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
                        <div className={`${styless.leftChartContainer} ${styless.leftChartContainerTop}`}>
                            <Row align='middle'>
                                <Col span={10}>
                                    <span>资产走势</span>
                                </Col>
                                <Col span={14}>
                                    <div className={styless.chartNumContainer}>
                                        <span className={styless.dateAndPoint}>05/07</span>
                                        <span className={styless.dateAndPoint}>资产总额(USDT):</span>
                                        <span className={styless.result}>+19%</span>
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