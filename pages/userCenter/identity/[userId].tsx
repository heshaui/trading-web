// import { Button, Form, Input,Tabs } from "antd";
import { Layout } from 'antd';
// import { type CSSProperties, useState, useRef } from "react";
// import { toast } from "sonner";
// import store from "@/store";
import styles from "../styles/identityAuth.module.css"
// import { Iconify } from "@/components/icon/index";
import { Breadcrumb, ConfigProvider, Steps } from "antd";
import Link from 'next/link'
import { useRouter } from 'next/router';
import { useState,useEffect } from "react";
import IDV from "../components/Identity/idv";
import Upload from "../components/Identity/upload";
import Sumbit from "../components/Identity/sumbit";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
interface eventType{
    surname:string;
    firstName:string;
    countryId:string;
    cardType:string;
    cardCode:string;
    birthday:string;
}
function RealName() {
    const [userInfo,setUserInfo] = useState<eventType>({} as eventType);
    const router = useRouter();
    const { userId, authStatus } = router.query;
    // const parsedAuthStatus = typeof authStatus === 'string' && !isNaN(Number(authStatus)) ? Number(authStatus) : undefined;
    const [current, setCurrent] = useState(0);
    const { t } = useTranslation(['userCenter']);
    const items = [
        {
            title: t('identity.realName.setUPTitle1'),//基本信息
            content: <IDV onNext={(event:eventType)=>handleNext(event)}/>,

        },
        {
            title: t('identity.realName.setUPTitle2'),//上传照片
            content: <Upload 
            onNext={()=>onNextSetup()}
             onPrev={()=>onPrevSetup()}
             userInfo={userInfo}
             />,

        },
        {
            title: t('identity.realName.setUPTitle3'),//已提交
            content: <Sumbit />,

        },
    ]
    const handleNext = (event:eventType) => {
        setUserInfo(event)
        onNextSetup()
    }
    const onNextSetup = () => {
        setCurrent(current + 1);
    }
    const onPrevSetup = () => {
        setCurrent(current - 1);
    }
    useEffect(() => {
        // 处理 localStorage 变化的函数
        const handleStorageChange = () => {
            const { authStatus } = router.query;
            const authStatu = localStorage.getItem('identity_authStatus') || authStatus
            
            if (authStatu === '3'||authStatu === '1') {
                setCurrent(2);
            } else {
                setCurrent(0);
            }
        };
        
        // 初始执行一次
        handleStorageChange();
        
        // 添加事件监听器
        window.addEventListener('storage', handleStorageChange);
        
        // 清理函数
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return (
        <div className={` page-h w-full page-box flex-y align-center`} >
            <div className={`${styles.identity_auth_box}`} >

                <Breadcrumb items={[
                    {
                        title: <Link href="/userCenter/identity" ><span className={`${styles.tip_color}`}>{t('identity.title')}</span> </Link>,
                    },
                    {
                        title: <span className={`${styles.title_color}`}>{t('identity.realName.title')}</span>,
                    },
                ]} 
                style={{ fontSize: 14 }} 
                separator={<span className={`${styles.tip_color}`}>/</span>}
                />

                <div className={`${styles.identity_content_box} flex-y-cc`}>
                    <div className={`${styles.content_steps_box} flex-y-cc`}>
                        <ConfigProvider
                            theme={{
                                components: {
                                    Steps: {
                                        // navArrowColor: "var(--text-color6)",
                                    },
                                },
                                token: {
                                    // colorPrimary:"pink",
                                    colorTextQuaternary: 'var(--theme-color)',
                                },
                            }}>
                            <Steps current={current}
                                labelPlacement="vertical"
                                items={items} 
                                className='custom-steps2'/>
                        </ConfigProvider>
                        {/* <div style={{ width: '100%', marginTop: 50 }}> */}
                            {items[current].content}
                        {/* </div> */}
                    </div>
                </div>
            </div>
        </div>

    );
}

// 添加 getStaticPaths
export const getStaticPaths = async () => {
    return {
        // 设置为 fallback: 'blocking' 表示如果路径不存在，将在服务器端进行渲染
        paths: [],
        fallback: 'blocking'
    };
};

// 修改 getStaticProps，添加 params 参数
export const getStaticProps: GetStaticProps = async ({ locale, params }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale || 'en', ['userCenter', 'common'])),
        },
    };
};

export default RealName;
