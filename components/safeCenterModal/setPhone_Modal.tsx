import { Modal, ConfigProvider, Form, Input } from "antd";
// import { type CSSProperties, useState, useEffect } from "react";;
import type { ModalProps } from "antd/es/modal/interface";
// import { Iconify } from "@/components/icon/index";
// import store from "@/store"
// import { useRouter } from 'next/router';
import styles from "./styles/setPhone.module.css";
import Image from 'next/image'
import { Iconify } from "@/components/icon/index";
import PhoneCodeSelector from "@/components/PhoneCodeSelector"
import { useState } from "react";
import { bindPhone, getSmsCode,getEmailCode } from '@/services/safeCenter'
import { toast } from "sonner";
import { encryptData, encryptEmail, encryptPhoneNumber } from "@/utils/encrypt";
import { useTranslation } from 'next-i18next';
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
    type: string;
    acountInfo:SafeDataType;
};

function SetMailModal({ open, onCancel, type,acountInfo ,onOk}: Props) {
    const { t } = useTranslation(['userCenter']);
    // const router = useRouter();
    const [isCounting, setIsCounting] = useState(false);
    const [isCounting2, setIsCounting2] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [countdown2, setCountdown2] = useState(60);
    const [firstCheck, setFirstCheck] = useState(true);
    const [firstCheck2, setFirstCheck2] = useState(true);
    const [codeLoading, setCodeLoading] = useState(false); // 验证码loading
    const [codeLoading2, setCodeLoading2] = useState(false); // 验证码loading

    const [loading, setLoading] = useState(false); // 按钮loading
    const [emailCodeInputValue, setEmailCodeInputValue] = useState('');
    const [phoneCodeInputValue, setPhoneCodeInputValue] = useState('');
    const [googleCodeInputValue, setGoogleCodeInputValue] = useState('');


    const [form] = Form.useForm();

    const handCancel = () => {
        form.resetFields();
        setFirstCheck(true)
        setFirstCheck2(true)
        onCancel()
    };

    const handOk = async () => {
        // 这里可以添加点击验证码弹窗确认按钮后的处理逻辑
        form.validateFields()
            .then(async (values) => {
                // console.log(values);
                // if (firstCheck) return toast.error('请先发送验证码')
                try {
                    let params = {}
                    if (type === 'set') {
                        // 设置手机号
                        params = {
                            isPhoneAuth: 1,
                            newPhone: values.phoneNumber,
                            phoneCode: values.code||'',
                            countryCode: values.areaCode.replace("+", ""),
                            type:2,
                            googleCode: values.googleCode||'',
                            code:values.emailCode||'',
                            email:values.emailCode?acountInfo?.email:''
                        }

                    } else if (type === 'change') {
                        // 修改手机号
                        params = {
                            phoneStatus: 1,
                            newPhone: values.phoneNumber,
                            phoneCode: values.code,
                            countryCode: values.areaCode.replace("+", ""),
                            type:1,
                        }

                    }
                    const dataEncrypt = await encryptData(params)
                    const res = await bindPhone(dataEncrypt)
                    if (res.code === '0') {
                        toast.success(res.message)
                        onOk()
                        handCancel()
                    } else {
                        toast.error(res.message)
                    }
                } catch (error) {
                    toast.error(String(error))
                }
            });
    };
    const getPhoneCode = async () => {
        if (isCounting || loading || codeLoading) return
        const number = form.getFieldValue('phoneNumber')
        const code = form.getFieldValue('areaCode')
        if (!number) return toast.error(t('security.phoneSafe.inputPhone2'))
        setCodeLoading(true)
        try {
            const dataInfo = {
                number: number,
                code: code?.replace("+", ""),
                deviceType: "web"
            };
            const dataEncrypt = await encryptData(dataInfo)
            const res = await getSmsCode(dataEncrypt);
            if (res.code === "0") {
                setFirstCheck(false)
                toast.success(res.message)
                startCountdown(res.data);
            } else if (res.code === "10044") {
                toast.error(t('security.error1'))
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
        if (isCounting2 || loading || codeLoading2) return
        setCodeLoading2(true)
        try {
            const dataInfo = {
                number: acountInfo?.email,
                deviceType: "web"
            };
            const dataEncrypt = await encryptData(dataInfo)
            const res = await getEmailCode(dataEncrypt);
            if (res.code === "0") {
                setFirstCheck2(false)
                toast.success(res.message)
                startCountdown2(res.data);
            } else if (res.code === "10044") {
                toast.error(t('security.error1'))
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

    const startCountdown = (count:number) => {
        setCountdown(count);
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
    const startCountdown2 = (count:number) => {
        setCountdown2(count);
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
       // 过滤输入，只允许数字和字母
       const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>,type:string) => {
        const { value } = e.target;
        // 只保留数字和字母
        const filteredValue = value.replace(/[^0-9]/g, '');
        if(type === 'email'){
            setEmailCodeInputValue(filteredValue);
            form.setFieldsValue({ emailCode: filteredValue });
        }else if(type === 'phone'){
            setPhoneCodeInputValue(filteredValue);
            form.setFieldsValue({ code: filteredValue });
        }else if(type === 'google'){
            setGoogleCodeInputValue(filteredValue);
            form.setFieldsValue({ googleCode: filteredValue });
        }
    };
     // 过滤输入，只允许数字和字母
     const handleInputChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        // 只保留数字和字母
        const filteredValue = value.replace(/[^0-9]/g, '');
        setPhoneCodeInputValue(filteredValue);
        form.setFieldsValue({ code: filteredValue });
    };
    const ModalFooter: ModalProps["footer"] = () => {

        return (
            <div className="flex-x align-center justify-end" >
                {/* <button
                    type="button"
                    className={`${styles.modal_footerBtn} cancel_btn2 mr-5 font-14 font-w-500`}
                    onClick={handCancel}
                >
                    取消
                </button> */}
                <button
                    type="submit"
                    className={`${styles.modal_footerBtn} default_btn mt-8 mb-6`}
                    onClick={handOk}
                >
                    {t('security.confirm')}
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
                        // color: '#FF5F1F',
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
                title={<p className={`${styles.title}`} >{type === 'set' ? t('security.phoneSafe.setPhone') : t('security.phoneSafe.modifyPhone')}</p>}
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
                        initialValues={{ areaCode: "+1" }}
                    >
                        <div className={`font-16 font-w-400 mb-2_5 ${styles.tip_title}`}>
                            {/* 国家/地区 */}
                            {t('security.phoneSafe.country')}
                        </div>
                        <Form.Item >
                            <div className="flex">
                                <PhoneCodeSelector className={`${styles.input_box}`} />
                                <Form.Item noStyle name="phoneNumber" rules={[{ required: true, message: t('security.phoneSafe.phoneNullError') }]}>
                                    <Input placeholder={t('security.phoneSafe.inputNewPhone')} allowClear={true} className={`${styles.input_box} modal-input ml-2`} />
                                </Form.Item>
                            </div>
                        </Form.Item>
                        <div className={`font-16 font-w-400 mb-2_5  ${styles.tip_title}`}>
                            {/* 新手机号验证 */}
                            {t('security.phoneSafe.newPhoneCheck')}
                        </div>
                        <Form.Item name="code" rules={[{ required: true, message: t('security.codeError') }]}>
                            <Input
                                allowClear
                                placeholder={t('security.inputCode')}
                                // prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                                suffix={
                                    <button type='button' className={isCounting ? `${styles.tip_color1_input}` : `${styles.text_color}`} onClick={getPhoneCode}>
                                        {isCounting ? `${countdown} ${t('security.countdown')}` : firstCheck ? <span className={`${styles.default_color}`}>{t('security.sent')}</span> : t('security.resend')}
                                    </button>
                                }
                                className={`${styles.authcode_input} ${styles.input_box} modal-input`}
                                style={{ borderRadius: "8px" }}
                                maxLength={6}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'phone')}
                                    value={phoneCodeInputValue}
                            />
                            {/* <button className='text-color mt-1'>粘贴</button> */}
                        </Form.Item>
                        {( type === 'set'&&acountInfo?.googleCode) && <>
                            <div className={`font-16 font-w-400 mb-2_5 ${styles.tip_title}`}>
                                {/* 谷歌验证码 */}
                                {t('security.google')}
                            </div>
                            <Form.Item noStyle name="googleCode" rules={[{ required: true, message: t('security.codeError') }]}>
                                <Input placeholder={t('security.inputCode')} allowClear={true} 
                                className={`${styles.input_box} modal-input`} 
                                maxLength={6}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'google')}
                                value={googleCodeInputValue}
                                />
                            </Form.Item>
                        </>}
                        {( type === 'set'&&acountInfo?.email&& !acountInfo?.googleCode) && <>
                            <div className={`font-16 font-w-400 mb-2_5 ${styles.tip_title}`}>
                                {/* 邮箱验证 */}
                                {t('security.email')}
                            </div>
                            <p className={`${styles.tip_color} font-12 font-w-400 mt-1 mb-2_5`}>{firstCheck2 ? t('security.sent2') : t('security.resend2')}
                                <span>&nbsp;{encryptEmail(acountInfo.email)}</span>
                            </p>
                            <Form.Item name="emailCode" rules={[{ required: true, message: t('security.codeError') }]}>
                                <Input
                                    allowClear
                                    placeholder={t('security.inputCode')}
                                    // prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                                    suffix={
                                        <button type='button' className={isCounting2 ? `${styles.tip_color1_input}` : `${styles.text_color}`}
                                            onClick={getMailCode}
                                        >
                                            {isCounting2 ? `${countdown2} ${t('security.countdown')}` : firstCheck2 ? <span className={`${styles.default_color}`}>{t('security.sent')}</span> : t('security.resend')}
                                        </button>
                                    }
                                    className={`${styles.authcode_input} ${styles.input_box} modal-input`}
                                    style={{ borderRadius: "8px" }}
                                    maxLength={6}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'email')}
                                    value={emailCodeInputValue}
                                />
                            </Form.Item>
                        </>}

                    </Form>

                </div>
            </Modal>
        </ConfigProvider>
    );
}

export default SetMailModal;
