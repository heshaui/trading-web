import React from 'react';
import { withAssetsLayout } from '@/components/sidebarLayout/AssetsLayout/assetsLayout';
import styles from '../styles/spotAccount.module.css'
import { Input, Radio, ConfigProvider, Table } from 'antd';
import { Iconify } from "@/components/icon"
import type { ColumnsType } from "antd/es/table";
import dayjs from 'dayjs';
import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router';

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
const AssetsMainPage = () => {
    const [tableData, setTableData] = useState<DataType[]>([
        {
            id: 1,
            userId: 1,
            platformType: 1,
            deviceNo: 'BTC',
            ip: '123.45.67.89',
            address: '123.45.67.89',
            token: 23.3,
            tokenTime: 123,
            createTime: 1234567890,
            updateTime: 1234567890,
            tenantId: '1234567890'
        },{
            id: 2,
            userId: 1,
            platformType: 1,
            deviceNo: 'POINT',
            ip: '123.45.67.89',
            address: '123.45.67.89',
            token: 1234567890,
            tokenTime: 23.0,
            createTime: 1234567892,
            updateTime: 1234567889,
            tenantId: '1234567890'
        }
    ]);
    const router = useRouter();
    const [total, setTotal] = useState(0);
    const [pageParam, setPageParam] = useState({
        page: 1,
        pageSize: 10
    })
    const paramdataRef = useRef(pageParam);

    const columns: ColumnsType<DataType> = [
        {
            title: "币种",
            dataIndex: "deviceNo",
            key: "deviceNo",
            width: 158,
            align: "left",
            render: (text, record) => <div>{`${text}`} </div>,
            sorter: (a, b) => a.deviceNo.localeCompare(b.deviceNo),
        },
        {
            title: "持仓",
            dataIndex: "token",
            key: "token",
            align: "center",
            width: 128,
            render: (_text) => <span>{_text|| '--'}</span>,
            sorter: (a, b) => a.token - b.token,
        },
        {
            title: "可用",
            dataIndex: "tokenTime",
            key: "tokenTime",
            align: "center",
            width: 158,
            render: (_status) => {
                return <span >{_status || '--'}</span>;
                
            },
            sorter: (a, b) => a.tokenTime - b.tokenTime,
        },
        {
            title: "冻结",
            key: "createTime",
            dataIndex: "createTime",
            width: 128,
            align: "center",
            render: (_ip) => {
                return <span >{_ip || '--'}</span>;
            },
            sorter: (a, b) => a.createTime - b.createTime,
        },
        {
            title: "下单锁定",
            key: "updateTime",
            dataIndex: "updateTime",
            width: 128,
            align: "center",
            render: (_status) => {
                return <span >{_status || '--'}</span>;
            },
            sorter: (a, b) => a.updateTime - b.updateTime,
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
    const pageChange = async (page: number, pageSize: number) => {
        const pageData = {
            page: page,
            pageSize: pageSize
        }
        setPageParam(pageData)
        paramdataRef.current = pageData;
    }
    return (<div>
        <div className='flex justify-between align-center'>
            <h2 className={`font-w-500 font-20`}>现货账户</h2>
            <div className='flex-row'>
                <button className={`default_btn ${styles.btn_style} mr-4`} onClick={() => router.push('/assets/assetsAccount/topUp')}>充值</button>
                <button className={`cancel_btn4 ${styles.btn_style} mr-4`}>提现</button>
                <button className={`cancel_btn4 ${styles.btn_style}`}>现货账单</button>
            </div>
        </div>
        <div className={`${styles.card_bgc}  mt-3 `}>
            <div className={`${styles.card_bgc2} w-full`}>
                <ul className='flex-row'>
                    <li className={`flex-y flex-wrap ${styles.header_content_item}`}>
                        <p className={`${styles.tip_color} font-w-400 font-14`}>现货资产</p>
                        <p className={`${styles.tip_color} font-w-500 font-14 flex-y`}>
                            <span className={`${styles.title_color} font-w-700 font-32`}>0.15 USD</span>
                            <span>≈  1.12 CNY</span>
                        </p>
                    </li>
                    <li className={`flex-y flex-wrap ${styles.header_content_item}`}>
                        <p className={`${styles.tip_color} font-w-400 font-14`}>今日盈亏</p>
                        <p className={`${styles.tip_color} font-w-500 font-14 flex-y`}>
                            <span className={`${styles.title_color} font-w-700 font-32`}>0.15 USD</span>
                            <span>≈  1.12 CNY</span>
                        </p>
                    </li>
                </ul>
            </div>
            <div className={`${styles.table_box} w-full `}>
                <div className={`${styles.table_header} w-full my-4 flex align-center`}>
                    <Input className={`${styles.input_box} modal-input mr-7`}
                        maxLength={25}
                        placeholder='搜索'
                        allowClear
                        prefix={<Iconify icon="garden:search-26" size={20} className={`${styles.title_color} `} />}
                    />
                    <Radio
                        // defaultChecked
                    ><span className={`${styles.title_color}`}>隐藏0资产</span></Radio>
                </div>
                <div className={`${styles.table_content} w-full `}>
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
                        // pagination={{
                        //     position: ["bottomRight"],
                        //     showSizeChanger: true,
                        //     total: total,
                        //     size: "default",
                        //     onChange: (page, pageSize) => pageChange(page, pageSize),
                        // }}
                    // loading={loading}
                    />
                </ConfigProvider>
                </div>
            </div>
        </div>
    </div>
    );
};

export default withAssetsLayout(AssetsMainPage);