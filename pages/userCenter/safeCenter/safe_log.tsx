import styles from "../styles/safeCenter.module.css"
// import { Iconify } from "@/components/icon/index";
import { ConfigProvider, Tabs } from "antd";
// import Link from 'next/link'
import { useRouter } from 'next/router';
import { useState, useEffect } from "react";
// import type { ColumnsType } from "antd/es/table";
// import { getUserDeviceNoList, delectUserDeviceNo } from "@/services/safeCenter";
// import { toast } from "sonner";
// import dayjs from 'dayjs';
import LoginRecord from "../components/safeLog/login_record";
import SafeSet from "../components/safeLog/safe_set";
import type { TabsProps } from 'antd';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
function SafeLog() {
    const router = useRouter();
    const items: TabsProps['items'] = [
        {
            key: '1',
            label: '登录记录',
            children: <LoginRecord />,
        },
        {
            key: '2',
            label: '安全设置记录',
            children: <SafeSet />,
        },
    ];
    useEffect(() => {

    }, [])
    return (
        <div className={` page-h w-full page-box flex-y align-center`} >
            <div className={`${styles.identity_auth_box}`} >
                <h2 className={`flex-row justify-between font-18 font-w-500`} >安全日志
                </h2>
                <div className={`${styles.content_table_box} mt-3 flex-y align-center`}>
                    <div className={`${styles.table_box_inner}`}>
                    <ConfigProvider
                        theme={{
                            components: {
                                Tabs: {
                                    horizontalMargin:"0 0 0 0",
                                    itemColor:"var(--text-color5)",
                                },
                            },
                        }}>
                        <Tabs items={items} className="custom-tabs"/>
                    </ConfigProvider>
                    </div>
                </div>
            </div>
        </div>
    );
}
export const getStaticProps: GetStaticProps = async ({ locale }) => {
	return {
		props: {
			...(await serverSideTranslations(locale || 'en', ['userCenter','common'])),
		},
	};
};
export default SafeLog;
