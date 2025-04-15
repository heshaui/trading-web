import React from 'react';
import styles from '../styles/spotChartTrade.module.css'
import { Segmented, ConfigProvider, Form, Input, Slider, InputNumber, Button } from 'antd';
import { Iconify } from "@/components/icon"
import type { SliderSingleProps } from 'antd';
import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import BuyPage from './buy_page';

interface DataType {
    id: number,
    userId: number,
    platformType: number,
    deviceNo: string,
    ip: string,
    address: string,
    token: number,
    tokenTime: number,
    createTime: number,
    updateTime: number,
    tenantId: string,
}
const SpotTradePage = () => {
    const { t } = useTranslation(['spot']);
    const [form] = Form.useForm();
    const [segmentedvalue, setSegmentedValue] = useState('buy');
    //  输入金额校验
    const checkAmount = (_: any, value: string) => { }
    const marks: SliderSingleProps['marks'] = {
        0: {
            label: <strong></strong>,
        },
        25: {
            label: <strong></strong>,
        },
        50: {
            label: <strong></strong>,
        },
        75: {
            label: <strong></strong>,
        },
        100: {
            label: <strong></strong>,
        },
    };
    const onSumbit = (values: any) => {
        form.validateFields()
        .then((values) => {
            console.log(values,111);
        })
    }
    const geSegmentedChange=(value: string | number)=>{
        setSegmentedValue(value as string)
    }
    return (<div className='flex-y align-center'>
        <ConfigProvider
            theme={{
                components: {
                    Segmented: {
                        itemColor: "var(--text-color4)", //未选中颜色
                        itemActiveBg: "transparent", //未选中背景色
                        itemSelectedBg: segmentedvalue === 'buy' ? "#00C788" : "#FF4D4F", //选中背景色
                        itemSelectedColor: "#fff", //选中颜色
                        trackBg: "transparent", //轨道背景色
                        itemHoverBg: "transparent", //鼠标悬停背景色
                        itemHoverColor: "var(--text-color4)",//鼠标悬停颜色
                        trackPadding: 4, //轨道padding
                    },
                    Form: {
                        itemMarginBottom: 16,
                    },
                    Input: {
                        controlHeightLG: 50,
                        activeBorderColor: 'var(--theme-color)',
                        hoverBorderColor: 'var(--theme-color)',
                        activeBg: 'var(--background11)',
                        hoverBg: 'var(--background11)',
                    },
                    InputNumber: {
                        controlHeightLG: 50,
                        activeBorderColor: 'var(--theme-color)',
                        hoverBorderColor: 'var(--theme-color)',
                        activeBg: 'var(--background7)',
                        hoverBg: 'var(--background7)',
                        handleBg: 'transparent', //操作按钮背景色
                    },
                    Button: {
                        controlHeightLG: 50,
                        defaultBg:  segmentedvalue === 'buy' ? "#00C788" : "#FF4D4F",
                        defaultBorderColor:  segmentedvalue === 'buy' ? "#00C788" : "#FF4D4F",
                        defaultColor: '#fff',
                        defaultActiveBg: '#fff',
                        defaultActiveBorderColor:  segmentedvalue === 'buy' ? "#00C788" : "#FF4D4F",
                        defaultActiveColor:  segmentedvalue === 'buy' ? "#00C788" : "#FF4D4F",
                        defaultHoverBg: '#fff',
                        defaultHoverBorderColor:  segmentedvalue === 'buy' ? "#00C788" : "#FF4D4F",
                        defaultHoverColor:  segmentedvalue === 'buy' ? "#00C788" : "#FF4D4F",
                    },
                },
            }}
        >
            <div className={`${styles.card_header} flex align-center mb-6`}>
                <Segmented options={[
                    {
                        label: (
                            // className={`default_btn ${styles.btn_style}`}
                            <div className={`${styles.segmented_label}`} >
                                <div>{t('spot.trade.buy')}</div>
                            </div>
                        ),
                        value: 'buy',
                    },
                    {
                        label: (
                            <div className={`${styles.segmented_label}`} >
                                <div>{t('spot.trade.sell')}</div>
                            </div>
                        ),
                        value: 'sell',
                    },
                ]}
                    className={`spot-segmented ${segmentedvalue === 'buy' ? styles.segmented_box : styles.segmented_box_red}`} 
                    onChange={geSegmentedChange}
                    defaultValue={'buy'}
                    />
            </div>
            <BuyPage segmentedType={segmentedvalue} />
            {/* <div className={`mt-6 w-full`} >
                <Form
                    form={form}
                    // onFinish={onSumbit}
                // initialValues={{
                //   type: '',
                //   direction: '',
                //   symbol: ''
                // }}
                >
                    <Form.Item name='price'
                        // rules={[{ validator: checkAmount }]}
                        >
                        <InputNumber className={`${styles.mail_input} spot_number_input mr-7`}
                            style={{ width: "100%" }}
                            suffix={<div>
                                USDT
                            </div>}
                            prefix={<span className={`${styles.tip_color2}`}>{t('spot.trade.price')}</span>}
                            // max={100}
                            // min={0}
                            controls={{
                                upIcon: <Iconify icon="mdi:chevron-up" size={20} className={`${styles.title_color} ${styles.hover_color}`} />,
                                downIcon: <Iconify icon="mdi:chevron-down" size={20} className={`${styles.title_color} ${styles.hover_color}`} />,
                            }}
                            formatter={(value) => {
                                if (value === '' || value === null || value === undefined) return '';
                                return `${value}`.replace(/[^\d.]/g, '');
                            }}
                            parser={(value) => {
                                if (value === '' || value === null || value === undefined) return '';
                                // 只保留数字和第一个小数点
                                const parsed = value.toString().replace(/[^\d.]/g, '')
                                    .replace(/\.(?=.*\.)/g, '');
                                return parsed as unknown as number;
                            }}

                        />
                    </Form.Item>
                    <Form.Item name='amount'
                        // rules={[{ validator: checkAmount }]}
                        >
                        <InputNumber className={`${styles.mail_input} spot_number_input mr-7`}
                            style={{ width: "100%" }}
                            suffix={<div>
                                BTC
                            </div>}
                            prefix={<span className={`${styles.tip_color2}`}>{t('spot.trade.amount')}</span>}
                            // max={100}
                            // min={0}
                            controls={false}
                            formatter={(value) => {
                                if (value === '' || value === null || value === undefined) return '';
                                return `${value}`.replace(/[^\d.]/g, '');
                            }}
                            parser={(value) => {
                                if (value === '' || value === null || value === undefined) return '';
                                // 只保留数字和第一个小数点
                                const parsed = value.toString().replace(/[^\d.]/g, '')
                                    .replace(/\.(?=.*\.)/g, '');
                                return parsed as unknown as number;
                            }}

                        />
                    </Form.Item>
                    <Slider marks={marks} defaultValue={37} />
                    <Form.Item name='account'
                        // rules={[{ validator: checkAmount }]}
                        >
                        <InputNumber className={`${styles.mail_input} spot_number_input mr-7`}
                            style={{ width: "100%" }}
                            suffix={<div>
                                USDT
                            </div>}
                            prefix={<span className={`${styles.tip_color2}`}>{t('spot.trade.amount2')}</span>}
                            // max={100}
                            // min={0}
                            controls={false}
                            formatter={(value) => {
                                if (value === '' || value === null || value === undefined) return '';
                                return `${value}`.replace(/[^\d.]/g, '');
                            }}
                            parser={(value) => {
                                if (value === '' || value === null || value === undefined) return '';
                                // 只保留数字和第一个小数点
                                const parsed = value.toString().replace(/[^\d.]/g, '')
                                    .replace(/\.(?=.*\.)/g, '');
                                return parsed as unknown as number;
                            }}

                        />
                    </Form.Item>
                    <ul className={`font-14 ${styles.tip_color1} mb-5`}>
                        <li className='flex justify-between align-center mb-1'>
                            <p>可用</p>
                            <p>-USDT</p>
                        </li>
                        <li className='flex justify-between align-center'>
                            <p>可买</p>
                            <p>--BTC</p>
                        </li>
                    </ul>
                </Form>
                <Button 
                // className={`${styles.sumbit_btn} green_btn`}
                style={{width: '100%',height: '50px',borderRadius: '32px'}}
                 htmlType="submit" onClick={onSumbit}>{t('spot.trade.buy')}</Button>

            </div> */}
        </ConfigProvider>
    </div>
    );
};

export default SpotTradePage