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
    coinAll: coinSelectType[]
};
const WithdrawMoneyTable = ({ coinId, coinAll }: Props) => {
    const { t } = useTranslation(['assets']);
    const router = useRouter();
    const [tableData, setTableData] = useState<DataType[]>([]);
    const [initTableData, setInitTableData] = useState<DataType[]>([]);
    const [open, setOpen] = useState(false);
    const [total, setTotal] = useState(0);
    const [checked, setChecked] = useState<boolean>(false);
    const [currentCoin, setCurrentCoin] = useState<any>(null);
    const [pageParam, setPageParam] = useState({
        page: 1,
        pageSize: 10
    })
    const [tableLoading, setTableLoading] = useState(false);
    const [orderId, setOrderId] = useState<string>('');

    const paramdataRef = useRef(pageParam);
    const { resetState, setResetState } = useResetStateContext();




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

    const getStatus = (status: number) => {
        const statusText = Number(status)
        // 状态: 0-创建, 1-待审核, 2-审核通过, 3-审核拒绝, 4-用户撤销  5 提现完成
        switch (statusText) {
          case 0:
            return t('withdrawTable.create') //'创建';
          case 1:
            return t('withdrawTable.pending') //'待审核'
          case 2:
            return t('withdrawTable.passed') //审核通过
          case 3:
            return t('withdrawTable.rejected') //'审核拒绝'
          case 4:
            return t('withdrawTable.canceled') //'用户撤销'
          case 5:
            return t('withdrawTable.completed') //'提现完成'
          default:
            return statusText || '--'
        }
      }

    const pageChange = async (page: number, pageSize: number) => {
        const pageData = {
            page: page,
            pageSize: pageSize
        }
        setPageParam(pageData)
        paramdataRef.current = pageData;
        await getWithdrawDepositListData()
    }
    const getWithdrawDepositListData = async () => {
        const pageParam = {
            pageNo: paramdataRef.current.page,
            pageSize: paramdataRef.current.pageSize
        }
        setTableLoading(true)
        try {
            const res = await getWithdrawDepositList(pageParam)
            setInitTableData(res.data.list)
            if (coinId && checked) {
                const tableData = res.data.list.filter((item: any) => item.coinId == coinId)
                setTableData(tableData)
                setTotal(tableData.length)
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
                setTableData(initTableData.filter((item) => item.coinId == coinId))
                setChecked(true) // 确保选中状态更新
            } else {
                // 如果没有有效的 coinId，则取消选中
                setChecked(false)
                setTableData(initTableData)
                toast.error(t('withdrawTable.onlyShowError'))
            }
        } else {
            setChecked(false)
            setTableData(initTableData)
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
                            checked={checked}
                        >
                            <span className={`${styles.title_color} font-14`}>
                                {t('withdrawTable.onlyShow')}
                            </span>
                        </Checkbox>
                        <button className='flex-x align-center font-16' onClick={() => {
                            router.push(ROUTER_KEY_SPOT.BILL)
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
                    scroll={{ x: "max-content", y: 500 }}
                    className={` table-box`}
                    pagination={{
                        position: ["bottomRight"],
                        showSizeChanger: true,
                        total: total,
                        size: "default",
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