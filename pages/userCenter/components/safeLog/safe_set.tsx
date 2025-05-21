// import { Button, Form, Input,Tabs } from "antd";
import { Layout } from 'antd';
// import { type CSSProperties, useState, useRef } from "react";
// import { toast } from "sonner";
// import store from "@/store";
import styles from "../../styles/safeCenter.module.css"
import { Iconify } from "@/components/icon/index";
import { Table, ConfigProvider ,Empty} from "antd";
// import Link from 'next/link'
import { useRouter } from 'next/router';
import { useState, useEffect ,useRef} from "react";
import type { ColumnsType } from "antd/es/table";
import { getUserSafeSettingLoginLogList, getUserLoginLogList } from "@/services/safeCenter";
import { toast } from "sonner";
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { LOCAL_STORAGE_KEY } from "@/config/apiConfig";
import appStore from "@/store";
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
    const { t } = useTranslation(['userCenter']);
    const router = useRouter();
    const [loginData, setLoginData] = useState<DataType[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const { userId } = router.query;
    const [pageParam, setPageParam] = useState({
        page: 1,
        pageSize: 10
    })
    const paramdataRef = useRef(pageParam);
    const langKey = appStore.getLang();
    const columns: ColumnsType<DataType> = [
        {
            title: t('security.safeSet.type'), //"类型",
            dataIndex: "platformType",
            key: "platformType",
            // width: 120,
            align: "left",
            render: (text, record) => <span>{text||'--'} </span>,
        },
        {
            title: t('security.safeSet.time'), //"时间",
            dataIndex: "createTime",
            key: "createTime",
            align: "center",
            // width: 328,
            render: (_text) => <span>{_text ? dayjs(_text).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>,
        },
        {
            title: "IP",
            key: "ip",
            dataIndex: "ip",
            // width: 128,
            align: "center",
            render: (_ip) => {
                return <span >{_ip || '--'}</span>;
            },
        },
        {
            title: t('security.safeSet.operation'), //"操作",
            key: "settingType",
            dataIndex: "settingType",
            // width: 128,
            align: "center",
            render: (_status) => {
                if (_status === "retrieve_password") {
                    return <span >{t('security.findPassword')}</span>;
                }else if(_status === "relieve_google") {
                    return <span >{t('security.unbindGoogle2')}</span>;
                }else if(_status === "bind_google") {
                    return <span >{t('security.bindGoogle2')}</span>;
                }else if(_status === "update_pwd") {
                    return <span >{t('security.modifyPassword')}</span>;
                }else if(_status === "identity_verification") {
                    return <span >{t('security.identityAuth')}</span>;
                }else if(_status === "phoneVerify") {
                    return <span >{t('security.closePhone')}</span>;
                }else if(_status === "bind_phone") {
                    return <span >{t('security.bindPhone')}</span>;
                }else if(_status === "bind_email") {
                    return <span >{t('security.bindEmail')}</span>;
                } else {
                    return <span >{_status||'--'}</span>;
                }
            },
        },


    ];
    const getLoginData = async () => {
        const userInfo = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY.USER_INFO) || '{}')
        const isuserId = userId ? userId?.toString() : ''
        setLoading(true)
        try {
 
        const res = await getUserSafeSettingLoginLogList({
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
    const pageChange = async(page: number, pageSize: number) => {
        const pageData={
            page: page,
            pageSize: pageSize
        }
        setPageParam(pageData)
        paramdataRef.current = pageData;
        await getLoginData()
    }
    useEffect(() => {
        getLoginData()
    }, [langKey])
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
                    locale={{ emptyText: <Empty description={<span className={styles.tip_color}>
                        {t('security.safeSet.nodata')}
                        </span>} /> }}
                />
            </ConfigProvider>
        </div>
    );
}

export default LoginRecord;
