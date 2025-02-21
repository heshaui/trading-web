// import { Button, Form, Input,Tabs } from "antd";
import { Input, AutoComplete, Form, Segmented } from 'antd';
import type { AutoCompleteProps } from 'antd';
import {  useState } from "react";
import { useResetStateContext, ResetStateEnum } from "../providers/ResetStateProvider";
// import { toast } from "sonner";
// import store from "@/store";
import styles from "../style/reset.module.css"
import { emailSuffixes } from "@/utils/enum";
import { useRouter } from 'next/router';
import PhoneCodeSelector from "@/components/PhoneCodeSelector"

interface acountType {
	type: string;
	acount: string;
	areaCode?: string
}
function ResetPassword() {
    const router = useRouter();
    const [form] = Form.useForm();
    const { resetState, setResetState, setAcount } = useResetStateContext();
    // const [authCode, setAuthCode] = useState('');
    const [options, setOptions] = useState<AutoCompleteProps['options']>([]);
    const [tabsProps, setTabsProps] = useState('email');
    // 当状态不为 INPUT 时不渲染组件
    if (resetState !== ResetStateEnum.INPUT) return null;

    // 定义粘贴功能的处理函数
    // const handlePaste = async () => {
    //     try {
    //         // 使用 Clipboard API 读取剪贴板内容
    //         const clipboardData = await navigator.clipboard.readText();
    //         // 如果输入框引用存在，将剪贴板内容赋值给输入框的值
    //         // if (inputRef.current) {
    //         //     inputRef.current.input.value = clipboardData;
    //         // }
    //         if (clipboardData) {
    //             setAuthCode(clipboardData)
    //         }
    //     } catch (error) {
    //         // 捕获并打印可能出现的错误
    //         console.error('Err:', error);
    //     }
    // };
    const goBackPage = () => {
        router.push('/login');
    }
    const goNext = () => {
        form
            .validateFields()
            .then(async (values) => {
                console.log(values);
                let data:acountType={
                    type:"",
                    acount:""
                }
                if (tabsProps === 'email') {
                     data = {
                        type: 'm',
                        acount: values.acount,
                    }
                } else if (tabsProps === 'phone') {
                     data = {
                        type: 'p',
                        acount: values.acountNumber,
                        areaCode: values.areaCode
                    }
                    
                }

                setAcount(data)
                setResetState(ResetStateEnum.SENTCODE)

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
    // // 自定义校验函数
    // const validateAcount = (_: any, value: any) => {
    //     // 若输入为空，直接通过校验
    //     if (!value) {
    //         return Promise.resolve();
    //     }
    //     // 邮箱和手机号的正则表达式
    //     const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    //     const phoneRegex = /^\d{4,15}$/;
    //     // 先校验是否为邮箱
    //     if (emailRegex.test(value)) {
    //         return Promise.resolve();
    //     }
    //     // 若不是邮箱，再校验是否为手机号
    //     if (phoneRegex.test(value)) {
    //         return Promise.resolve();
    //     }
    //     // 既不是邮箱也不是手机号，校验失败
    //     return Promise.reject(new Error('请输入有效的邮箱或手机号！'));
    // };
    const tabsChange = (value: string) => {
        console.log(value);
        setTabsProps(value)
    };

    return (<>
        <Segmented
            className={`${styles.custom_segmented} custom-segmented`}
            options={[
                {
                    label: (
                        //  button-color
                        <div className={`${styles.tabs_label}`} >
                            <div>邮箱</div>
                        </div>

                    ),
                    value: 'email',
                },
                {
                    label: (
                        <div className={`${styles.tabs_label}`} >
                            <div>手机</div>
                        </div>

                    ),
                    value: 'phone',
                },

            ]}
            onChange={tabsChange}
            value={tabsProps}
        />

        <div className="flex-col mt-10" style={{ height: "70vh", width: "100%" }}>
            {/* <div className="mb-7  font-w-500" style={{ width: "300px" }}>手机号/邮箱</div> */}
            <Form
                name="aount"
                form={form}
                initialValues={{ areaCode: "+1" }}
            >
                {tabsProps === 'email' && (<Form.Item name="acount" rules={[{ required: true, message: "请输入邮箱！" }
                    //  { validator: validateAcount }
                ]}
                >
                    <AutoComplete
                        onSearch={handleSearch}
                        // placeholder="请输入手机/邮箱"
                        placeholder="请输入邮箱"
                        options={options}
                        allowClear={true}
                        backfill={true}
                        className={`${styles.acount_input} autoComplete-custom`}
                    // onChange={getValue}
                    />

                </Form.Item>)}
                {tabsProps === 'phone' && (
                    <Form.Item >
                        <div className={`flex ${styles.acount_input}`}>
                            <PhoneCodeSelector />
                            <Form.Item noStyle name="acountNumber" rules={[{ required: true, message: "手机号不能为空！" }]}>
                                <Input placeholder="请输入手机号" allowClear={true} className={` ml-2 custom-input`} />
                            </Form.Item>
                        </div>
                    </Form.Item>
                )}
            </Form>
            <div className='flex mt-6'>
                <button
                    className={`${styles.goBack_btn} mr-4`}
                    onClick={() => goBackPage()}>返回</button>
                <button type='submit' className={`btn-color ${styles.next_btn} flex-1`} onClick={goNext}>下一步</button>
            </div>

        </div>
    </>

    );
}

export default ResetPassword;
