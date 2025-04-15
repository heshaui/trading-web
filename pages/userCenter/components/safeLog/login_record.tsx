// import { Button, Form, Input,Tabs } from "antd";
import { Layout } from 'antd';
// import { type CSSProperties, useState, useRef } from "react";
// import { toast } from "sonner";
// import store from "@/store";
import styles from "../../styles/safeCenter.module.css"
import { Iconify } from "@/components/icon/index";
import { Table, ConfigProvider } from "antd";
// import Link from 'next/link'
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from "react";
import type { ColumnsType } from "antd/es/table";
import { getUserDeviceNoList, getUserLoginLogList } from "@/services/safeCenter";
import { toast } from "sonner";
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { LOCAL_STORAGE_KEY } from "@/config/apiConfig";
interface DataType {
    id: number,
    userId: number,
    platformType: number,
    deviceNo: string,
    ip: string,
    address: string,
    token: string,
    tokenTime: string,
    createTime: number,
    updateTime: number,
    tenantId: string,
}
function LoginRecord() {
    const router = useRouter();
    const { t } = useTranslation(['userCenter']);
    const [loginData, setLoginData] = useState<DataType[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    const { userId } = router.query;
    const [pageParam, setPageParam] = useState({
        page: 1,
        pageSize: 10
    })
    const paramdataRef = useRef(pageParam);


    const columns: ColumnsType<DataType> = [
        {
            title: t('security.loginRecord.type'), //"类型",
            dataIndex: "platformType",
            key: "platformType",
            width: 158,
            align: "left",
            render: (text, record) => <div>{`${text}`} </div>,
        },
        {
            title: t('security.loginRecord.time'), //"时间",
            dataIndex: "createTime",
            key: "createTime",
            align: "center",
            width: 128,
            render: (_text) => <span>{_text ? dayjs(_text).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>,
        },
        {
            title: t('security.loginRecord.status'), //"状态",
            dataIndex: "status",
            key: "status",
            align: "center",
            width: 158,
            render: (_status) => {
                return <span >{_status ? _status == '1' ? t('security.loginRecord.loginSuccess') : t('security.loginRecord.loginFailed') : '--'}</span>;
            },
        },
        {
            title: "IP",
            key: "ip",
            dataIndex: "ip",
            width: 128,
            align: "center",
            render: (_ip) => {
                return <span >{_ip || '--'}</span>;
            },
        },
        {
            title: t('security.loginRecord.address'), //"登录所在地",
            key: "address",
            dataIndex: "address",
            width: 128,
            align: "center",
            render: (_status) => {
                return <span >{_status || '--'}</span>;
            },
        },


    ];

    const getLoginData = async () => {
        const userInfo = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY.USER_INFO) || '{}')
        const isuserId = userId ? userId?.toString() : ''
        setLoading(true)
        try {

            const res = await getUserLoginLogList({
                pageNo: paramdataRef.current.page,
                pageSize: paramdataRef.current.pageSize,
                userId: userInfo?.userId || isuserId || ''
            });
            if (res.code === '0') {
                setLoginData(res.data.list)
                setTotal(res.data.count)
            }else{
                toast.error(res.message)
            }

        } catch (error) {
            toast.error(String(error))
        } finally {
            setLoading(false)
        }
    }
    const pageChange = async (page: number, pageSize: number) => {
        const pageData = {
            page: page,
            pageSize: pageSize
        }
        setPageParam(pageData)
        paramdataRef.current = pageData;
        await getLoginData()
    }
    useEffect(() => {
        getLoginData()
    }, [])
    return (
        <div className={`${styles.table_box}`}>
            <ConfigProvider
                theme={{
                    components: {
                        Table: {
                            // bodySortBg: "pink",
                            headerBg: "var(--background)",
                            headerColor: "var(--text-color6)",
                            headerSplitColor: "transparent", // 表头分割线颜色
                            rowExpandedBg: "var(--background10)", // 表格行展开背景色
                            borderColor: "transparent",
                            headerBorderRadius:0, // 表头圆角
                        },
                        Pagination: {
                            itemActiveBg: "transparent",
                            itemBg: "transparent",
                        },
                        Select: {
                            activeBorderColor:"var(--border-color4)",
                            optionActiveBg:"transparent",
                            selectorBg:"transparent", //选框背景色
                        }
                    },
                }}
            >
                <Table
                    columns={columns}
                    dataSource={loginData}
                    size="large"
                    scroll={{ x: "max-content" }}
                    className={`${styles.table_box} table-box`}
                    pagination={{
                        position: ["bottomRight"],
                        showSizeChanger: true,
                        total: total,
                        size: "default",
                        onChange: (page, pageSize) => pageChange(page, pageSize),
                    }}
                    loading={loading}
                />
            </ConfigProvider>
        </div>
    );
}

export default LoginRecord;
