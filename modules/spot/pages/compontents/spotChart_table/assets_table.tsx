import React from 'react';
import { withAssetsLayout } from '@/components/sidebarLayout/AssetsLayout/userAssetsLayout';
import styles from '../styles/spotChartCom.module.css'
import { Input, Tooltip, ConfigProvider, Table, Form, Checkbox } from 'antd';
import { Iconify } from "@/components/icon"
import type { ColumnsType } from "antd/es/table";
import dayjs from 'dayjs';
import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router';
import { toast } from "sonner";
import { add, cut, nul, roundDown } from '@/utils'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { NoData } from '@/components/noData'
import { getUserBalanceAll } from '@/services/assets';
import { ROUTER_KEY_ASSETS, ROUTER_KEY_SPOT } from '@/config/apiConfig';
import { observer } from 'mobx-react-lite';
import { useCoinList } from '@/hooks/use-coinList';
import Image from 'next/image';
import { getRate } from '@/utils/getUseRate';
import appStore from '@/store';
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
type Props = {
    orderUpdateFlag?: number
}
const AssetsMainPage = () => {
    const { t } = useTranslation(['spot']);
    // 获取币种列表
    const { coinList } = useCoinList(true);
    const coinPairs = appStore.getCurrentPairList() || appStore.currencyPairs; // 货币对列表
    const rateKey = appStore.getRateKey().replace(/\s+/g, ''); // 汇率key
    const [initTableData, setInitTableData] = useState<DataType[]>([])
    const [tableData, setTableData] = useState<DataType[]>([]);
    const [tableLoading, setTableLoading] = useState(false);
    const router = useRouter();
    const [total, setTotal] = useState(0);
    const [pageParam, setPageParam] = useState({
        page: 1,
        pageSize: 10
    })
    const paramdataRef = useRef(pageParam);
    const [hideZero, setHideZero] = useState(false);
    const [form] = Form.useForm();
    const columns: ColumnsType<DataType> = [
        {
            title: t('spot.columns.coin'), //"币种",
            dataIndex: "coinName",
            key: "coinName",
            // width: 158,
            align: "left",
            render: (text, record) => {
                return <div className='flex align-center'>
                    <Image src={record?.iconUrl} alt={''} width={28} height={28}
                        style={{ borderRadius: '50%', height: '28px', width: '28px' }}
                        className='mr-1' />
                    <p className='font-w-500 font-14 flex-x'>
                        {`${text}`}
                        <Tooltip title={
                            coinPairs.filter((item: any) =>
                                item.coinSymbol === text || item.baseSymbol === text
                            ).length > 0 ? (
                                coinPairs.filter((item: any) =>
                                    item.coinSymbol === text || item.baseSymbol === text
                                ).map((item: any) => (
                                    <div key={item.id} className={`mb-1 font-12 font-w-400`} style={{ color: '#FFFFFF' }}>
                                        {item.symbol}
                                    </div>
                                ))
                            ) : '----'
                        }>
                            <Iconify icon="mingcute:right-line" className={` mx-1`} size={20} />
                        </Tooltip>
                    </p>
                </div>
            },
            sorter: (a, b) => a.coinName.localeCompare(b.coinName),
        },
        {
            title: t('spot.columns.balance'), //"持仓",
            dataIndex: "balance",
            key: "balance",
            align: "center",
            // width: 128,
            render: (_text, record) => {
                const coin = coinList.find((item: any) => item.coinName === record.coinName);  // 获取币种信息
                const text = add(record.balance || 0, record.releaseBalance || 0);
                const text2 = add(text, record.frozenBalance || 0);
                const rateKeyName=rateKey.split('-')[0]; // 获取汇率key
                const {ratetext} = getRate(record.coinName,text2,rateKeyName);
                return <p className='flex-y align-end'>
                    <span>{text2 ? roundDown(text2, coin?.unitScale) : '0'}</span>
                    <span className='ltr-text'>{record.coinName ? ratetext : ''}
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
            title: t('spot.columns.available'), //"可用",
            dataIndex: "balance1",
            key: "balance1",
            align: "center",
            // width: 158,
            render: (_text, record) => {
                const text = record.balance
                const coin = coinList.find((item: any) => item.coinName === record.coinName);
                return <span >{text ? roundDown(text, coin?.unitScale) : '0'}</span>;

            },
            sorter: (a, b) => a.balance - b.balance,
        },
        {
            title: t('spot.columns.frozen'), //"冻结",
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
            title: t('spot.columns.order'), //"下单锁定",
            key: "frozenBalance",
            dataIndex: "frozenBalance",
            // width: 128,
            align: "center",
            render: (_text, record) => {
                const coin = coinList.find((item: any) => item.coinName === record.coinName);
                return <span >{_text ? roundDown(_text, coin?.unitScale) : '0'}</span>;
            },
            sorter: (a, b) => a.frozenBalance - b.frozenBalance,
        },
        {
            title: t('spot.columns.operation'), //"操作",
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
                        {t('spot.columns.withdraw')}
                    </button>
                    {/* 充值 */}
                    <button className={`${coin?.canRecharge === 1 ? styles.theme_color : styles.tip_color2} mr-3 font-12 font-w-500`}
                        onClick={() => getCoinList('2', coin)}
                    >
                        {t('spot.columns.deposit')}
                    </button>
                    {/* 交易 */}
                    {/* <button className={`${coin?.canTransfer===1? styles.theme_color:styles.tip_color2} font-12 font-w-500`}
                    onClick={() => getCoinList('3', coin)}
                    >
                        {t('assetsAccount.button.trade')}
                    </button> */}
                </>
            },
        },


    ];
    const getCoinList = async (type: string, coinData: any) => {
        if (type === '1') {
            if (coinData?.canWithdraw === 1) {
                router.push(ROUTER_KEY_ASSETS.WITHDRAW_MONEY);
            } else {
                toast.error(t('spot.columns.withdrawError'));
            }
        } else if (type === '2') {
            if (coinData?.canRecharge === 1) {
                router.push(ROUTER_KEY_ASSETS.TOP_UP);
            } else {
                toast.error(t('spot.columns.depositError'));
            }

        } else if (type === '3') {
            if (coinData?.canRecharge === 1) {
                router.push(ROUTER_KEY_SPOT.INDEX);
            } else {
                toast.error(t('spot.columns.tradeError'));
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
            const newData = initTableData.filter(item => item.coinName.toLowerCase().includes(value));
            setTableData(newData);
        } else {
            setTableData(initTableData);
        }
    }
    const hideZeroChange = (e: any) => {
        // setHideZero(!hideZero)
        const value = e.target.checked
        if (value && initTableData.length > 0) {
            const newData = initTableData.filter(item => {
            const { rate } = getRate(item.coinName, item.balance);
            // 确保 rate 是数字且大于 1
            return  Number(rate) > 1;
            });
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
                setTotal(res.data.total);
            }
        } catch (error) {
            toast.error(String(error));
        } finally {
            setTableLoading(false);
        }
    }
    useEffect(() => {
        getUserBalanceAllData();
    }, [])
    return (<><ConfigProvider
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
                }
            },
            token: {
                colorBgContainer: 'transparent',
            }
        }}
    >
        <div className={`${styles.table_header}  my-4 ml-6 flex align-center justify-end ${styles.table_header_checkbox}`}>
            <Input className={`${styles.input_box} modal-input mr-7`}
                maxLength={25}
                placeholder={t('spot.select.search')}
                allowClear
                prefix={<Iconify icon="garden:search-26" size={20} className={`${styles.title_color} `} />}
                onChange={searchInputChange}
            />
            <Checkbox
                // checked={hideZero}
                onChange={hideZeroChange}
            >
                <span className={`${styles.title_color} font-14 font-w-400`}>{t('spot.select.hideZero')}</span>
            </Checkbox>
            {/* </Form.Item>
                    </Form> */}
        </div>
        <div className={`${styles.table_content} w-full `}>

            <Table
                columns={columns}
                dataSource={tableData}
                size="large"
                // scroll={{ x: "max-content", y: 500 }}
                className={` table-box`}
                // pagination={{
                //     position: ["bottomRight"],
                //     showSizeChanger: true,
                //     total: total,
                //     size: "default",
                //     onChange: (page, pageSize) => pageChange(page, pageSize),
                // }}
                pagination={false}
                loading={tableLoading}
                locale={{ emptyText: <NoData textColor='#A4A5AC' /> }}
            />
        </div>
    </ConfigProvider>

    </>
    );
};

export default AssetsMainPage;