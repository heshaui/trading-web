import React from 'react';
import { withAssetsLayout } from '@/components/sidebarLayout/AssetsLayout/userAssetsLayout';
import styles from '../styles/spotAccount.module.css'
import { Input, Radio, ConfigProvider, Table, Form, Checkbox } from 'antd';
import { Iconify } from "@/components/icon"
import type { ColumnsType } from "antd/es/table";
import dayjs from 'dayjs';
import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router';
import { getUserBalanceAll, getUserBalanceByDay } from '@/services/assets';
import { toast } from "sonner";
import { add, roundDown, cut, nul } from '@/utils'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { ROUTER_KEY_ASSETS, ROUTER_KEY_SPOT } from '@/config/apiConfig';
import appStore from '@/store';
import { observer } from 'mobx-react-lite';
import { useCoinList } from '@/hooks/use-coinList';
import { getRate } from '@/utils/getUseRate';
import { LOCAL_STORAGE_KEY } from '@/config/apiConfig';
import Image from 'next/image';
interface DataType {
    balance: number,
    frozenBalance: number,
    releaseBalance: number,
    isLock: number,
    coinId: string,
    coinName: string,
    iconUrl: string,
    nameDefault: string
}
const AssetsMainPage = observer(() => {
    const { t } = useTranslation(['assets']);
    const [initTableData, setInitTableData] = useState<DataType[]>([])
    const [tableData, setTableData] = useState<DataType[]>([]);
    const [tableLoading, setTableLoading] = useState(false);
    const router = useRouter();
    const [total, setTotal] = useState(0);
    const [pageParam, setPageParam] = useState({
        page: 1,
        pageSize: 10
    })
    const [balanceAll, setBalanceAll] = useState({
        usdBalance: 0,
        cnyBalance: 0,
    });
    const [balanceDay, setBalanceDay] = useState({
        usdBalance: 0,
        cnyBalance: 0,
    });

    const paramdataRef = useRef(pageParam);
    // 获取币种列表
    const { coinList } = useCoinList(true);
    const [form] = Form.useForm();
    // 获取汇率数据
    const rateData = appStore.getRateData()||[];
    const coinPair = appStore.getCurrentPairList() || appStore.currencyPairs; // 货币对列表
    const rateKey = appStore.getRateKey().replace(/\s+/g, ''); // 汇率key

    const columns: ColumnsType<DataType> = [
        {
            title: t('assetsAccount.currency'), //"币种",
            dataIndex: "coinName",
            key: "coinName",
            width: 128,
            align: "left",
            render: (text, record) => {
                return <div className='flex align-center'>
                    <Image src={record?.iconUrl} alt={text} width={28} height={28}
                        style={{ borderRadius: '50%', height: '28px', width: '28px' }}
                        className='mr-1' />
                    <p className='font-w-500 font-14 flex-y'>
                        {`${text}`}
                        <span className={`font-w-400 font-12 ${styles.tip_color}`}>{record?.nameDefault}</span>
                    </p>
                </div>
            },
            sorter: (a, b) => a.coinName.localeCompare(b.coinName),
        },
        {
            title: t('assetsAccount.balance'), //"持仓",
            dataIndex: "balance",
            key: "balance",
            align: "center",
            // width: 128,
            render: (_text, record) => {
                const coin = coinList.find((item: any) => item.coinName === record.coinName); // 获取币种信息
                const text = add(record.balance || 0, record.releaseBalance || 0);
                const text2 = add(text, record.frozenBalance || 0);
                // 添加默认值和检查
                const rateKeyName = rateKey.split('-')[0].trim()

                // 确保 rateKeyName 有值
                const { ratetext } = getRate(record.coinName, text2, rateKeyName);

                return <p className='flex-y align-end'>
                    <span>{text2 ? roundDown(text2, coin?.unitScale) : '0'}</span>
                    <span className='ltr-text'>
                    {record.coinName ? ratetext : ''}
                </span>
                </p>
            },
            sorter: (a, b) => {
                const totalA = add(add(a.balance || 0, a.releaseBalance || 0), a.frozenBalance || 0);
                const totalB = add(add(b.balance || 0, b.releaseBalance || 0), b.frozenBalance || 0);
                return totalA - totalB
            },
        },
        {
            title: t('assetsAccount.available'), //"可用",
            dataIndex: "balance",
            key: "balance",
            align: "center",
            // width: 158,
            render: (_text, record) => {
                const coin = coinList.find((item: any) => item.coinName === record.coinName);
                return <span >{_text ? roundDown(_text, coin?.unitScale) : '0'}</span>;

            },
            sorter: (a, b) => a.balance - b.balance,
        },
        {
            title: t('assetsAccount.frozen'), //"冻结",
            key: "releaseBalance",
            dataIndex: "releaseBalance",
            width: 128,
            align: "center",
            render: (_text, record) => {
                const coin = coinList.find((item: any) => item.coinName === record.coinName);
                return <span >{_text ? roundDown(_text, coin?.unitScale) : '0'}
                </span>;
            },
            sorter: (a, b) => a.releaseBalance - b.releaseBalance,
        },
        {
            title: t('assetsAccount.order'), //"下单锁定",
            key: "frozenBalance",
            dataIndex: "frozenBalance",
            width: 128,
            align: "center",
            render: (_text, record) => {
                const coin = coinList.find((item: any) => item.coinName === record.coinName);
                return <span >{_text ? roundDown(_text, coin?.unitScale) : '0'}</span>;
            },
            sorter: (a, b) => a.frozenBalance - b.frozenBalance,
        },
        {
            title: t('assetsAccount.operation'), //"操作",
            key: "action",
            dataIndex: "action",
            // width: 128,
            align: "center",
            render: (_text, record) => {
                const coin = coinList.find((item: any) => item.coinName === record.coinName);
                return <>
                    {/* 提现 */}
                    <button className={`${coin?.canWithdraw === 1 ? styles.theme_color : styles.tip_color2} mr-3 font-12 font-w-500`}
                        onClick={() => getCoinList('1', coin)}
                    >
                        {t('assetsAccount.button.withdraw')}
                    </button>
                    {/* 充值 */}
                    <button className={`${coin?.canRecharge === 1 ? styles.theme_color : styles.tip_color2} mr-3 font-12 font-w-500`}
                        onClick={() => getCoinList('2', coin)}
                    >
                        {t('assetsAccount.button.deposit')}
                    </button>
                    {/* 交易 */}
                    <button className={`${coin?.canTransfer === 1 ? styles.theme_color : styles.tip_color2} font-12 font-w-500`}
                        onClick={() => getCoinList('3', coin)}
                    >
                        {t('assetsAccount.button.trade')}
                    </button>
                </>
            },
        },


    ];
    const getCoinList = async (type: string, coinData: any) => {
        // console.log(12345,coinList);
        if (type === '1') {
            if (coinData?.canWithdraw === 1) {
                router.push(ROUTER_KEY_ASSETS.WITHDRAW_MONEY);
            } else {
                toast.error(t('assetsAccount.button.withdrawError'));
            }
        } else if (type === '2') {
            if (coinData?.canRecharge === 1) {
                router.push(ROUTER_KEY_ASSETS.TOP_UP);
            } else {
                toast.error(t('assetsAccount.button.depositError'));
            }

        } else if (type === '3') {
            if (coinData?.canTransfer === 1) {
                router.push(ROUTER_KEY_SPOT.INDEX);
            } else {
                toast.error(t('assetsAccount.button.tradeError'));
            }
        }

    }
    const pageChange = async (page: number, pageSize: number) => {
        const pageData = {
            page: page,
            pageSize: pageSize
        }
        setPageParam(pageData)
        paramdataRef.current = pageData;
    }
    const searchInputChange = (e: any) => {
        const value = e.target.value;
        if (value) {
            const newData = initTableData.filter(item => item.coinName.toLowerCase().includes(value.toLowerCase()));
            setTableData(newData);
        } else {
            setTableData(initTableData);
        }
    }
    const hideZeroChange = (e: any) => {
        // setHideZero(!hideZero)
        const value = e.target.checked
        if (value && initTableData.length > 0) {
            const newData = initTableData.filter(item => item.balance.toString().trim() !== '0');
            setTableData(newData);
        } else {
            setTableData(initTableData);
        }
    }
    const getUserBalanceAllData = async () => {
        setTableLoading(true);
        try {
            const res = await getUserBalanceAll();
            if (res.code === '0') {
                setInitTableData(res.data || []);
                setTableData(res.data || []);
                const totalUsd = res.data.reduce((sum: number, curr: any) => {
                    const coinTotal = add(
                        add(curr.balance || 0, curr.releaseBalance || 0),
                        curr.frozenBalance || 0
                    );
                    const coin = coinList.find((item: any) => item.coinName === curr.coinName);
                    const balance = add(coinTotal, coin?.price || 0);
                    // const usdRate = getRate(curr.coinName, coinTotal, 'USD').rate;
                    return sum + Number(balance) || 0;
                }, 0);
                const rateKeyName = rateKey.split('-')[0].trim()
                const usdRate = getRate('USDT', totalUsd, rateKeyName).rate
                // const usdRate = getRate('USDT', totalUsd, 'USD').rate
                const cnyRate = getRate('USDT', totalUsd, 'CNY').rate
                setBalanceAll({
                    usdBalance: Number(usdRate) || 0,
                    cnyBalance: Number(cnyRate) || 0
                });
            }
        } catch (error) {
            toast.error(String(error));
        } finally {
            setTableLoading(false);
        }
    };
    const getUserBalanceDay = async () => {
        try {
            const res = await getUserBalanceByDay();
            if (res.code === '0') {
                const rateKeyName = rateKey.split('-')[0].trim()
                // const usdRate = getRate('USDT', totalUsd, rateKeyName).rate
                const usdRate = await getRate('USDT', res.data[0].balance, rateKeyName);
                const cnyRate = await getRate('USDT', res.data[0].balance, 'CNY');
                setBalanceDay({
                    usdBalance: Number(usdRate.rate) || 0,
                    cnyBalance: Number(cnyRate.rate) || 0
                });
            }
        } catch (error) {
            toast.error(String(error));
        }
    };

    useEffect(() => {
        getUserBalanceAllData();
        getUserBalanceDay()
    }, [])
    return (<div>
        <ConfigProvider
            theme={{
                components: {
                    Table: {
                        // bodySortBg: "pink",
                        headerBg: "transparent",
                        headerColor: "var(--text-color6)",
                        headerSplitColor: "transparent", // 表头分割线颜色
                        rowExpandedBg: "var(--background10)", // 表格行展开背景色
                        borderColor: "transparent",
                        // stickyScrollBarBg:"transparent",
                        headerBorderRadius: 0, // 表头圆角
                    },
                    Pagination: {
                        itemActiveBg: "transparent",
                        itemBg: "transparent",
                    },

                    Select: {
                        activeBorderColor: "var(--border-color4)",
                        optionActiveBg: "transparent",
                        selectorBg: "transparent", //选框背景色
                    },
                    Input: {
                        activeBorderColor: 'var(--theme-color)',
                        hoverBorderColor: 'var(--theme-color)',
                        controlHeightLG: 50,
                        activeBg: 'var(--background5)',
                        hoverBg: 'var(--background5)',
                    },
                },
                token: {
                    colorBgContainer: 'transparent',
                }
            }}
        >
            <div className='flex justify-between align-center'>
                <h2 className={`font-w-500 font-20`}>
                    {/* 现货账户 */}
                    {t('assets.assetsAccount')}
                </h2>
                <div className='flex-row'>
                    <button className={`default_btn ${styles.btn_style} mr-4`} onClick={() => router.push(ROUTER_KEY_ASSETS.TOP_UP)}>
                        {/* 充值 */}
                        {t('assetsAccount.button.deposit')}
                    </button>
                    <button className={`cancel_btn4 ${styles.btn_style} mr-4`} onClick={() => router.push(ROUTER_KEY_ASSETS.WITHDRAW_MONEY)}>
                        {/* 提现 */}
                        {t('assetsAccount.button.withdraw')}
                    </button>
                    <button className={`cancel_btn4 ${styles.btn_style}`} onClick={() => router.push(ROUTER_KEY_ASSETS.BILL)}>
                        {/* 现货账单 */}
                        {t('assetsAccount.button.bill')}
                    </button>
                </div>
            </div>
            <div className={`${styles.card_bgc}  mt-3 `}>
                <div className={`${styles.card_bgc2} w-full`}>
                    <ul className='flex-row'>
                        <li className={`flex-y flex-wrap ${styles.header_content_item} mr-5`}>
                            <p className={`${styles.tip_color} font-w-400 font-14`}>
                                {/* 现货资产 */}
                                {t('assetsAccount.assets')}
                            </p>
                            <p className={`${styles.tip_color} font-w-500 font-14 flex-y`}>
                                <span className={`${styles.title_color} font-w-700 font-32`}>
                                    {balanceAll.usdBalance}&nbsp;{rateKey.split('-')[0].trim()||'--'}
                                </span>
                                <span>
                                    ≈  {balanceAll.cnyBalance} CNY
                                </span>
                            </p>
                        </li>
                        <li className={`flex-y flex-wrap ${styles.header_content_item}`}>
                            <p className={`${styles.tip_color} font-w-400 font-14`}>
                                {/* 今日盈亏 */}
                                {t('assetsAccount.todayProfit')}
                            </p>
                            <p className={`${styles.tip_color} font-w-500 font-14 flex-y`}>
                                <span className={`${styles.title_color} font-w-700 font-32`}>
                                    {cut(balanceAll.usdBalance, balanceDay.usdBalance)}&nbsp;
                                    {/* USD */}
                                    {rateKey.split('-')[0].trim()||'--'}
                                    </span>
                                <span>≈  {cut(balanceAll.cnyBalance, balanceDay.cnyBalance)} CNY</span>
                            </p>
                        </li>
                    </ul>
                </div>
                <div className={`${styles.table_box} w-full `}>
                    <div className={`${styles.table_header} w-full my-4 flex align-center`}>
                        {/* <Form form={form} layout="inline">
                        <Form.Item name="search"> */}
                        <Input className={`${styles.input_box} modal-input mr-7`}
                            maxLength={25}
                            placeholder={t('assetsAccount.search')}
                            allowClear
                            prefix={<Iconify icon="garden:search-26" size={20} className={`${styles.title_color} `} />}
                            onChange={searchInputChange}
                        />
                        {/* </Form.Item>
                        <Form.Item name="hideZero"> */}
                        <Checkbox
                            // checked={hideZero}
                            onChange={hideZeroChange}
                        >
                            <span className={`${styles.title_color}`}>{t('assetsAccount.hideZero')}</span>
                        </Checkbox>
                        {/* </Form.Item>
                    </Form> */}
                    </div>
                    <div className={`${styles.table_content} w-full `}>

                        <Table
                            columns={columns}
                            dataSource={tableData}
                            size="large"
                            scroll={{ x: "max-content", y: 500 }}
                            className={`table-box`}
                            // pagination={{
                            //     position: ["bottomRight"],
                            //     showSizeChanger: true,
                            //     total: total,
                            //     size: "default",
                            //     onChange: (page, pageSize) => pageChange(page, pageSize),
                            // }}
                            pagination={false}
                            loading={tableLoading}
                        />

                    </div>
                </div>
            </div>
        </ConfigProvider>
    </div>
    );
});
export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale || 'en', ['assets', 'common'])),
        },
    };
};
export default withAssetsLayout(AssetsMainPage);