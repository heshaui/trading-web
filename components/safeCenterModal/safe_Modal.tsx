import { Modal, ConfigProvider, Form, Input } from "antd";
// import { type CSSProperties, useState, useEffect } from "react";;
import type { ModalProps } from "antd/es/modal/interface";
// import { Iconify } from "@/components/icon/index";
// import store from "@/store"
// import { useRouter } from 'next/router';
import styles from "./styles/setPhone.module.css";
// import Image from 'next/image'
// import { Iconify } from "@/components/icon/index";
// import PhoneCodeSelector from "@/components/PhoneCodeSelector"
import { useState } from "react";
import {
    getSmsCode,
    getEmailCode,
    getEmailSafe,
    getPhoneSafe,
    setPasswordSafe,
    getPasswordSmsCode,
    getPasswordEmailCode
} from '@/services/safeCenter'
import { toast } from "sonner";
import { encryptData, encryptEmail, encryptPhoneNumber } from "@/utils/encrypt";
interface acountType {
    countryCode?: string;
    email?: string;
    phone?: string;
    googleCode?: string;
    type?: string;
}
interface SafeDataType {
    phone?: string;
    email?: string;
    countryCode?: string;
    googleCode?: boolean;
    password?: boolean;
    deviceNos?: string;
    recentIp?: string;
    userId?: string;
    type?: string;
}
type Props = {
    open: boolean;
    // onOk?: (event: boolean) => void;
    onOk: (type: string) => void;
    onCancel: () => void;
    type: string;
    acountInfo: acountType|SafeDataType;
};

