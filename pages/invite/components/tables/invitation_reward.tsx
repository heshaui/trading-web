// import { Button, Form, Input,Tabs } from "antd";
import { Layout } from 'antd';
// import { type CSSProperties, useState, useRef } from "react";
// import { toast } from "sonner";
// import store from "@/store";
import styles from "../../styles/invite.module.css"
import { Iconify } from "@/components/icon/index";
import { Table, ConfigProvider ,Empty} from "antd";
// import Link from 'next/link'
import { useRouter } from 'next/router';
import { useState, useEffect ,useRef} from "react";
import type { ColumnsType } from "antd/es/table";
// import { getUserSafeSettingLoginLogList, getUserLoginLogList } from "@/services/safeCenter";
// import { toast } from "sonner";
import dayjs from 'dayjs';
import { encryptString } from "@/utils/encrypt";
import Image from 'next/image';
import { useThemeMode } from '@/hooks/useThemeMode';
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
function InvitationReward({onReturn}:InviteProps) {
    const router = useRouter();
    const [loginData, setLoginData] = useState<DataType[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const { isDayMode } = useThemeMode(); // 使用 hook
    const { userId } = router.query;
    const [pageParam, setPageParam] = useState({
        page: 1,
        pageSize: 10
    })
    const paramdataRef = useRef(pageParam);

    const columns: ColumnsType<DataType> = [
        {
            title: "发放时间",
            dataIndex: "time",
            key: "time",
            align: "left",
            render:(_text) => {
                return <span>{_text ? dayjs(_text).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>;
            },
        },
        {
            title: "注册账号",
            dataIndex: "account",
            key: "account",
            align: "center",
            render: (_text) => <span>{_text ? encryptString(_text) : '--'}</span>,
        },
        {
            title: "返佣金额",
            key: "reward",
            dataIndex: "reward",
            align: "center",
            render: (_text) => {
                return <span >{_text || '--'}</span>;
            },
        },
        {
            title: "USDT估值",
            key: "usdt",
            dataIndex: "usdt",
            align: "right",
            render: (_text) => {
                return <span>{_text || '--'}</span>;
            },
        },


    ];
    // const getLoginData = async () => {
    //     const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    //     const isuserId = userId ? userId?.toString() : ''
    //     setLoading(true)
    //     try {
 
    //     const res = await getUserSafeSettingLoginLogList({
    //         pageNo: paramdataRef.current.page,
    //         pageSize: paramdataRef.current.pageSize,
    //         userId: userInfo?.userId || isuserId || ''
    //     });
    //     if (res.code === '0') {
    //         setLoginData(res.data.list)
    //         setTotal(res.data.count)
    //     }else{
    //         toast.error(res.message)
    //     }
    //     } catch (error) {
    //        toast.error(String(error))
    //     } finally {
    //         setLoading(false)
    //     }
    // }
    const pageChange = async(page: number, pageSize: number) => {
        const pageData={
            page: page,
            pageSize: pageSize
        }
        setPageParam(pageData)
        paramdataRef.current = pageData;
        // await getLoginData()
    }
    // useEffect(() => {
    //     getLoginData()
    // }, [])
    return (
        <div className={``}>
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
                    },
                }}
            >
                <Table
                    columns={columns}
                    dataSource={loginData}
                    size="large"
                    scroll={{ x: "max-content" }}
                    className={` table-box`}
                    pagination={{
                        position: ["bottomRight"],
                        showSizeChanger: true,
                        total: total,
                        size: "default",
                        onChange: (page, pageSize) => pageChange(page, pageSize),
                    }}
                    // loading={loading}
                    locale={{ emptyText: <div className='flex-y-cc'>
                        <Image 
                        src={isDayMode?"/images/pubic_icon/iocn_nodata_day.png":"/images/pubic_icon/iocn_nodata_night.png"} 
                        alt="empty" width={100} height={100} />
                        <p className={`font-14 font-w-400 ${styles.tip_color}`}>暂无数据</p>
                        <button type='submit' className={`default_btn w-full mt-10 ${styles.invite_btn}`} 
                        onClick={onReturn}>立即邀请</button>
                    </div> }}
                />
            </ConfigProvider>
        </div>
    );
}

export default InvitationReward;
