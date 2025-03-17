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
interface eventType{
    surname:string;
    firstName:string;
    countryId:string;
    cardType:string;
    cardCode:string;
    birthday:string;
}
function ResetPassword() {
    const [userInfo,setUserInfo] = useState<eventType>({} as eventType);
    const router = useRouter();
    const { userId, authStatus } = router.query;
    const parsedAuthStatus = typeof authStatus === 'string' && !isNaN(Number(authStatus)) ? Number(authStatus) : undefined;
    const [current, setCurrent] = useState(0);
    const items = [
        {
            title: '基本信息',
            content: <IDV onNext={(event:eventType)=>handleNext(event)}/>,

        },
        {
            title: '上传照片',
            content: <Upload 
            onNext={()=>onNextSetup()}
             onPrev={()=>onPrevSetup()}
             userInfo={userInfo}
             />,

        },
        {
            title: '已提交',
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
            const authStatus = localStorage.getItem('identity_authStatus');
            if (authStatus === '3') {
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
            <div className={`${styles.identity_auth_box}`} style={{}}>

                <Breadcrumb items={[
                    {
                        title: <Link href="/userCenter/identity">身份认证</Link>,
                    },
                    {
                        title: '认证信息',
                    },
                ]} style={{ fontSize: 14 }} />

                <div className={`${styles.identity_content_box} flex-y-cc`}>
                    <div className={`${styles.content_steps_box} flex-y-cc`}>
                        <ConfigProvider
                            theme={{
                                components: {
                                    Steps: {
                                        /* 这里是你的组件 token */
                                    },
                                },
                                token: {
                                    // colorPrimary:"pink",
                                    colorTextQuaternary: '#FF5F1F',
                                },
                            }}>
                            <Steps current={current}
                                labelPlacement="vertical"
                                items={items} />
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

export default ResetPassword;
