import React from 'react';
import { withAssetsLayout } from '@/components/sidebarLayout/AssetsLayout/userAssetsLayout';
import styles from '../styles/spotChartCom.module.css'
import { Input, Radio, ConfigProvider, Table, Form, Checkbox } from 'antd';
import { Iconify } from "@/components/icon"
import type { ColumnsType } from "antd/es/table";
import dayjs from 'dayjs';
import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router';
import { getUserBalanceAll } from '@/services/assets';
import { toast } from "sonner";
import { add, cut, nul } from '@/utils'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { NoData } from '@/components/noData'

interface DataType {
    balance: number,
    frozenBalance: number,
    releaseBalance: number,
    isLock: number,
    coinId: string,
    coinName: string
}
const AssetsMainPage = () => {
    const { t } = useTranslation(['spot']);
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
            render: (text, record) => <div>{`${text}`} </div>,
            sorter: (a, b) => a.coinName.localeCompare(b.coinName),
        },
        {
            title: t('spot.columns.balance'), //"持仓",
            dataIndex: "balance",
            key: "balance",
            align: "center",
            // width: 128,
            render: (_text, record) => {
                const text = add(record.balance || 0, record.releaseBalance || 0);
                const text2 = add(text, record.frozenBalance || 0);
                return <span>{text2 || '0'}</span>
            },
            sorter: (a, b) => {
                const totalA = add(add(a.balance || 0, a.releaseBalance || 0), a.frozenBalance || 0);
                const totalB = add(add(b.balance || 0, b.releaseBalance || 0), b.frozenBalance || 0);
                return totalA - totalB
            },
        },
        {
            title: t('spot.columns.available'), //"可用",
            dataIndex: "balance",
            key: "balance",
            align: "center",
            // width: 158,
            render: (_text) => {
                return <span >{_text || '0'}</span>;

            },
            sorter: (a, b) => a.balance - b.balance,
        },
        {
            title: t('spot.columns.frozen'), //"冻结",
            key: "releaseBalance",
            dataIndex: "releaseBalance",
            // width: 128,
            align: "center",
            render: (_text) => {
                return <span >{_text || '--'}</span>;
            },
            sorter: (a, b) => a.releaseBalance - b.releaseBalance,
        },
        {
            title: t('spot.columns.order'), //"下单锁定",
            key: "frozenBalance",
            dataIndex: "frozenBalance",
            // width: 128,
            align: "center",
            render: (_text) => {
                return <span >{_text || '--'}</span>;
            },
            sorter: (a, b) => a.frozenBalance - b.frozenBalance,
        },
        {
            title: t('spot.columns.operation'), //"操作",
            key: "action",
            dataIndex: "action",
            // width: 128,
            align: "center",
            render: (_text) => {
                return <>
                    <button className={`${styles.tip_color2} mr-3 font-12 font-w-500`}>{t('spot.columns.deposit')}</button>
                    <button className={`${styles.theme_color} font-12 font-w-500`}>{t('spot.columns.withdraw')}</button>
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
    const searchInputChange = (e: any) => {
        const value = e.target.value;
        if (value) {
            const newData = initTableData.filter(item => item.coinName.includes(value));
            setTableData(newData);
        } else {
            setTableData(initTableData);
        }
    }
    const hideZeroChange = (e: any) => {
        // setHideZero(!hideZero)
        const value = e.target.checked
        if (value && initTableData.length > 0) {
            const newData = initTableData.filter(item => item.balance !== 0);
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
                setInitTableData(res.data.list || []);
                setTableData(res.data.list || []);
                setTotal(res.data.total);
            }
        } catch (error) {
            toast.error(String(error));
        } finally {
            setTableLoading(false);
        }
    }

    return (<>
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
                        }
                    },
                }}
            >
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
                    loading={tableLoading}
                    locale={{ emptyText: <NoData textColor='#A4A5AC' /> }}
                />
            </ConfigProvider>
        </div>
    </>
    );
};

export default AssetsMainPage;