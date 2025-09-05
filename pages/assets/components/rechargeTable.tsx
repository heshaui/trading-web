import React, { useState, useRef, useEffect, useMemo } from "react";
import styles from '../styles/spotAccount.module.css'
import { Input, Steps, Breadcrumb, ConfigProvider, Table, Select, Checkbox } from 'antd';
import { Iconify } from "@/components/icon"
import type { ColumnsType } from "antd/es/table";
import { useTranslation } from 'next-i18next';
import dayjs from 'dayjs';
import { NoData, NoAddress } from '@/components/noData';
import { getOrderList } from "@/services/assets";
import { toast } from 'sonner';
import type { CheckboxProps } from 'antd';
import { RechargeDataType } from "@/type/assets/billDetails/table"
import { useRouter } from 'next/router';
import { ROUTER_KEY_SPOT } from '@/config/apiConfig';

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

type PropsType = {
    coinId: string
}
const RechargeTable = ({ coinId }: PropsType) => {
    const { t } = useTranslation(['assets']);
    const [tableData, setTableData] = useState<RechargeDataType[]>([]);
    const [tableLoading, setTableLoading] = useState(false);
    const router = useRouter();
    const { copyFn } = useCopyToClipboard();

    const paramdataRef = useRef({
        page: 1,
        pageSize: 10,
        total: 0,
        checked: false
    });
    const getStatus = (status: number) => {
        const code = status === null || status === undefined ? '' : String(status).trim()
           if (!code) return '--'
           if (["0","1"].includes(code)) {
               return t('recharge.credited')
           }
           if ([ "2"].includes(code)) {
               return t('recharge.pending')
           }
           return code || '--'
    }
    const columns: ColumnsType<RechargeDataType> = [
        {
            title: t('assetsAccount.coin'),
            dataIndex: "symbol",
            key: "symbol",
            width: 158,
            align: "left",
            render: (text) => {
                return <div>{text || '--'} </div>
            },
        },
        {
            title: t('assetsAccount.depositTime'),
            dataIndex: "timestamp",
            key: "timestamp",
            align: "center",
            width: 128,
            render: (text) => <div>{text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'} </div>,
        },
        {
            title: t('assetsAccount.depositAddress'),
            dataIndex: "address",
            key: "address",
            align: "center",
            width: 158,
            render: (_status) => {
                return <div className="flex-x align-center justify-center">
                <p className="max-w-[128px] overflow-hidden text-ellipsis whitespace-nowrap">{_status || '--'}</p> 
                 {_status && <Iconify
                    icon="mingcute:copy-2-line"
                    className="ml-1 cursor-pointer hover_theme"
                    size={18}
                    onClick={(e) => {
                        e.stopPropagation();
                        copyFn(_status);
                    }}
                />}
            </div>;

            },
        },
        {
            title: t('assetsAccount.txId'),
            key: "txHash",
            dataIndex: "txHash",
            width: 128,
            align: "center",
            render: (_txHash) => {
                return <div className="flex-x align-center justify-center">
                    <p className="max-w-[168px] overflow-hidden text-ellipsis whitespace-nowrap">{_txHash || '--'}</p> 
                     {_txHash && <Iconify
                        icon="mingcute:copy-2-line"
                        className="ml-1 cursor-pointer hover_theme"
                        size={18}
                        onClick={(e) => {
                            e.stopPropagation();
                            copyFn(_txHash);
                        }}
                    />}
                </div>;
            },
        },
        {
            title: t('assetsAccount.confirmations'),
            key: "requiredConfirmations",
            dataIndex: "requiredConfirmations",
            width: 128,
            align: "center",
            render: (_status) => {
                return <span >{_status || '--'}</span>;
            },
        },
        {
            title: t('assetsAccount.number'),
            key: "amount",
            dataIndex: "amount",
            width: 128,
            align: "center",
            render: (_status) => {
                return <span >{_status || '--'}</span>;
            },
        },
        {
            title: t('assetsAccount.status'),
            key: "status",
            dataIndex: "status",
            width: 128,
            align: "center",
            render: (_status) => {
                return <span >{getStatus(_status) || '--'}</span>;
            },
        },


    ];

    const getBillDetails = async () => {
        const pageParam = {
            pageNo: paramdataRef.current.page,
            pageSize: paramdataRef.current.pageSize,
            symbol: coinId && paramdataRef.current.checked ? coinId : null,
            billType: "RECHARGE",
        };
        setTableLoading(true);
        try {
            const res = await getOrderList(pageParam);
            if (res.code === "0") {
                setTableData(res.data.list);
                paramdataRef.current.total = res.data.count;

            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error(String(error));
        } finally {
            setTableLoading(false);
        }
    };
    const pageChange = async (page: number, pageSize: number) => {
        paramdataRef.current.page = page;
        paramdataRef.current.pageSize = pageSize;
    }
    const onlyShowChange: CheckboxProps['onChange'] = (e) => {

        if (e.target.checked) {
            if (coinId) {
                // setTableData(initTableData.filter((item) => item?.symbol == coinId))
                paramdataRef.current.checked = true // 确保选中状态更新
                getBillDetails()
            } else {
                // 如果没有有效的 coinId，则取消选中
                paramdataRef.current.checked = false
                // setTableData(initTableData)
                toast.error(t('withdrawTable.onlyShowError'))
                // getBillDetails()
            }
        } else {
            paramdataRef.current.checked = false
            // setTableData(initTableData)
            getBillDetails()
        }
    }
    // const initTableData=useMemo(()=>{
    //     return tableData
    // },[tableData])
    useEffect(() => {
        getBillDetails();
    }, []);
    return (<>
        <div className={`${styles.table_header} w-full my-4 flex align-center justify-between`}>
            <h5 className={`font-w-500 font-18`}>{t('assetsAccount.recentDepositRecords')}</h5>
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
                    router.push(ROUTER_KEY_SPOT.BILL)
                }}>
                    {t('withdrawTable.more')}
                    <Iconify icon="mingcute:right-line" size={26} />
                </button>
            </div>
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
                scroll={{ x: "max-content" }}
                className={` table-box`}
                pagination={{
                    position: ["bottomRight"],
                    showSizeChanger: true,
                    total: paramdataRef.current.total,
                    size: "default",
                    onChange: (page, pageSize) => pageChange(page, pageSize),
                    hideOnSinglePage: true
                }}
                loading={tableLoading}
                locale={{ emptyText: <NoData title={t('assetsAccount.nodata')} /> }}
            />
        </ConfigProvider>
    </>
    );
};


export default RechargeTable;