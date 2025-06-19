import React, { useState, useRef } from "react";
import styles from '../styles/spotAccount.module.css'
import { Input, Steps, Breadcrumb, ConfigProvider, Table, Select } from 'antd';
import { Iconify } from "@/components/icon"
import type { ColumnsType } from "antd/es/table";
import { useTranslation } from 'next-i18next';
import { useThemeMode } from '@/hooks/useThemeMode';
import Image from 'next/image'
import Link from 'next/link'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import dayjs from 'dayjs';
import { NoData, NoAddress } from '@/components/noData';
import NoUseCom from './noSM'

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
const RechargeTable = () => {
    const { t } = useTranslation(['assets']);
    const [tableData, setTableData] = useState<DataType[]>([]);


    const paramdataRef = useRef({
        page: 1,
        pageSize: 10,
        total: 0
    });

    const columns: ColumnsType<DataType> = [
        {
            title: t('assetsAccount.coin'),
            dataIndex: "deviceNo",
            key: "deviceNo",
            width: 158,
            align: "left",
            render: (text, record) => <div>{`${text}`} </div>,
        },
        {
            title: t('assetsAccount.depositTime'),
            dataIndex: "token",
            key: "token",
            align: "center",
            width: 128,
            render: (_text) => <span>{_text || '--'}</span>,
        },
        {
            title: t('assetsAccount.depositAddress'),
            dataIndex: "tokenTime",
            key: "tokenTime",
            align: "center",
            width: 158,
            render: (_status) => {
                return <span >{_status || '--'}</span>;

            },
        },
        {
            title: t('assetsAccount.txId'),
            key: "createTime",
            dataIndex: "createTime",
            width: 128,
            align: "center",
            render: (_ip) => {
                return <span >{_ip || '--'}</span>;
            },
        },
        {
            title: t('assetsAccount.confirmations'),
            key: "updateTime",
            dataIndex: "updateTime",
            width: 128,
            align: "center",
            render: (_status) => {
                return <span >{_status || '--'}</span>;
            },
        },
        {
            title: t('assetsAccount.number'),
            key: "updateTime",
            dataIndex: "updateTime",
            width: 128,
            align: "center",
            render: (_status) => {
                return <span >{_status || '--'}</span>;
            },
        },
        {
            title: t('assetsAccount.status'),
            key: "updateTime",
            dataIndex: "updateTime",
            width: 128,
            align: "center",
            render: (_status) => {
                return <span >{_status || '--'}</span>;
            },
        },


    ];

    const pageChange = async (page: number, pageSize: number) => {
        paramdataRef.current.page = page;
        paramdataRef.current.pageSize = pageSize;
    }
    return (<>
            <div className={`${styles.table_header} w-full my-4 flex align-center`}>
                <h5 className={`font-w-500 font-18`}>{t('assetsAccount.recentDepositRecords')}</h5>
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
                        total:paramdataRef.current.total,
                        size: "default",
                        onChange: (page, pageSize) => pageChange(page, pageSize),
                    }}
                    // loading={loading}
                    locale={{ emptyText: <NoData title={t('assetsAccount.nodata')} /> }}
                />
            </ConfigProvider>
    </>
    );
};


export default RechargeTable;