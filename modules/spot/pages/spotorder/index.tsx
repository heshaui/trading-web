import React from 'react';
import { withSpotLayout } from '@/components/sidebarLayout/SpotLayout/userSpotLayout';
import styles from '../../styles/billDetails.module.css'
import { Input, Radio, ConfigProvider, Table, Select, Form ,Tabs} from 'antd';
import { Iconify } from "@/components/icon"
import type { ColumnsType } from "antd/es/table";
import dayjs from 'dayjs';
import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router';
import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { TabsProps } from 'antd';
import SpotOrderNow from '../compontents/NowOrder'
import SpotOrderHistory from '../compontents/HistoryOrder'
import SpotOrderDeal from '../compontents/HistoryDeal'

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
const SpotOrderPage = () => {
    const { t } = useTranslation(['spot']);
    const [form] = Form.useForm();
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
        }, {
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
    const [paramInfo, sePparamInfo] = useState({
        type: '',
        selsect: ''
    });
    const [total, setTotal] = useState(0);
    const [pageParam, setPageParam] = useState({
        page: 1,
        pageSize: 10,
    })
    const paramdataRef = useRef(pageParam);



    const columns: ColumnsType<DataType> = [
        {
            title: t('spot.columns.uploadTime'), //"更新时间",
            dataIndex: "deviceNo",
            key: "deviceNo",
            width: 158,
            align: "left",
            render: (text, record) => <div>{`${text}`} </div>,
        },
        {
            title: t('spot.columns.symbol'), //"交易对",
            dataIndex: "token",
            key: "token",
            align: "center",
            width: 128,
            render: (_text) => <span>{_text || '--'}</span>,
        },
        {
            title: t('spot.columns.type'), //"类型",
            dataIndex: "tokenTime",
            key: "tokenTime",
            align: "center",
            width: 158,
            render: (_status) => {
                return <span >{_status || '--'}</span>;

            },
        },
        {
            title: t('spot.columns.direction'),//"方向",
            key: "createTime",
            dataIndex: "createTime",
            width: 128,
            align: "center",
            render: (_ip) => {
                return <span >{_ip || '--'}</span>;
            },
        },
        {
            title: t('spot.columns.price'), //"价格",
            key: "updateTime",
            dataIndex: "updateTime",
            width: 128,
            align: "center",
            render: (_status) => {
                return <span >{_status || '--'}</span>;
            },
        },
        {
            title: t('spot.columns.quantity'),  //"数量",
            key: "updateTime",
            dataIndex: "updateTime",
            width: 128,
            align: "center",
            render: (_status) => {
                return <span >{_status || '--'}</span>;
            },
        },
        {
            title: t('spot.columns.completion'), //"完成度",
            key: "updateTime",
            dataIndex: "updateTime",
            width: 128,
            align: "center",
            render: (_status) => {
                return <span >{_status || '--'}</span>;
            },
        },
        {
            title: t('spot.columns.amount'), //"成交额",
            key: "updateTime",
            dataIndex: "updateTime",
            width: 128,
            align: "center",
        },
        {
            title: t('spot.columns.cancel'), //"全撤",
            key: "updateTime",
            dataIndex: "updateTime",
            width: 128,
            align: "center",
            render: (_status) => {
                return <span >{_status || '--'}</span>;
            },
        },


    ];

    const directionSelect: { label: string, value: string }[] = [
        {
            label: t('spot.select.all'),
            value: ''
        }
    ]
    const symbolSelect: { label: string, value: string }[] = [
        {
            label: t('spot.select.all'),
            value: ''
        }
    ]
    const items: TabsProps['items'] = [
        {
            key: '1',
            label: t('spot.tabs.now'), //"当前委托",
            children: <SpotOrderNow />,
        },
        {
            key: '2',
            label: t('spot.tabs.history'), //'历史委托',
            children: <SpotOrderHistory />,
        },
        {
            key: '3',
            label: t('spot.tabs.historyDeal'), //'历史成交',
            children: <SpotOrderDeal/>,
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
    const topUpTypeChange = (value: any, options: any) => {
        console.log(value, 123, options);


    }
    return (<>
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
                    Tabs: {
                        horizontalMargin: "0 0 0 0",
                        itemColor: "var(--text-color6)",
                    },
                },
            }}
        >
            <div className='flex justify-between align-center'>
                <h2 className={`font-w-500 font-20`}>
                    {t('spot.spotOrder')}
                </h2>
            </div>
            <div className={`${styles.card_bgc}  mt-3 `}>
                {/* 充值 */}
                <div className={`${styles.table_box} w-full `}>
                    <div className={`${styles.table_box_inner} `}>
                        <Tabs items={items} className="custom-tabs" />
                    </div>
                    {/* <div className={`${styles.table_header} w-full my-4 flex align-center`}>
                        <Form
                            form={form}
                            layout="inline"
                            initialValues={{
                                direction: '',
                                symbol: ''
                            }}
                        >
                            <Form.Item name="direction" >
                                <Select allowClear
                                    placeholder={t('spot.select.direction')}
                                    options={directionSelect}
                                    className={`${styles.select_box} custom-select`}
                                />
                            </Form.Item>
                            <Form.Item name="symbol" >
                                <Select allowClear
                                    placeholder={t('spot.select.symbol')}
                                    options={symbolSelect}
                                    className={`${styles.select_box} custom-select`}
                                />
                            </Form.Item>
                        </Form>
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
                                total: total,
                                size: "default",
                                onChange: (page, pageSize) => pageChange(page, pageSize),
                            }}
                        // loading={loading}
                        />

                    </div> */}
                </div>
            </div>
        </ConfigProvider>
    </>
    );
};

export default withSpotLayout(SpotOrderPage);