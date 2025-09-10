import React from 'react';
import styles from '../styles/spotAccount.module.css'
import { ConfigProvider, Table, Radio, Checkbox } from 'antd';
import type { ColumnsType } from "antd/es/table";
import dayjs from 'dayjs';
import { useState, useEffect, useRef } from "react";
import { NoData, NoAddress } from '@/components/noData';
import { getWithdrawDepositList, getCancelWithdraw } from '@/services/assets'
import { useTranslation } from 'next-i18next';
import { Iconify } from '@/components/icon'
import { useRouter } from 'next/router';
import type { CheckboxProps } from 'antd';
import { toast } from "sonner";
import TableCancelModal from './modal/table_cancel';
import { useResetStateContext } from '@/hooks/useStateProvider';
import { encryptData } from '@/hooks/user-encrypt'
import { ROUTER_KEY_ASSETS, LOCAL_STORAGE_KEY, ROUTER_KEY_SPOT } from '@/config/apiConfig';
import { roundDown } from '@/utils';
// import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
interface DataType {
    withdrawalId: string,
    userId: number,
    coinId: number,
    coinName: string,
    protocolId: number,
    amount: number,
    fee: number,
    toAddress: string,
    fromAddress: string,
    txHash: string,
    status: number,
    createTime: number,
    updateTime: number,
    riskLevel: number,
    riskExplain: string,
    tenantId: string
}
interface coinSelectType {
    coinId?: string,
    coinName?: string,
    iconUrl?: string,
    nameDefault?: string,
    value?: string,
    label?: string | React.ReactNode,
}
type Props = {
    coinId: number | string | any,
    coinAll?: coinSelectType[]
};
const WithdrawMoneyTable = ({ coinId }: Props) => {
    const { t } = useTranslation(['assets']);
    const router = useRouter();
    const [tableData, setTableData] = useState<DataType[]>([]);
    // const [initTableData, setInitTableData] = useState<DataType[]>([]);
    const [open, setOpen] = useState(false);
    const [total, setTotal] = useState(0);
    const [currentCoin, setCurrentCoin] = useState<any>(null);
    const [tableLoading, setTableLoading] = useState(false);
    const [orderId, setOrderId] = useState<string>('');
    // const { copyFn } = useCopyToClipboard();
    const paramdataRef = useRef({
        page: 1,
        pageSize: 10,
        checked: false
    });
    const { resetState, setResetState } = useResetStateContext();

    const getStatus = (status: number | string) => {
        /* 0创建  
           处理中 
               1待审核
               2审核通过
               7处理失败
               8钱包处理中
               9钱包驳回 
           拒绝
               3审核拒绝
           已撤销
               4撤单完成
               6正在撤单
           已转出
               5提现完成 */
           const code = status === null || status === undefined ? '' : String(status).trim()
           if (!code) return '--'
           if (["0","1"].includes(code)) {
               return t('assetsAccount.typelist.pending')
           }
           if ([ "2", "7", "8", "9"].includes(code)) {
               return t('assetsAccount.typelist.processing')
           }
           if (code === "3") {
               return t('assetsAccount.typelist.rejected')
           }
           if (["4", "6"].includes(code)) {
               return t('assetsAccount.typelist.canceled2')
           }
           if (code === "5") {
               return t('assetsAccount.typelist.completed2')
           }
           return code || '--'
       }
   


    const columns: ColumnsType<DataType> = [
        {
            title: t('assetsAccount.coin'), //"币种",
            dataIndex: "coinName",
            key: "coinName",
            width: 158,
            align: "left",
            render: (text, record) => {
                return <div>{text || '--'} </div>
                // const coin = coinAll.find(coin => coin.coinId === text);
                // return <div>{coin?.coinName || '--'} </div>
            },
        },
        {
            title: t('assetsAccount.withdrawTime'), //"提币时间",
            dataIndex: "createTime",
            key: "createTime",
            align: "center",
            width: 128,
            render: (_text) => <span>{_text ? dayjs(_text).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>,
        },
        {
            title: t('assetsAccount.number'), //"数量",
            dataIndex: "amount",
            key: "amount",
            align: "center",
            width: 158,
            render: (_text) => {
                return <span >{_text || '--'}</span>;

            },
        },
        {
            title: t('assetsAccount.fee'), //"手续费",
            key: "fee",
            dataIndex: "fee",
            width: 128,
            align: "center",
            render: (_text, record) => {
                const coin = currentCoin.find((item: any) => item.coinName === record.coinName)
                return <span >{_text ? roundDown(_text, coin?.unitScale) : '0'}</span>;
            },
        },
        {
            title: t('assetsAccount.address'), //"地址",
            key: "toAddress",
            dataIndex: "toAddress",
            width: 128,
            align: "center",
            render: (_status) => {
                return <span >{_status || '--'}</span>;
            },
        },
        {
            title: t('assetsAccount.walletProcessingTime'), //"钱包处理时间",
            key: "updateTime",
            dataIndex: "updateTime",
            width: 128,
            align: "center",
            render: (_status) => {
                return <span >{_status ? dayjs(_status).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>;
            },
        },
        {
            title: "TxID",
            key: "txHash",
            dataIndex: "txHash",
            width: 128,
            align: "center",
            render: (_status) => {
                return <span >{_status || '--'}</span>;
            },
        },
        {
            title: t('assetsAccount.status'), //"状态",
            key: "status",
            dataIndex: "status",
            width: 128,
            align: "center",
            render: (_status) => {
                return <span >{getStatus(_status) || '--'}</span>;
            },
        },
        {
            title: t('assetsAccount.operation'), //"操作",
            key: "operation",
            dataIndex: "operation",
            width: 128,
            align: "center",
            render: (_status, record) => {
                return < >{record?.status?.toString() == '1' || record?.status?.toString() == '0' ?
                    <button className={`${styles.theme_color}`}
                        onClick={() => {
                            setOpen(true)
                            setOrderId(record.withdrawalId)
                        }}
                    >{t('assetsAccount.button.cancel')}</button>
                    : '--'}
                </>;
            },
        },


    ];
    // 撤销提现
    const cancelWithdraw = async () => {
        const param = {
            withdrawalId: orderId
        }
        const encrypt = await encryptData(param)
        const res = await getCancelWithdraw(encrypt)
        try {
            if (res.code === '0') {
                toast.success(res.message || 'success')
                setOpen(false)
            } else {
                toast.error(res.message || 'error')
            }
        } catch (error) {
            toast.error(String(error) || 'error')
        } finally {
            await getWithdrawDepositListData()
            setOpen(false)
        }

    }


    const pageChange = async (page: number, pageSize: number) => {
        const pageData = {
            ...paramdataRef.current,
            page: page,
            pageSize: pageSize
        }
        paramdataRef.current = pageData;
        await getWithdrawDepositListData()
    }
    const getWithdrawDepositListData = async () => {
        const pageParam = {
            pageNo: paramdataRef.current.page,
            pageSize: paramdataRef.current.pageSize,
            coinId: coinId && paramdataRef.current.checked ? coinId : null
        }
        setTableLoading(true)
        try {
            const res = await getWithdrawDepositList(pageParam)
            if (coinId && paramdataRef.current.checked) {
                // const tableData = res.data.list.filter((item: any) => item.coinId == coinId)
                setTableData(res.data.list)
                setTotal(res.data.count)
            } else {
                setTableData(res.data.list)
                setTotal(res.data.count)
            }
        } finally {
            setTableLoading(false)
            // 只在 resetState 为 true 时才重置状态
            if (resetState) {
                setResetState(false)
            }
        }
    }
    const onlyShowChange: CheckboxProps['onChange'] = (e) => {

        if (e.target.checked) {
            if (coinId) {
                // setTableData(initTableData.filter((item) => item.coinId == coinId))
                paramdataRef.current.checked = true // 确保选中状态更新
                getWithdrawDepositListData()
            } else {
                // 如果没有有效的 coinId，则取消选中
                paramdataRef.current.checked = false
                // setTableData(initTableData)
                toast.error(t('withdrawTable.onlyShowError'))
            }
        } else {
            paramdataRef.current.checked = false
            // setTableData(initTableData)
            getWithdrawDepositListData()
        }
    }
    useEffect(() => {
        // 只在 resetState 为 true 时发起请求
        if (resetState) {
            getWithdrawDepositListData();
        }
    }, [resetState]);
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const coinStr = localStorage.getItem(LOCAL_STORAGE_KEY.CURRENT_COIN);
            setCurrentCoin(coinStr ? JSON.parse(coinStr) : null);
        }
    }, []);
    // 添加初始加载的 useEffect
    useEffect(() => {
        getWithdrawDepositListData();
    }, []);

    return (
        <div className={`${styles.table_box} w-full `}>
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

                    },
                    token: {
                        colorBgContainer: 'transparent',
                    }
                }}
            >
                <div className={`${styles.table_header} w-full my-4 flex align-center justify-between`}>
                    <h5 className={`font-w-500 font-18`}>
                        {/* 最近提现记录 */}
                        {t('withdrawTable.title')}
                    </h5>
                    <div className='flex-x align-center'>
                        <Checkbox
                            defaultChecked={false}
                            onChange={onlyShowChange}
                            checked={paramdataRef.current.checked}
                        >
                            <span className={`${styles.title_color} font-14`}>
                                {t('withdrawTable.onlyShow')}
                            </span>
                        </Checkbox>
                        <button className='flex-x align-center font-16' onClick={() => {
                            router.push(`${ROUTER_KEY_SPOT.BILL}?cardType=WITHDRAW`)
                        }}>
                            {t('withdrawTable.more')}
                            <Iconify icon="mingcute:right-line" size={26} />
                        </button>
                    </div>

                </div>

                <Table
                    columns={columns}
                    dataSource={tableData}
                    size="large"
                    scroll={{ x: "max-content" }}
                    className={` table-box`}
                    pagination={{
                        position: ["bottomRight"],
                        showSizeChanger: true,
                        total: total,
                        size: "default",
                        hideOnSinglePage: true,
                        onChange: (page, pageSize) => pageChange(page, pageSize),
                    }}
                    loading={tableLoading}
                    locale={{ emptyText: <NoData title={t('withdrawMoney.noRecord')} /> }}
                />
            </ConfigProvider>
            <TableCancelModal open={open}

                onCancel={() => setOpen(false)}
                onOk={() => cancelWithdraw()} />
        </div>

    );
};

export default WithdrawMoneyTable;