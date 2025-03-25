import React from 'react';
// import { withAssetsLayout } from '@/components/sidebarLayout/AssetsLayout/assetsLayout';
import styles from '../styles/addAddress.module.css'
import { Input, Steps, Breadcrumb, ConfigProvider, Table, Select } from 'antd';
import { Iconify } from "@/components/icon"
import type { ColumnsType } from "antd/es/table";
import dayjs from 'dayjs';
import { useState, useEffect, useRef } from "react";
import { useThemeMode } from '@/hooks/useThemeMode';
import Image from 'next/image'
import Link from 'next/link'
import { NoData, NoAddress } from '@/components/noData';
import WithdrawMoneyCheck from '@/components/assetsModal/withdrawMoneyCheck'
import { getWithdrawDepositList } from '@/services/assets'
import { useRouter } from 'next/router'
import NoUseCom from '../compontents/noSM'

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
const WithdrawMoneyPage = () => {
    const [total, setTotal] = useState(0);
    const [total2, setTotal2] = useState(0);

    const [tableData, setTableData] = useState<DataType[]>([
        {
            id: 1,
            userId: 1,
            platformType: 1,
            deviceNo: '1234567890',
            ip: '123.45.67.89',
            address: '1234567890',
            token: 1,
            tokenTime: 1,
            createTime: 1,
            updateTime: 1,
            tenantId: '1234567890',
        },
        {
            id: 2,
            userId: 2,
            platformType: 2,
            deviceNo: '2234567890',
            ip: '203.45.67.89',
            address: '2234567890',
            token: 2,
            tokenTime: 2,
            createTime: 2,
            updateTime: 2,
            tenantId: '2234567890',
        }

    ]);
    const { isDayMode } = useThemeMode(); // 使用 hook
    const [checkOpen, setCheckOpen] = useState(false);
    const [searchHistory, setSearchHistory] = useState<string[]>(['BTC', 'ETH', 'FIL', 'USDT']);

    const [current, setCurrent] = useState(2);

    const [pageParam, setPageParam] = useState({
        page: 1,
        pageSize: 10
    })
    const [tableLoading, setTableLoading] = useState(false);
    const paramdataRef = useRef(pageParam);

    const router = useRouter()
    const antiFraud = () => {
        setCheckOpen(true)
    }
    const coinTypeSeelect = [
        {
            label: 'BTC',
            value: 'BTC'
        },

    ]
    const pageChange = async (page: number, pageSize: number) => {
        const pageData = {
            page: page,
            pageSize: pageSize
        }
        setPageParam(pageData)
        paramdataRef.current = pageData;
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
            setTotal(res.data.total)
        } finally {
            setTableLoading(false)
        }

    }
    const columns: ColumnsType<DataType> = [
        {
            title: "时间",
            dataIndex: "deviceNo",
            key: "deviceNo",
            width: 158,
            align: "left",
            render: (text, record) => <div>{`${text}`} </div>,
        },
        {
            title: "类型",
            dataIndex: "token",
            key: "token",
            align: "center",
            width: 128,
            render: (_text) => <span>{_text || '--'}</span>,
        },
        {
            title: "币种",
            dataIndex: "tokenTime",
            key: "tokenTime",
            align: "center",
            width: 158,
            render: (_status) => {
                return <span >{_status || '--'}</span>;

            },
        },
        {
            title: "数量",
            key: "createTime",
            dataIndex: "createTime",
            width: 128,
            align: "center",
            render: (_ip) => {
                return <span >{_ip || '--'}</span>;
            },
        },
        {
            title: "手续费",
            key: "platformType",
            dataIndex: "platformType",
            width: 128,
            align: "center",
            render: (_status) => {
                return <span >{_status || '--'}</span>;
            },
        },
        {
            title: "地址",
            key: "address",
            dataIndex: "address",
            width: 128,
            align: "center",
            render: (_status) => {
                return <span >{_status || '--'}</span>;
            },
        },
        {
            title: "TxID",
            key: "updateTime",
            dataIndex: "updateTime",
            width: 128,
            align: "center",
            render: (_status) => {
                return <span >{_status || '--'}</span>;
            },
        },
        {
            title: "状态",
            key: "tenantId",
            dataIndex: "tenantId",
            width: 128,
            align: "center",
            render: (_status) => {
                return <span >{_status || '--'}</span>;
            },
        },
        {
            title: "操作",
            key: "action",
            dataIndex: "action",
            width: 128,
            align: "center",
            render: (_status) => {
                return <>
                    <button className={`${styles.theme_color} mr-3 font-12 font-w-500`}>提现</button>
                    <button className={`${styles.tip_color2} mr-3 font-12 font-w-500`}>充值</button>
                    <button className={`${styles.theme_color} font-12 font-w-500`}>交易</button>
                </>
            },
        },


    ];
    useEffect(() => {
        getWithdrawDepositListData()
    }, [])


    return (<div className={` page-h w-full page-box flex-y align-center`} style={{ paddingBottom: '10vh' }}>

        <div className={`${styles.spot_auth_box}`} >
            <div className='flex justify-between align-center'>
                <Breadcrumb items={[
                    {
                        title: <Link href="/assets/assetsAccount"><span className={`${styles.tip_color}`}>现货账户</span></Link>,
                    },
                    {
                        title: <Link href="/assets/assetsAccount/withdrawMoney"><span className={`${styles.tip_color}`}>提现</span></Link>,
                    },
                    {
                        title: <span className={`${styles.title_color}`}>地址管理</span>,
                    },
                ]} style={{ fontSize: 14 }} />

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
                }}>
                <div className={`${styles.table_box} w-full `}>
                    <div className={`${styles.table_header} w-full my-4 flex align-center justify-between`}>
                        <div className='flex-x align-center'>
                        <Select allowClear
                            placeholder="请选择币种"
                            options={coinTypeSeelect}
                            className={`${styles.select_box} custom-select`}
                        />
                        <Input className={`${styles.input_box} modal-input ml-5`}
                            maxLength={25}
                            placeholder='搜索地址/备注'
                            allowClear
                            prefix={<Iconify icon="garden:search-26" size={20} className={`${styles.title_color} `} />}
                        />
                        </div>
                        <button type='button' className={`default_btn font-16 font-w-500 ${styles.btn_style} flex-x-cc`}>
                            <Iconify icon="mingcute:add-line" size={20} className={` mr-2`} style={{color: '#fff'}}/>
                            添加地址</button>
                    </div>
                    <div className={`${styles.table_content} w-full `}>

                        <Table
                            columns={columns}
                            dataSource={tableData}
                            size="large"
                            scroll={{ x: "max-content", y: 300 }}
                            className={` table-box`}
                            pagination={{
                                position: ["bottomRight"],
                                showSizeChanger: true,
                                total: total2,
                                size: "default",
                                onChange: (page, pageSize) => pageChange(page, pageSize),
                            }}
                        // loading={loading}
                        locale={{ emptyText: <NoAddress /> }}
                        // rowSelection={{ type: 'checkbox', ...rowSelection }}
                        rowKey="id"
                        rowSelection={{ type: 'checkbox'}}
                        />

                    </div>
                </div>
                
            </ConfigProvider>

        </div>
    </div >
    );
};

export default WithdrawMoneyPage;