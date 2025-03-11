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
import { useState } from "react";
import IDV from "../components/Identity/idv";
import Upload from "../components/Identity/upload";
import Sumbit from "../components/Identity/sumbit";
function SafeLog() {
    const router = useRouter();
    const { userId, authStatus } = router.query;
    const [current, setCurrent] = useState(0);
    const items = [
        {
            title: '基本信息',
            content: <IDV onNext={()=>onNextSetup()}/>,

        },
        {
            title: '上传照片',
            content: <Upload onNext={()=>onNextSetup()} onPrev={()=>onPrevSetup()}/>,

        },
        {
            title: '已提交',
            content: <Sumbit />,

        },
    ]
    const onNextSetup = () => { 
        setCurrent(current + 1);
    }
    const onPrevSetup = () => {
        setCurrent(current - 1);
    }

    return (
        <div className={` page-h w-full page-box flex-y align-center`} >
            <div className={`${styles.identity_auth_box}`} style={{}}>
                <div className={`flex-row justify-between font-18 font-w-500`} >安全日志
                </div>
                <Breadcrumb items={[
                    {
                        title: <Link href="/userCenter/identity">安全中心</Link>,
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

export default SafeLog;
