import { Modal, ConfigProvider, Form, Input } from "antd";
// import { type CSSProperties, useState, useEffect } from "react";;
import type { ModalProps } from "antd/es/modal/interface";
// import { Iconify } from "@/components/icon/index";
// import store from "@/store"
// import { useRouter } from 'next/router';
import styles from "./styles/setGoogle.module.css";
import Image from 'next/image'
// import { Iconify } from "@/components/icon/index";
// import PhoneCodeSelector from "@/components/PhoneCodeSelector"
import { useState } from "react";
import {
    getSmsCode,
    getEmailCode,
    unbindGoogle
} from '@/services/safeCenter'
import { toast } from "sonner";
import { encryptData, encryptEmail, encryptPhoneNumber } from "@/utils/encrypt";
import  QuestionModal  from "@/components/myModal/questionModal";
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
    onOk: () => void;
    onCancel: () => void;
    type?: string;
    acountInfo: SafeDataType;
};

function UnbindGoogleModal({ open, onCancel, type, onOk, acountInfo }: Props) {
    // const router = useRouter();
    const [isCounting, setIsCounting] = useState(false);
    const [isCounting2, setIsCounting2] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [countdown2, setCountdown2] = useState(60);
    const [firstCheck, setFirstCheck] = useState(true);
    const [firstCheck2, setFirstCheck2] = useState(true);
    const [loading, setLoading] = useState(false); // 按钮loading
    const [codeLoading, setCodeLoading] = useState(false); // 验证码loading
    const [codeLoading2, setCodeLoading2] = useState(false); // 验证码loading
    const [emailCodeInputValue, setEmailCodeInputValue] = useState('');
    const [phoneCodeInputValue, setPhoneCodeInputValue] = useState('');
    const [questionModalOpen, setQuestionModalOpen] = useState(false);
    const [form] = Form.useForm();
    console.log(acountInfo, 123);

    const handCancel = () => {
        form.resetFields();
        setFirstCheck(true)
        setFirstCheck2(true)
        onCancel()
    };

    const handOk = async () => {
        // onOk(type)
        // 0:修改手机号 1:关闭手机验证 2:修改邮箱 3:修改密码 4:关闭谷歌验证 5:绑定邮箱
        form.validateFields()
            .then(async (values) => {
                setLoading(true)
                try {

                    const params = {
                        isGoogleAuth: 0,
                        code: values.emailCode || '',
                        googleCode: values.googleCode || '',
                        phoneCode: values.phoneCode || '',
                    }
                    const dataEncrypt = await encryptData(params)
                    const res = await unbindGoogle(dataEncrypt)
                    if (res.code === "0") {
                        toast.success(res.message)
                        onOk()
                        handCancel()
                    } else {
                        toast.error(res.message)
                    }
                } catch (error) {
                    setLoading(false)
                    console.log(error);
                } finally {
                    setLoading(false)
                }
            })

    };

    const getPhoneCode = async () => {
        if (isCounting2 || loading || codeLoading2) return
        setCodeLoading2(true)
        try {
            const dataInfo = {
                number: acountInfo?.phone,
                code: acountInfo?.countryCode,
                deviceType: "web"
            };
            const dataEncrypt = await encryptData(dataInfo)
            const res = await getSmsCode(dataEncrypt);
            if (res.code === "0") {
                setFirstCheck2(false)
                toast.success(res.message)
                startCountdown2();
            } else if (res.code === "10044") {
                toast.error('验证码还在有效期内')
            } else {
                toast.error(res.message)
            }
            setCodeLoading2(false)

        } catch (error) {
            setCodeLoading2(false)
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
    const startCountdown2 = () => {
        setCountdown2(60);
        setIsCounting2(true);
        const timer = setInterval(() => {
            setCountdown2((prevCountdown) => {
                if (prevCountdown === 1) {
                    clearInterval(timer);
                    setIsCounting2(false);
                    return 0;
                }
                return prevCountdown - 1;
            });
        }, 1000);
        // 清理定时器
        return () => clearInterval(timer);
    };
    const handQuestionOk = (type: string) => {
        if(type === 'phone'){
            getPhoneCode()
        }else if(type === 'email'){
            getMailCode()
        }
        setQuestionModalOpen(false)
    }
    // 过滤输入，只允许数字和字母
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        // 只保留数字和字母
        const filteredValue = value.replace(/[^0-9]/g, '');
        setEmailCodeInputValue(filteredValue);
        form.setFieldsValue({ emailCode: filteredValue });
    };
     // 过滤输入，只允许数字和字母
     const handleInputChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        // 只保留数字和字母
        const filteredValue = value.replace(/[^0-9]/g, '');
        setPhoneCodeInputValue(filteredValue);
        form.setFieldsValue({ phoneCode: filteredValue });
    };

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
    const ModalFooter: ModalProps["footer"] = () => {

        return (
            <div className="flex-x align-center justify-end" >
                 <button
                    type="submit"
                    className={`${styles.modal_footerBtn} default_btn mt-4 mb-6 mr-5`}
                    onClick={handOk}
                >
                    解绑
                </button>
                <button
                    type="submit"
                    className={`${styles.modal_footerBtn}  cancel_btn2 mt-4 mb-6`}
                    onClick={handCancel}
                >
                    取消
                </button>
               
            </div>
        );
    };

    return (
        <ConfigProvider
            theme={{
                components: {
                    Form: {
                        itemMarginBottom: 10, // 去除表单项之间的间距
                    },
                    Input: {
                        // color: '#FF5F1F',
                        activeBorderColor: '#FF5F1F',
                        hoverBorderColor: '#FF5F1F',
                        controlHeightLG: 50,
                        activeBg: 'var(--background5)',
                        hoverBg: 'var(--background5)',
                    },
                    Button: {
                        controlHeightLG: 50,
                        defaultActiveBorderColor: '#FF5F1F', //默认按钮激活态边框颜色
                        defaultActiveColor: '#FF5F1F', //默认按钮激活态文本颜色
                        defaultBg: '#FF5F1F', //默认按钮背景颜色
                        defaultHoverBorderColor: '#FF5F1F', //默认按钮悬浮态边框颜色
                        defaultHoverColor: '#FF5F1F', //默认按钮悬浮态文本颜色
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
                    <div className="flex-col flex-ai-center">
                        <Image src="/images/login/icon_success.png" alt="" className={`${styles.icon_box}`} width={160} height={160} />

                        <p className={`${styles.msg_color}`}>确定解绑谷歌验证？</p>
                        <div className={`mb-6 mt-7 ${styles.warning_box} font-12 font-w-400`} >
                            <p>温馨提示：</p>
                            <p>为了保护账户安全，在解绑谷歌双重身份验证后，24小时内无法提币。</p>
                        </div>
                    </div>
                    {/* t() */}
                    <Form
                        name="nickname"
                        form={form}
                        size="large"
                        style={{ width: '100%' }}
                    >
                        {(acountInfo.email) && (<>
                            <div className={`font-16 font-w-400  ${styles.tip_title}`}>{
                                '邮箱验证'
                            }</div>
                            <p className={`${styles.tip_color} font-12 font-w-400 mt-1 mb-2_5`}>{firstCheck ? '验证码发送至' : '验证码已发送至'}
                                <span>&nbsp;{encryptEmail(acountInfo.email)
                                }</span>
                            </p>
                            <Form.Item name="emailCode" rules={[{ required: true, message: "验证码不能为空！" }]}>
                                <Input
                                    allowClear
                                    placeholder="请输入验证码"
                                    // prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                                    suffix={
                                        <button type='button' className={isCounting ? `${styles.tip_color1_input}` : `${styles.text_color}`}
                                            onClick={getMailCode}
                                        >
                                            {isCounting ? `${countdown}s 重发` : firstCheck ? <span className={`${styles.default_color}`}>发送验证码</span> : "重新发送"}
                                        </button>
                                    }
                                    className={`${styles.authcode_input} ${styles.input_box} modal-input`}
                                    style={{ borderRadius: "8px" }}
                                    maxLength={6}
                                    onChange={handleInputChange}
                                    value={emailCodeInputValue}
                                />
                                {/* <button className='text-color mt-1'>粘贴</button> */}
                            </Form.Item>
                        </>)}
                        {(acountInfo.phone && !acountInfo.email) && (<>

                            <div className={`font-16 font-w-400 mb-2_5 ${styles.tip_title}`}>手机号验证</div>
                            <p className={`${styles.tip_color} font-12 font-w-400 mt-1 mb-2_5`}>{firstCheck2 ? '验证码发送至' : '验证码已发送至'}
                                <span>&nbsp;{encryptPhoneNumber(acountInfo.phone)}</span>
                            </p>
                            <Form.Item name="phoneCode" rules={[{ required: true, message: "验证码不能为空！" }]} >
                                <Input
                                    allowClear
                                    placeholder="请输入验证码"
                                    // prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                                    suffix={
                                        <button type='button' className={isCounting2 ? `${styles.tip_color1_input}` : `${styles.text_color}`}
                                            onClick={getPhoneCode}
                                        >
                                            {isCounting2 ? `${countdown2}s 重发` : firstCheck2 ? <span className={`${styles.default_color}`}>发送验证码</span> : "重新发送"}
                                        </button>
                                    }
                                    className={`${styles.authcode_input} ${styles.input_box} modal-input`}
                                    style={{ borderRadius: "8px" }}
                                    maxLength={6}
                                    onChange={handleInputChange2}
                                    value={phoneCodeInputValue}
                                />
                            </Form.Item>
                        </>)}
                        {(acountInfo.phone ||acountInfo.email) &&<div 
                        className={`error_icon font-14 font-w-500 mt-1 mb-2_5 cursor-pointer`}
                        onClick={() => setQuestionModalOpen(true)}
                         >没有收到验证码？</div>}
                        {/* <div className={`font-16 font-w-400 mb-2_5 ${styles.tip_title}`}>谷歌验证码</div> */}
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
                <QuestionModal
                    open={questionModalOpen}
                    onAgain={handQuestionOk}
                    onCancel={() => setQuestionModalOpen(false)}
                    type={acountInfo.phone ? 'phone' : 'email'}
                    acount={acountInfo.phone ? acountInfo.phone : acountInfo.email?acountInfo.email:''}
                />
            </Modal>
        </ConfigProvider>
    );
}

export default UnbindGoogleModal;