function CloseModal({ open, onCancel, type, onOk, acountInfo }: Props) {
    // const router = useRouter();
    const [isCounting, setIsCounting] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [firstCheck, setFirstCheck] = useState(true);
    const [loading, setLoading] = useState(false); // 按钮loading
    const [codeLoading, setCodeLoading] = useState(false); // 验证码loading
    const [codeInputValue, setCodeInputValue] = useState('');
    const [form] = Form.useForm();

    const handCancel = () => {
        form.resetFields();
        setFirstCheck(true)
        onCancel()
    };

    const handOk = async () => {
        // onOk(type)
        // 0:修改手机号 1:关闭手机验证 2:修改邮箱 3:修改密码 4:关闭谷歌验证
        form.validateFields()
            .then(async (values) => {
                // console.log(values);
                // setLoading(true)
                if (type === '0') {
                    const dataInfo = {
                        phone: acountInfo?.phone,
                        code: values.code,
                        googleCode: values.googleCode
                    }
                    checkPhoneSafe(dataInfo)
                } else if (type === '1') {
                    const dataInfo = {
                        phone: acountInfo?.phone,
                        code: values.code,
                        googleCode: values.googleCode
                    }
                    checkPhoneSafe(dataInfo)
                } else if (type === '2') {
                    const dataInfo = {
                        email: acountInfo?.email,
                        code: values.code,
                        googleCode: values.googleCode
                    }
                    checkEmailSafe(dataInfo)
                } else if (type === '3') {
                    // onOk(type)
                    // handCancel()
                    if (acountInfo.type === 'email') {
                        const dataInfo = {
                            email: acountInfo?.email,
                            code: values.code,
                            googleCode: values.googleCode
                        }
                        checkPasswordSafe(dataInfo)

                    } else if (acountInfo.type === 'phone') {
                        const dataInfo = {
                            phone: acountInfo?.phone,
                            code: values.code,
                            googleCode: values.googleCode
                        }
                        checkPasswordSafe(dataInfo)

                    }
                }

            })

    };
    const checkEmailSafe = async (data: acountType) => {
        try {
            const dataEncrypt = await encryptData(data)
            const res = await getEmailSafe(dataEncrypt)
            if (res.code === "0") {
                // toast.success(res.message)
                onOk(type)
                handCancel()
            } else {
                toast.error(res.message)
            }
            setLoading(false)
        } catch (error) {
            setLoading(false)
            toast.error(String(error))
        }
    }
    const checkPhoneSafe = async (data: acountType) => {
        try {
            const dataEncrypt = await encryptData(data)
            const res = await getPhoneSafe(dataEncrypt)
            if (res.code === "0") {
                // toast.success(res.message)
                onOk(type)
                handCancel()
            } else {
                toast.error(res.message)
            }
            setLoading(false)

        } catch (error) {
            setLoading(false)
            toast.error(String(error))
        }
    }
    const checkPasswordSafe = async (data: acountType) => {
        try {
            const dataEncrypt = await encryptData(data)
            const res = await setPasswordSafe(dataEncrypt)
            if (res.code === "0") {
                onOk(type)
                handCancel()
            } else {
                toast.error(res.message)
            }
            setLoading(false)

        } catch (error) {
            setLoading(false)
            toast.error(String(error))
        }
    }
    const getPhoneCode = async () => {
        if (isCounting || loading || codeLoading) return
        setCodeLoading(true)
        try {
            const dataInfo = {
                number: acountInfo?.phone,
                code: acountInfo?.countryCode,
                deviceType: "web"
            };
            const dataEncrypt = await encryptData(dataInfo)
            const res = await getSmsCode(dataEncrypt);
            if (res.code === "0") {
                setFirstCheck(false)
                toast.success(res.message)
                startCountdown();
            } else if (res.code === "10044") {
                toast.error('验证码还在有效期内')
            } else {
                toast.error(res.message)
            }
            setCodeLoading(false)

        } catch (error) {
            setCodeLoading(false)
            toast.error(String(error))
            console.error('获取验证码出错:', error);

        }
    };
    const getMailCode = async () => {
        if (isCounting || loading || codeLoading) return
        setCodeLoading(true)
        try {
            const dataInfo = {
                number: acountInfo?.email,
                deviceType: "web",
            };
            const dataEncrypt = await encryptData(dataInfo)
            const res = await getEmailCode(dataEncrypt);
            if (res.code === "0") {
                setFirstCheck(false)
                toast.success(res.message)
                startCountdown();
            } else if (res.code === "10044") {
                toast.error('验证码还在有效期内')
            } else {
                toast.error(res.message)
            }
            setCodeLoading(false)

        } catch (error) {
            setCodeLoading(false)
            toast.error(String(error))
            console.error('获取验证码出错:', error);

        }
    };
    const startCountdown = () => {
        setCountdown(60);
        setIsCounting(true);
        const timer = setInterval(() => {
            setCountdown((prevCountdown) => {
                if (prevCountdown === 1) {
                    clearInterval(timer);
                    setIsCounting(false);
                    return 0;
                }
                return prevCountdown - 1;
            });
        }, 1000);
        // 清理定时器
        return () => clearInterval(timer);
    };
    const getLockPhoneCode = async () => {
        if (isCounting || loading || codeLoading) return
        setCodeLoading(true)
        try {
            const dataInfo = {
                number: acountInfo?.phone,
                code: acountInfo?.countryCode?.replace('+', ''),
                deviceType: "web"
            };
            const dataEncrypt = await encryptData(dataInfo)
            const res = await getPasswordSmsCode(dataEncrypt);
            if (res.code === "0") {
                setFirstCheck(false)
                toast.success(res.message)
                startCountdown();
            } else if (res.code === "10044") {
                toast.error('验证码还在有效期内')
            } else {
                toast.error(res.message)
            }
            setCodeLoading(false)

        } catch (error) {
            setCodeLoading(false)
            toast.error(String(error))
            console.error('获取验证码出错:', error);

        }
    };
    const getLockEmailCode = async () => {
        if (isCounting || loading || codeLoading) return
        setCodeLoading(true)
        try {
            const dataInfo = {
                number: acountInfo?.email,
                deviceType: "web"
            };
            const dataEncrypt = await encryptData(dataInfo)
            const res = await getPasswordEmailCode(dataEncrypt);
            if (res.code === "0") {
                setFirstCheck(false)
                toast.success(res.message)
                startCountdown();
            } else if (res.code === "10044") {
                toast.error('验证码还在有效期内')
            } else {
                toast.error(res.message)
            }
            setCodeLoading(false)

        } catch (error) {
            setCodeLoading(false)
            toast.error(String(error))
            console.error('获取验证码出错:', error);

        }
    };
    const getCode = async () => {
        if (['1', '0'].includes(type)) {
            await getPhoneCode();
        } else if (type === '2') {
            await getMailCode();
        } else if (type === '3' && acountInfo.type === 'email') {
            await getLockEmailCode();
        } else if (type === '3' && acountInfo.type === 'phone') {
            await getLockPhoneCode();
        }
    }
    const handlePaste = async () => {
        try {
            // 获取剪贴板中的文本内容
            const clipboardText = await navigator.clipboard.readText();
            // 将剪贴板内容设置到表单的 googleCode 字段中
            form.setFieldsValue({
                googleCode: clipboardText,
            });
        } catch (error) {
            console.error('Failed to read clipboard:', error);
        }
    }
        // 过滤输入，只允许数字和字母
        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const { value } = e.target;
            // 只保留数字和字母
            const filteredValue = value.replace(/[^0-9]/g, '');
            setCodeInputValue(filteredValue);
            form.setFieldsValue({ code: filteredValue });
        };
    const ModalFooter: ModalProps["footer"] = () => {

        return (
            <div className="flex-x align-center justify-end" >
                <button
                    type="submit"
                    className={`${styles.modal_footerBtn} default_btn mt-4 mb-6`}
                    onClick={handOk}
                >
                    确认
                </button>
            </div>
        );
    };

    return (
        <ConfigProvider
            theme={{
                components: {
                    Form: {
                        itemMarginBottom: 20, // 去除表单项之间的间距
                    },
                    Input: {
                        // color: 'var(--theme-color)',
                        activeBorderColor: 'var(--theme-color)',
                        hoverBorderColor: 'var(--theme-color)',
                        controlHeightLG: 50,
                        activeBg: 'var(--background5)',
                        hoverBg: 'var(--background5)',
                    },
                    Button: {
                        controlHeightLG: 50,
                        defaultActiveBorderColor: 'var(--theme-color)', //默认按钮激活态边框颜色
                        defaultActiveColor: 'var(--theme-color)', //默认按钮激活态文本颜色
                        defaultBg: 'var(--theme-color)', //默认按钮背景颜色
                        defaultHoverBorderColor: 'var(--theme-color)', //默认按钮悬浮态边框颜色
                        defaultHoverColor: 'var(--theme-color)', //默认按钮悬浮态文本颜色
                        defaultColor: '#fff', //默认按钮文本颜色
                    },
                    Modal: {
                        contentBg: "var(--background5)",
                        footerBg: "var(--background5)",
                        headerBg: "var(--background5)",
                    }
                },
                token: {
                    // colorBgContainerDisabled: '#fff',
                }
            }}
        >
            <Modal
                open={open}
                title={<p className={`${styles.title}`} >安全验证
                {/* {type}{acountInfo.type}  */}
                </p>}
                centered
                onCancel={handCancel}
                footer={ModalFooter}
                width={470}
                className={`modal_box`}
                classNames={{
                    content: styles.modal_content,
                    body: styles.modal_body,
                    footer: styles.modal_footer,
                }}
            >
                <div className="flex-col flex-ai-center" style={{ width: "100%" }}>
                    {/* t() */}
                    <Form
                        name="nickname"
                        form={form}
                        size="large"
                        style={{ width: '100%' }}
                    >
                        <div className={`font-16 font-w-400  ${styles.tip_title}`}>{
                            (type === '2' || (type === '3' && acountInfo.type === 'email')) ? '邮箱验证' : '手机号验证'
                        }</div>
                        <p className={`${styles.tip_color} font-12 font-w-400 mt-1 mb-2_5`}>{firstCheck ? '验证码发送至' : '验证码已发送至'}
                            <span>&nbsp;{
                                (type === '2' || (type === '3' && acountInfo.type === 'email')) ? encryptEmail(acountInfo.email)
                                    :
                                    encryptPhoneNumber(acountInfo.phone)
                            }</span>
                        </p>
                        <Form.Item name="code" rules={[{ required: true, message: "验证码不能为空！" }]}>
                            <Input
                                allowClear
                                placeholder="请输入验证码"
                                // prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                                suffix={
                                    <button type='button' className={isCounting ? `${styles.tip_color1_input}` : `${styles.text_color}`}
                                        onClick={getCode}
                                    >
                                        {isCounting ? `${countdown}s 重发` : firstCheck ? <span className={`${styles.default_color}`}>发送验证码</span> : "重新发送"}
                                    </button>
                                }
                                className={`${styles.authcode_input} ${styles.input_box} modal-input`}
                                style={{ borderRadius: "8px" }}
                                onChange={handleInputChange}
                                value={codeInputValue}
                            />
                            {/* <button className='text-color mt-1'>粘贴</button> */}
                        </Form.Item>

                        <div className={`font-16 font-w-400 mb-2_5 ${styles.tip_title}`}>谷歌验证码</div>
                        <Form.Item name="googleCode" rules={[{ required: true, message: "验证码不能为空！" }]}>
                            <Input placeholder="请输入谷歌验证码" allowClear className={`${styles.input_box} modal-input`}
                                suffix={
                                    <button type='button' className={`${styles.default_color}`} onClick={handlePaste}>
                                        粘贴
                                    </button>
                                }
                            />
                        </Form.Item>


                    </Form>

                </div>
            </Modal>
        </ConfigProvider>
    );
}

export default CloseModal;
