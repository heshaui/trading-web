import React from 'react';
import { withSpotLayout } from '@/components/sidebarLayout/SpotLayout/userSpotLayout';
import styles from '../styles/spotChartTrade.module.css'
import { Segmented, ConfigProvider, Form, Input, Slider,InputNumber } from 'antd';
import { Iconify } from "@/components/icon"
import type { SliderSingleProps } from 'antd';
import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

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
    const [value, setValue] = useState([0, 25,50,75,100]);
    //  输入金额校验
    const checkAmount = (_: any, value: string) => {}
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
    return (<>
        <ConfigProvider
            theme={{
                components: {
                    Segmented: {
                        itemColor: "var(--text-color4)", //未选中颜色
                        itemActiveBg: "transparent", //未选中背景色
                        itemSelectedBg: "#00C788", //选中背景色
                        itemSelectedColor: "#fff", //选中颜色
                        trackBg: "transparent", //轨道背景色
                        itemHoverBg: "transparent", //鼠标悬停背景色
                        itemHoverColor: "var(--text-color4)",//鼠标悬停颜色
                        trackPadding: 4, //轨道padding
                    },
                    Form: {
                        itemMarginBottom:16,
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
                        handleBg:'transparent', //操作按钮背景色
                    },
                },
            }}
        >
            <div className={`${styles.card_header} flex align-center`}>
                <Segmented options={[
                    {
                        label: (
                            // className={`default_btn ${styles.btn_style}`}
                            <div className={`${styles.segmented_label}`} >
                                <div>{t('spot.trade.buy')}</div>
                            </div>
                        ),
                        value: 'user1',
                    },
                    {
                        label: (
                            <div className={`${styles.segmented_label}`} >
                                <div>{t('spot.trade.sell')}</div>
                            </div>
                        ),
                        value: 'user2',
                    },
                ]}
                    className={`${styles.segmented_box} spot-segmented `} />
            </div>
            <div className={`mt-6 w-full`} >
                <Form
                    form={form}
                // initialValues={{
                //   type: '',
                //   direction: '',
                //   symbol: ''
                // }}
                >
                    {/* <Form.Item name="type" >
                        <Select allowClear
                            placeholder={t('spot.select.type')}
                            options={[]}
                            className={`${styles.select_box} select-text-right mt-6`}
                            prefix={<span className={`${styles.title_color}`}>{t('spot.columns.type')}</span>}
                        />
                    </Form.Item> */}
                    <Form.Item name='price'
                        rules={[{ validator: checkAmount }]}>
                        <InputNumber className={`${styles.mail_input} spot_number_input mr-7`}
                            style={{width:"100%"}}
                            suffix={<div>
                                USDT
                            </div>}
                            prefix={<span className={`${styles.tip_color2}`}>{t('spot.trade.price')}</span>}
                            // max={100}
                            // min={0}
                            controls={{
                                upIcon: <Iconify icon="mdi:chevron-up" size={20} className={`${styles.title_color} ${styles.hover_color}`}/>,
                                downIcon: <Iconify icon="mdi:chevron-down" size={20} className={`${styles.title_color} ${styles.hover_color}`}/>,
                            }}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                          
                        />
                    </Form.Item>
                    <Form.Item name='amount'
                        rules={[{ validator: checkAmount }]}>
                        <InputNumber className={`${styles.mail_input} spot_number_input mr-7`}
                            style={{width:"100%"}}
                            suffix={<div>
                                BTC
                            </div>}
                            prefix={<span className={`${styles.tip_color2}`}>{t('spot.trade.amount')}</span>}
                            // max={100}
                            // min={0}
                            controls={false}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                          
                        />
                    </Form.Item>
                    <Slider marks={marks} defaultValue={37} />
                    <Form.Item name='account'
                        rules={[{ validator: checkAmount }]}>
                        <InputNumber className={`${styles.mail_input} spot_number_input mr-7`}
                            style={{width:"100%"}}
                            suffix={<div>
                                USDT
                            </div>}
                            prefix={<span className={`${styles.tip_color2}`}>{t('spot.trade.amount2')}</span>}
                            // max={100}
                            // min={0}
                            controls={false}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                          
                        />
                    </Form.Item>
                </Form>
            </div>
        </ConfigProvider>
    </>
    );
};

export default SpotTradePage