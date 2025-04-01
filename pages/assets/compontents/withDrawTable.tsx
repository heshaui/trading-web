import React from 'react';
import styles from '../styles/spotAccount.module.css'
import {  ConfigProvider, Table } from 'antd';
import type { ColumnsType } from "antd/es/table";
import dayjs from 'dayjs';
import { useState, useEffect, useRef } from "react";
import { NoData, NoAddress } from '@/components/noData';
import { getWithdrawDepositList} from '@/services/assets'
import { useTranslation } from 'next-i18next';
interface DataType {
    withdrawalId: string,
    userId: number,
    coinId: number,
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
const WithdrawMoneyTable = () => {
    const { t } = useTranslation(['assets']);
    const [tableData, setTableData] = useState<DataType[]>([

    ]);

    const [total, setTotal] = useState(0);

    const [pageParam, setPageParam] = useState({
        page: 1,
        pageSize: 10
    })
    const [tableLoading, setTableLoading] = useState(false);


    const paramdataRef = useRef(pageParam);




    const columns: ColumnsType<DataType> = [
        {
            title: t('assetsAccount.coin'), //"币种",
            dataIndex: "coinId",
            key: "coinId",
            width: 158,
            align: "left",
            render: (text, record) => <div>{text || '--'} </div>,
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
            render: (_text) => {
                return <span >{_text || '--'}</span>;
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
                return <span >{_status || '--'}</span>;
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
                return <span >{_status ? getStatus(_status) : '--'}</span>;
            },
        },
        {
            title: t('assetsAccount.operation'), //"操作",
            key: "operation",
            dataIndex: "operation",
            width: 128,
            align: "center",
            render: (_status) => {
                return < >
                    <button className={`${styles.theme_color}`}>{t('assetsAccount.button.cancel')}</button>
                </>;
            },
        },


    ];

    const getStatus = (status: number) => {
        switch (status) {
            case 0:
                return t('assetsAccount.withdrawTable.create') //'创建';
            case 1:
                return t('assetsAccount.withdrawTable.pending') //'待审核'
            case 2:
                return t('assetsAccount.withdrawTable.completed') //'完成'
            case 3:
                return t('assetsAccount.withdrawTable.rejected') //'拒绝 '
            case 4:
                return t('assetsAccount.withdrawTable.canceled') //'用户撤销'
            default:
                return '--'
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
            setTableData(res.data.list)
            setTotal(res.data.count)
        } finally {
            setTableLoading(false)
        }

    }

    useEffect(() => {
        getWithdrawDepositListData()
    }, [])

    return (
        <div className={`${styles.table_box} w-full `}>
            <div className={`${styles.table_header} w-full my-4 flex align-center`}>
                <h5 className={`font-w-500 font-18`}>
                    {/* 最近提现记录 */}
                    {t('withdrawTable.title')}
                </h5>
                {/* <Radio
                        defaultChecked
                    ><span className={`${styles.title_color}`}>隐藏0资产</span></Radio> */}
            </div>
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
                        }
                    },
                }}
            >
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
        </div>

    );
};

export default WithdrawMoneyTable;