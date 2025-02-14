// import { Button, Form, Input,Tabs } from "antd";
import { Input, Button, AutoComplete, Form } from 'antd';
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
    const [form] = Form.useForm();
    const { resetState, setResetState, acount, setAcount } = useResetStateContext();
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
    const goBackPage = () => {
        router.push('/login');
    }
    const goNext = () => {
        form
            .validateFields()
            .then(async (values) => {
                console.log(values);
                if (values.acount) {
                    console.log(111);
                    
                    setAcount(values.acount)
                    setResetState(ResetStateEnum.SENTCODE)
                }
            })
            .catch((info) => {
                console.log("Validate Failed:", info);
            });

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
    // const getValue = (value: string) => {
    //     setAcount(value)
    // }

    return (
        <div className="flex-col" style={{ height: "70vh", width: "100%" }}>
            <div className="mb-7  font-w-500" style={{ width: "300px" }}>手机号/邮箱</div>
            <Form
                name="aount"
                form={form}
            >
                <Form.Item name="acount" rules={[{ required: true, message: "请输入手机号/邮箱！" }]}>
                    <AutoComplete
                        // style={{ width: 200 }}
                        onSearch={handleSearch}
                        placeholder="请输入手机/邮箱"
                        options={options}
                        allowClear={true}
                        backfill={true}
                        className={`${styles.acount_input}`}
                        // onChange={getValue}
                    />

                </Form.Item>
            </Form>
            <div className='flex mt-10'>
                <Button
                    className={`${styles.goBack_btn} mr-4`}
                    onClick={() => goBackPage()}>返回</Button>
                <button type='submit' className={`btn-color ${styles.next_btn} flex-1`} onClick={goNext}>下一步</button>
            </div>

        </div>
    );
}

export default ResetPassword;
