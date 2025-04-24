'use client'
import React from 'react';
import styles from '../styles/spotChartTrade.module.css'
import { Segmented, ConfigProvider, Form, Input, Slider, InputNumber, Button, Tabs, message,notification} from 'antd';
import { Iconify } from "@/components/icon"
import type { SliderSingleProps } from 'antd';
import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { useState, useEffect } from 'react';
// import BuyPage from './buy_page';
import type { TabsProps } from 'antd';
import { createOrder } from '@/services/spot';
import PlaceOrderModal from './placeOrder_modal';
import { encryptData } from "@/hooks/user-encrypt";
import ErrorModal from '@/components/spotModal/Error_modal';
import SpotBuyModal from '@/components/spotModal/placeOrder_modal';
import { getUserBalance, getUserBalanceAll } from '@/services/assets'
import { toast } from 'sonner';
import appStore from '@/store';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { ROUTER_KEY_OPEN } from '@/config/apiConfig';

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
    segmentedType: string,
    currentPrice: number,
    onOrderSuccess?: () => void  // 添加回调函数属性
}
const SpotTradePage = ({ onOrderSuccess }: Props) => {
    const { t } = useTranslation(['spot']);
    const [form] = Form.useForm();
    const router = useRouter();
    const [segmentedvalue, setSegmentedValue] = useState('buy');
    const [priceDisabled, setPriceDisabled] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState({});
    const [userBalance, setUserBalance] = useState<any[]>([]);
    const { isLoggedIn } = useAuth();

    // 获取当前选中的货币对，如果没有则使用币对列表的第一个数据
    const currentPair = appStore.getCurrentPair() || appStore.currencyPairs[0];

    // console.log('currentPair', currentPair);
    //  输入金额校验
    const checkAmount = (_: any, value: string) => {
        if (!value) return Promise.resolve();

        // 获取当前可用余额
        const baseBalance = userBalance.find(item => item.coinName === currentPair?.baseSymbol)?.balance || 0;

        // 将输入值转为数字进行比较
        const inputValue = parseFloat(value);

        if (segmentedvalue === 'buy' && inputValue > baseBalance) {
            return Promise.reject(new Error(`可用${currentPair?.baseSymbol}余额不足`));
        }

        return Promise.resolve();
    }

    // 添加数量校验函数
    const checkAmountLimit = (_: any, value: string) => {
        if (!value) return Promise.resolve();

        const inputValue = parseFloat(value);

        // 根据下单类型验证最大值
        if (priceDisabled) {
            // 市价单 - 验证最大市价单笔数量
            if (inputValue > currentPair.maxMarketPrice) {
                return Promise.reject(new Error(`最大市价单笔数量为 ${currentPair.maxMarketPrice} ${currentPair?.coinSymbol}`));
            }
        } else {
            // 限价单 - 验证最大限价挂单数
            if (inputValue > currentPair.maxCurrentPrice) {
                return Promise.reject(new Error(`最大限价挂单数为 ${currentPair.maxCurrentPrice} ${currentPair?.coinSymbol}`));
            }
        }

        return Promise.resolve();
    };

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

    // 添加滑块变化时的处理函数
    const handleSliderChange = (value: number) => {
        // 限制最大值为98%
        const percentage = Math.min(value, 98) / 100;

        if (segmentedvalue === 'buy') {
            // 买入操作，计算可买数量
            const baseBalance = userBalance.find(item => item.coinName === currentPair?.baseSymbol)?.balance || 0;
            const price = form.getFieldValue('price');

            if (price && !priceDisabled) {
                // 限价单
                const availableAmount = (baseBalance * percentage) / price;
                form.setFieldsValue({
                    amount: availableAmount.toFixed(8),
                    account: (availableAmount * price).toFixed(8)
                });
            } else if (priceDisabled) {
                // 市价单
                const availableFunds = baseBalance * percentage;
                form.setFieldsValue({
                    account: availableFunds.toFixed(8)
                });
            }
        } else {
            // 卖出操作，计算可卖数量
            const coinBalance = userBalance.find(item => item.coinName === currentPair?.coinSymbol)?.balance || 0;
            const availableAmount = coinBalance * percentage;

            form.setFieldsValue({ amount: availableAmount.toFixed(8) });

            // 只有在限价单时才设置成交额
            const price = form.getFieldValue('price');
            if (price && !priceDisabled) {
                form.setFieldsValue({ account: (availableAmount * price).toFixed(8) });
            } else if (priceDisabled) {
                // 市价卖单时，清空account字段或设置为估算值
                form.setFieldsValue({ account: '' });
            }
        }
    };

    const onSumbit = () => {
        // 检查当前是卖出操作且可卖数量为0的情况
        if (segmentedvalue === 'sell') {
            const availableCoin = userBalance.find(item => item.coinName === currentPair?.coinSymbol)?.balance || 0;
            if (availableCoin <= 0) {
                toast.error(`${currentPair?.coinSymbol}余额不足，无法卖出`);
                return;
            }
        }

        form.validateFields()
            .then(async (values) => {
                const modalData = {
                    amount: values.amount,
                    price: values.price,
                    type: priceDisabled ? 0 : 1,
                    direction: segmentedvalue === 'buy' ? 0 : 1,
                }
                const noRemind = localStorage.getItem('noRemind')
                console.log(noRemind, 'noRemind');
                if (noRemind==='true') {
                    setModalOpen(false)
                    handelSubmitOrder()
                }else{
                setModalData(modalData)
                setModalOpen(true)
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

    // 添加计算成交额的函数
    const calculateTotal = () => {
        const price = form.getFieldValue('price');
        const amount = form.getFieldValue('amount');

        if (price && amount) {
            const total = price * amount;
            form.setFieldsValue({ account: total });
        } else {
            form.setFieldsValue({ account: '' });
        }
    }

    // 监听价格和数量的变化，计算成交额
    useEffect(() => {
        // 初始化时计算一次总额
        calculateTotal();
    }, [form]);

    const handelSubmitOrder = async () => {
        form.validateFields()
            .then(async (values) => {
                const params = {
                    amount: values.amount,
                    baseSymbol: currentPair?.baseSymbol,
                    coinSymbol: currentPair?.coinSymbol,
                    direction: segmentedvalue === 'buy' ? 0 : 1,
                    price: values.price,
                    symbol: currentPair?.symbol,
                    type: priceDisabled ? 0 : 1
                }
                const data = await encryptData(params)
                const res = await createOrder(data)
                if (res.code === '0') {
                    setModalOpen(false)
                    form.resetFields()
                    // 通知父组件下单成功
                    if (typeof onOrderSuccess === 'function') {
                        onOrderSuccess()
                        notification.success({
                            message: '已挂单',
                            description: (
                                <div>
                                    <div>币种：{currentPair?.coinSymbol}/{currentPair?.baseSymbol}</div>
                                    <div>数量：{values.amount}</div>
                                    <div>价格：{priceDisabled ? res.data[1]:values.price}</div>
                                </div>
                            ),
                            duration: 3
                        })
                    }
                } else {
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

    useEffect(() => {
        getUserBalanceData()
    }, [])
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
                        onValuesChange={(changedValues) => {
                            if ('price' in changedValues || 'amount' in changedValues) {
                                calculateTotal();
                            }
                        }}
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
                                    {currentPair?.baseSymbol}
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
                            rules={[{ validator: checkAmountLimit }]}
                            style={{ display: 'block' }}
                        >
                            <InputNumber className={`${styles.mail_input} spot_number_input `}
                                style={{ width: "100%" }}
                                suffix={<div>
                                    {currentPair?.coinSymbol}
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
                        <Slider
                            marks={marks}
                            defaultValue={0}
                            max={100}
                            onChange={handleSliderChange}
                        />
                        <Form.Item name='account'
                            rules={[{ validator: checkAmount }]}
                            style={{ display: priceDisabled ? 'none' : 'block' }}
                        >
                            <InputNumber className={`${styles.mail_input} spot_number_input `}
                                style={{ width: "100%" }}
                                suffix={<div>
                                    {currentPair?.baseSymbol}
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
                                <p>{userBalance.find(item => item.coinName === currentPair?.baseSymbol)?.balance || '--'} {currentPair?.baseSymbol}</p>
                            </li>
                            <li className='flex justify-between align-center'>
                                <p>{segmentedvalue === 'buy' ? '可买' : '可卖'}</p>
                                <p>{userBalance.find(item => item.coinName === currentPair?.coinSymbol)?.balance || '--'} {currentPair?.coinSymbol}</p>
                            </li>
                        </ul>
                    </Form>
                    {isLoggedIn ? <Button
                        // className={`${styles.sumbit_btn} green_btn`}
                        style={{ width: '100%', height: '50px', borderRadius: '32px' }}
                        htmlType="submit"
                        onClick={onSumbit}
                        disabled={currentPair?.enable === 0}
                    >
                        {segmentedvalue === 'buy' ? t('spot.trade.buy') : t('spot.trade.sell')}
                    </Button> :
                        <Button
                            // className={`${styles.sumbit_btn} green_btn`}
                            style={{ width: '100%', height: '50px', borderRadius: '32px' }}
                            htmlType="button"
                            onClick={()=>{
                                router.push(ROUTER_KEY_OPEN.LOGIN)
                            }}
                        >
                             {t('spot.modal.login')}
                        </Button>
                    }



                    <div className={`${styles.fee_container} flex align-center mt-4`}>
                        <div className={styles.fee_icon} style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                            <Iconify icon="mdi:percent-circle-outline" size={16} />
                        </div>
                        <span className={styles.fee_text} style={{ fontSize: '12px', paddingTop: '2px' }}>手续费</span>
                        <div className={styles.fee_tooltip}>
                            <div className={styles.fee_tooltip_content}>
                                <div className={styles.fee_tooltip_title}>手续费</div>
                                <div className={styles.fee_tooltip_details}>挂单{currentPair?.buyFee}% / 吃单{currentPair?.sellFee}%</div>
                            </div>
                        </div>
                    </div>
                </div>

                <PlaceOrderModal open={modalOpen} modalData={modalData} onCancel={() => { setModalOpen(false) }} onOk={() => { handelSubmitOrder() }} />
                {/* <ErrorModal open={modalOpen} onCancel={() => {  }} onOk={() => {  }}  /> */}
                {/* <SpotBuyModal open={modalOpen} onCancel={() => { setModalOpen(false) }} onOk={() => { setModalOpen(false) }} /> */}

            </div>
        </ConfigProvider >
    </div >
    );
};

export default SpotTradePage