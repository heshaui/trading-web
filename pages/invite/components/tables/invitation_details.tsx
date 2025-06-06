// import { Button, Form, Input,Tabs } from "antd";
import { Layout } from 'antd';
// import { type CSSProperties, useState, useRef } from "react";
// import { toast } from "sonner";
// import store from "@/store";
import styles from "../../styles/invite.module.css"
import { Iconify } from "@/components/icon/index";
import { Table, ConfigProvider, Empty } from "antd";
// import Link from 'next/link'
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from "react";
import type { ColumnsType } from "antd/es/table";
// import { getUserSafeSettingLoginLogList, getUserLoginLogList } from "@/services/safeCenter";
import { toast } from "sonner";
import dayjs from 'dayjs';
import { encryptString } from "@/utils/encrypt";
import Image from 'next/image';
import { useThemeMode } from '@/hooks/useThemeMode';
import { getInviteList } from "@/services/invite";
import {NoData} from "@/components/noData";
import { useTranslation } from 'next-i18next';
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
type InviteProps = {
    onReturn: () => void;
}
function InvitationDetails({ onReturn }: InviteProps) {
    const router = useRouter();
    const { t } = useTranslation(['invite']);
    const [inviteData, setInviteData] = useState<DataType[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const { userId } = router.query;
    const [pageParam, setPageParam] = useState({
        page: 1,
        pageSize: 10
    })
    const paramdataRef = useRef(pageParam);
    const { isDayMode } = useThemeMode(); // 使用 hook


    const columns: ColumnsType<DataType> = [
        {
            title: t('invite.inviteDetail.userId'), //"好友ID",
            dataIndex: "userId",
            key: "userId",
            align: "left",
            width: 160,
            render: (text, record) => <span>{`${text}`} </span>,
        },
        {
            title: t('invite.inviteDetail.account'), //"注册账号",
            dataIndex: "account",
            key: "account",
            align: "center",
            width: 160,
            render: (_text) => <span>{_text ? encryptString(_text) : '--'}</span>,
        },
        {
            title: t('invite.inviteDetail.status'), //"邀请状态",
            key: "status",
            dataIndex: "status",
            align: "center",
            width: 160,
            render: (_text) => {
                return <span >{_text.toString() === '1' ? t('invite.inviteDetail.success') : t('invite.inviteDetail.fail')}</span>;
            },
        },
        {
            title: t('invite.inviteDetail.regeistTime'), //"注册日期",
            key: "regeistTime",
            dataIndex: "regeistTime",
            align: "right",
            width: 160,
            render: (_text) => {
                return <span>{_text ? dayjs(_text).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>;
            },
        },


    ];
    const getInviteData = async () => {
        setLoading(true)
        const param={
            pageNo:paramdataRef.current.page,
            pageSize:paramdataRef.current.pageSize,
        }
        try {

            const res = await getInviteList(param);
            if (res.code === '0') {
                setInviteData(res.data.list)
                setTotal(res.data.count)
            } else {
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
        // await getLoginData()
    }
    useEffect(() => {
        getInviteData()
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
                    dataSource={inviteData}
                    size="large"
                    // scroll={{ x: "max-content" }}
                    className={`${styles.table_box} table-box`}
                    pagination={{
                        position: ["bottomRight"],
                        showSizeChanger: true,
                        total: total,
                        size: "default",
                        onChange: (page, pageSize) => pageChange(page, pageSize),
                    }}
                    loading={loading}
                    locale={{
                        emptyText:
                         <div className='flex-y-cc'>
                            {/* <Image
                                src={isDayMode ? "/images/pubic_icon/iocn_nodata_day.png" : "/images/pubic_icon/iocn_nodata_night.png"}
                                alt="empty" width={100} height={100} />
                            <p className={`font-14 font-w-400 ${styles.tip_color}`}>暂无数据</p> */}
                            <NoData/>
                            <button type='submit' className={`default_btn w-full mt-10 ${styles.invite_btn}`}
                                onClick={onReturn}>
                                    {/* 立即邀请 */}
                                    {t('invite.inviteBtn')}
                                    </button>
                        </div>
                    }}
                />
            </ConfigProvider>
        </div>
    );
}

export default InvitationDetails;
