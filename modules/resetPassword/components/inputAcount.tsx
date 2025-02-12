// import { Button, Form, Input,Tabs } from "antd";
import { Input, Button, AutoComplete } from 'antd';
import type { AutoCompleteProps } from 'antd';
import { type CSSProperties, useState, useRef } from "react";
import { useResetStateContext, ResetStateEnum } from "../providers/ResetStateProvider";
import { toast } from "sonner";
import store from "@/store";
import styles from "../style/reset.module.css"
import { emailSuffixes } from "@/utils/enum";
import { useRouter } from 'next/router';
function ResetPassword() {
    const router = useRouter();
    const { resetState, setResetState } = useResetStateContext();
    const [authCode, setAuthCode] = useState('');
    const [options, setOptions] = useState<AutoCompleteProps['options']>([]);
    // 当状态不为 INPUT 时不渲染组件
    if (resetState !== ResetStateEnum.INPUT) return null;

    // 定义粘贴功能的处理函数
    const handlePaste = async () => {
        try {
            // 使用 Clipboard API 读取剪贴板内容
            const clipboardData = await navigator.clipboard.readText();
            // 如果输入框引用存在，将剪贴板内容赋值给输入框的值
            // if (inputRef.current) {
            //     inputRef.current.input.value = clipboardData;
            // }
            if (clipboardData) {
                setAuthCode(clipboardData)
            }
        } catch (error) {
            // 捕获并打印可能出现的错误
            console.error('Err:', error);
        }
    };
const goBackPage=()=>{
    router.push('/login');
}
    const goNext = () => {
        setResetState(ResetStateEnum.SENTCODE)
    }
    const handleSearch = (value: string) => {
        setOptions(() => {
            if (!value || value.includes('@')) {
                return [];
            }
            return emailSuffixes.map((domain) => ({
                label: `${value}@${domain}`,
                value: `${value}@${domain}`,
            }));
        });
    };

    return (
        <div className="flex-col" style={{ height: "70vh", width: "100%" }}>
            <div className="mb-7  font-w-500" style={{ width: "300px" }}>手机号/邮箱</div>
            <div>
                {/* <Input
                    placeholder="Google验证码"
                   
                    className='authcode-input'
                    style={{ borderRadius: "8px" }}
                    // value={authCode}
                    allowClear
                /> */}
                <AutoComplete
                    // style={{ width: 200 }}
                    onSearch={handleSearch}
                    placeholder="请输入手机/邮箱"
                    options={options}
                    allowClear={true}
                    backfill={true}
                    className={`${styles.acount_input}`}
                />
                <div className='flex mt-10'>
                    <Button
                        className='goback-btn mr-4'
                        onClick={() => goBackPage()}>返回</Button>
                    <button type='button' className={`btn-color ${styles.next_btn} flex-1`} onClick={() => goNext()}>下一步</button>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
