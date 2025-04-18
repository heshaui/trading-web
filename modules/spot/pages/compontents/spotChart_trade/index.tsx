import React from 'react';
import styles from '../styles/spotChartTrade.module.css'
import { Segmented, ConfigProvider, Form, Input, Slider, InputNumber, Button, Tabs,message } from 'antd';
import { Iconify } from "@/components/icon"
import type { SliderSingleProps } from 'antd';
import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { useState,useEffect } from 'react';
// import BuyPage from './buy_page';
import type { TabsProps } from 'antd';
import { createOrder } from '@/services/spot';
import PlaceOrderModal from './placeOrder_modal';
import { encryptData } from "@/hooks/user-encrypt";
import ErrorModal from '@/components/spotModal/Error_modal';
import SpotBuyModal from '@/components/spotModal/placeOrder_modal';
import { getUserBalance,getUserBalanceAll } from '@/services/assets'
import { toast } from 'sonner';
import appStore from '@/store';
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
type Props = {
    segmentedType: string
}
const SpotTradePage = () => {
    const { t } = useTranslation(['spot']);
    const [form] = Form.useForm();
    const [segmentedvalue, setSegmentedValue] = useState('buy');
    const [priceDisabled, setPriceDisabled] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState({});
    const [userBalance, setUserBalance] = useState<any[]>([]);

    // 获取当前选中的货币对，如果没有则使用币对列表的第一个数据
    const currentPair = appStore.getCurrentPair() || appStore.currencyPairs[0];

    console.log('currentPair', currentPair);
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
    const onSumbit = () => {
        form.validateFields()
            .then(async (values) => {
                const modalData = {
                    amount:values.amount,
                    price:values.price,
                    type:priceDisabled?0:1,
                    direction:segmentedvalue==='buy'?0:1,
                }
                setModalData(modalData)
                console.log(values, 111);
                const params = {
                    amount:values.amount,
                    baseSymbol:'BTC',
                    coinSymbol:'USDT',
                    direction:0,
                    price:values.price,
                    symbol:'BTC/USDT',
                    type:priceDisabled?0:1
                }
                try {
                    // 
                    setModalOpen(true)
                } catch (error) {

                }
            })
    }
    const items: TabsProps['items'] = [
        {
            key: '1',
            label: t('spot.select.limit'), //"限价",
            children: '', //<div>123</div>, //
        },
        {
            key: '2',
            label: t('spot.select.market'), //'市价',
            children: '', //<SpotOrderHistory />,
        }
    ];
    const onChange = (key: string) => {
        if (key === '1') {
            setPriceDisabled(false)
        } else {
            form.setFieldsValue({
                price: ''
            })
            setPriceDisabled(true)
        }
    }
    const geSegmentedChange = (value: string | number) => {
        setSegmentedValue(value as string)
    }

    const handelSubmitOrder =async () => {
        console.log('提交订单');
        form.validateFields()
        .then(async (values) => {
            const params = {
                amount:values.amount,
                baseSymbol:'USDT',
                coinSymbol:'BTC',
                direction:segmentedvalue==='buy'?0:1,
                price:values.price,
                symbol:'BTC/USDT',
                type:priceDisabled?0:1
            }
           const data = await encryptData(params)
            const res=await createOrder(data)
            if(res.code==='0'){
                message.success(res.message)
            }else{
                message.error(res.message)
            }
        })
        
    }

        // 币种余额
        const getUserBalanceData = async () => {
          
            try {
                const res = await getUserBalanceAll()
                if (res.code === '0') {
                    setUserBalance(res.data)
                    return res.data
                } else {
                    toast.error(res.message)
                }
            } catch (error) {
                toast.error(String(error))
            }
        }

        useEffect(()=>{
            getUserBalanceData()
        },[])
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
                        defaultBg: segmentedvalue === 'buy' ? "#00C788" : "#FF4D4F",
                        defaultBorderColor: segmentedvalue === 'buy' ? "#00C788" : "#FF4D4F",
                        defaultColor: '#fff',
                        defaultActiveBg: '#fff',
                        defaultActiveBorderColor: segmentedvalue === 'buy' ? "#00C788" : "#FF4D4F",
                        defaultActiveColor: segmentedvalue === 'buy' ? "#00C788" : "#FF4D4F",
                        defaultHoverBg: '#fff',
                        defaultHoverBorderColor: segmentedvalue === 'buy' ? "#00C788" : "#FF4D4F",
                        defaultHoverColor: segmentedvalue === 'buy' ? "#00C788" : "#FF4D4F",
                    },
                    Tabs: {
                        itemActiveColor: "var(--tip-color)", //激活态颜色  
                        itemSelectedColor: "var(--text-color5)", //选中态颜色
                        horizontalMargin: "0 0 0 0",
                        itemColor: "var(--text-color6)",
                        inkBarColor: "transparent", //指示条颜色
                        horizontalItemPaddingLG: "0",
                        horizontalItemPadding: "0",
                        horizontalItemPaddingSM: "0",
                        horizontalItemGutter: 10,
                        itemHoverColor: "var(--text-color5)",
                    },
                    Slider: {
                        railBg: 'var(--background16)', // 滑块轨道背景色
                        railHoverBg: 'var(--background16)', // 滑块轨道悬浮背景色
                    }
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
            {/* <BuyPage segmentedType={segmentedvalue} /> */}
            <div className='flex-y align-center'>

                <div className={`w-full`}>
                    <Tabs items={items}
                        className="custom-tabs"
                        defaultActiveKey="1"
                        indicator={{ size: (origin) => origin - 35, align: 'center' }}
                        onChange={onChange} />
                </div>

                <div className={`mt-4`} >
                    <Form
                        form={form}
                        style={{ width: '100%' }}
                    >
                        <Form.Item name='price'
                            className='spot_number_box'
                        >
                            <InputNumber
                                className={`${styles.mail_input} spot_number_input2 `}
                                style={{
                                    width: "100%",
                                    boxSizing: 'border-box',
                                }}
                                suffix={!priceDisabled ? <div>
                                    USDT
                                </div> : t('spot.select.market')}
                                prefix={<span className={`${styles.tip_color2}`}>{t('spot.trade.price')}</span>}
                                // max={100}
                                // min={0}
                                controls={priceDisabled ? false : {
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
                                disabled={priceDisabled}

                            />
                        </Form.Item>
                        <Form.Item name='amount'
                        >
                            <InputNumber disabled={true} className={`${styles.mail_input} spot_number_input `}
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
                            <InputNumber className={`${styles.mail_input} spot_number_input `}
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
                                <p>{userBalance.find(item=>item.coinName==='USDT')?.balance} USDT</p>
                            </li>
                            <li className='flex justify-between align-center'>
                                <p>{segmentedvalue === 'buy' ? '可买' : '可卖'}</p>
                                <p>{userBalance.find(item=>item.coinName==='BTC')?.balance} BTC</p>
                            </li>
                        </ul>
                    </Form>
                    <Button
                        // className={`${styles.sumbit_btn} green_btn`}
                        style={{ width: '100%', height: '50px', borderRadius: '32px' }}
                        htmlType="submit" onClick={onSumbit}>{segmentedvalue === 'buy' ? t('spot.trade.buy') : t('spot.trade.sell')}</Button>

                    {/* <button className={`${styles.sumbit_btn} green_btn`} type="submit" onClick={onSumbit}>{t('spot.trade.buy')}</button> */}

                </div>
                <PlaceOrderModal open={modalOpen} modalData={modalData} onCancel={() => { setModalOpen(false) }} onOk={() => { handelSubmitOrder()}} />
                {/* <ErrorModal open={modalOpen} onCancel={() => {  }} onOk={() => {  }}  /> */}
                {/* <SpotBuyModal open={modalOpen} onCancel={() => { setModalOpen(false) }} onOk={() => { setModalOpen(false) }} /> */}

            </div>
        </ConfigProvider>
    </div>
    );
};

export default SpotTradePage