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
import { toast } from "sonner";
import dayjs from 'dayjs';
import { encryptString } from "@/utils/encrypt";
import Image from 'next/image';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useTranslation } from 'next-i18next';
import { getRecordList } from '@/services/invite';
import appStore from '@/store';
import { getRate, getCoinRate ,getRound} from '@/utils/getUseRate';

interface DataType {
    createTime: number,
    actualRebateAmount: number,
    actualCoinId: number,
    actualCoinName: string,
    status: number,
    account: string
}
type InviteProps = {
    onReturn: () => void;
}
function InvitationReward({onReturn}:InviteProps) {
    const router = useRouter();
    const { t } = useTranslation(['invite']);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const { isDayMode } = useThemeMode(); // 使用 hook
    const { userId } = router.query;
    const rateKey = appStore.getRateKey()?.replace(/\s+/g, ''); // 汇率key
    const pageParam = useRef({
        page: 1,
        pageSize: 10,
        total: 0
    })
    // const paramdataRef = useRef(pageParam);

    const columns: ColumnsType<DataType> = [
        {
            title: t('invite.inviteRewards.time'), //"发放时间",
            dataIndex: "createTime",
            key: "createTime",
            align: "left",
            render: (_text) => {
                return <span>{_text ? dayjs(_text).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>;
            },
        },
        {
            title: t('invite.inviteRewards.account'), //"注册账号",
            dataIndex: "account",
            key: "account",
            align: "center",
            render: (_text) => <span>{_text ? encryptString(_text) : '--'}</span>,
        },
        {
            title: t('invite.inviteRewards.reward'), //"返佣金额",
            key: "actualRebateAmount",
            dataIndex: "actualRebateAmount",
            align: "center",
            render: (_text,record) => {
                // actualCoinName
                return <span >{_text?`${_text} ${record.actualCoinName}` : '--'}</span>;
            },
        },
        {
            title: t('invite.inviteRewards.usdt'), //"USDT估值",
            key: "actualRebateAmount",
            dataIndex: "actualRebateAmount",
            align: "right",
            render: (_text, record) => {
                const {coinRate} = getCoinRate(record.actualCoinName, _text);
                return <span>{_text?`${coinRate}`:'0'}</span>;
            },
        },


    ];
   const [recordList, setRecordList] = useState<DataType[]>([]);
    const pageChange = async(page: number, pageSize: number) => {
        pageParam.current.page = page
        pageParam.current.pageSize = pageSize
        // await getLoginData()
    }
    const getRecordData = async () => {
        setLoading(true)
        try {
            const res = await getRecordList({});
            if (res.code === '0') {
                setRecordList(res.data.list)
                pageParam.current.total = res.data.count
            } else {
                toast.error(res.message)
            }
        } catch (error) {
            toast.error(String(error))
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        getRecordData()
    }, [rateKey])
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
                    dataSource={recordList}
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
                    loading={loading}
                    locale={{ emptyText: <div className='flex-y-cc'>
                        <Image 
                        src={isDayMode?"/images/pubic_icon/iocn_nodata_day.png":"/images/pubic_icon/iocn_nodata_night.png"} 
                        alt="empty" width={100} height={100} />
                        <p className={`font-14 font-w-400 ${styles.tip_color}`}>{t('invite.inviteRewards.noData')}</p>
                        <button type='submit' className={`default_btn w-full mt-10 ${styles.invite_btn}`} 
                        onClick={onReturn}>{t('invite.inviteRewards.inviteBtn')}</button>
                    </div> }}
                />
            </ConfigProvider>
        </div>
    );
}

export default InvitationReward;
