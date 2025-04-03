import { Modal, ConfigProvider, Form, Input, AutoComplete } from "antd";
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
import { bindEmail, getEmailCode, getSmsCode } from '@/services/safeCenter'
import { toast } from "sonner";
import type { AutoCompleteProps } from 'antd';
import { emailSuffixes } from "@/utils/enum";
import { encryptData, encryptEmail, encryptPhoneNumber } from "@/utils/encrypt";
import { useTranslation } from 'next-i18next';
import { LOCAL_STORAGE_KEY } from "@/config/apiConfig";
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
    areaCode?: string;
}
type Props = {
    open: boolean;
    // onOk?: (event: boolean) => void;
    onOk: () => void;
    onCancel: () => void;
    type: string;
    acountInfo: SafeDataType;
};

function SetPhoneModal({ open, onCancel, type, acountInfo ,onOk}: Props) {
    const { t } = useTranslation(['userCenter']);
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
    const [options, setOptions] = useState<AutoCompleteProps['options']>([]);
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
                setLoading(true)
                try {
                    const userInfo = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY.USER_INFO) || '{}')
                    let params = {}
                    if (type === 'set') {
                        params = {
                            isPhoneAuth: 1,
                            newEmail: values.email,
                            code: values.code || '',
                            googleCode: values.googleCode || '',
                            userId: userInfo.userId || '',
                            phoneCode: values.phoneCode || '',
                            countryCode: values.phoneCode?acountInfo?.areaCode?.replace("+", ""): '',
                            phone: values.phoneCode?acountInfo?.phone: '',
                            type: 2
                        }

                    } else if (type === 'change') {
                        params = {
                            phoneStatus: 1,
                            newEmail: values.email,
                            code: values.code || '',
                            userId: userInfo.userId || '',
                            // phoneCode: values.phoneCode || '',
                            // countryCode: values.areaCode.replace("+", ""),
                            type: 1
                        }

                    }
                    // console.log(params, 11);

                    const dataEncrypt = await encryptData(params)
                    const res = await bindEmail(dataEncrypt)
                    if (res.code === '0') {
                        toast.success(res.message)
                        onOk()
                        handCancel()
                    } else {
                        toast.error(res.message)
                    }
                    setLoading(false)
                } catch (error) {
                    setLoading(false)
                    toast.error(String(error))
                }
            });
    };
    const getMailCode = async () => {
        if (isCounting || loading || codeLoading) return
        const number = form.getFieldValue('email')
        if (!number) return toast.error(t('security.mailSafe.inputEmail2'))
        setCodeLoading(true)
        try {
            const dataInfo = {
                number: number,
                deviceType: "web"
            };
            const dataEncrypt = await encryptData(dataInfo)
            const res = await getEmailCode(dataEncrypt);
            if (res.code === "0") {
                setFirstCheck(false)
                toast.success(res.message)
                startCountdown();
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
                setFirstCheck(false)
                toast.success(res.message)
                startCountdown2();
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
    // 过滤输入，只允许数字和字母
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
        const { value } = e.target;
        // 只保留数字和字母
        const filteredValue = value.replace(/[^0-9]/g, '');
        if (type === 'email') {
            setEmailCodeInputValue(filteredValue);
            form.setFieldsValue({ code: filteredValue });
        } else if (type === 'phone') {
            setPhoneCodeInputValue(filteredValue);
            form.setFieldsValue({ phoneCode: filteredValue });
        } else if (type === 'google') {
            setGoogleCodeInputValue(filteredValue);
            form.setFieldsValue({ googleCode: filteredValue });
        }
    };
    // // 过滤输入，只允许数字和字母
    // const handleInputChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const { value } = e.target;
    //     // 只保留数字和字母
    //     const filteredValue = value.replace(/[^0-9]/g, '');
    //     setPhoneCodeInputValue(filteredValue);
    //     form.setFieldsValue({ phoneCode: filteredValue });
    // };
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
                        itemMarginBottom: 0, // 去除表单项之间的间距
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
                    },
                    Select: {
                        selectorBg: 'var(--background5)',
                    }
                },
                token: {
                    // colorBgContainerDisabled: '#fff',
                    controlHeight: 40,
                }
            }}
        >
            <Modal
                open={open}
                title={<p className={`${styles.title}`} >{type === 'set' ? t('security.mailSafe.setMail') : t('security.mailSafe.modifyMail')}</p>}
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
                        style={{ width: "100%" }}
                    >
                        <div className={`font-16 font-w-400 mb-2_5 ${styles.tip_title}`}>{t('security.mailSafe.email')}</div>
                        <Form.Item name="email" rules={[{ required: true, message: t('security.mailSafe.mailNullError') }]}>
                            {/* <Input placeholder="请输入新邮箱" allowClear={true} className={`${styles.input_box} modal-input `} /> */}
                            <AutoComplete
                                onSearch={handleSearch}
                                // placeholder="请输入手机/邮箱"
                                placeholder={t('security.mailSafe.inputEmail')}
                                options={options}
                                allowClear={true}
                                backfill={true}
                                className={`${styles.input_box} autoComplete-custom custom-sleect`}
                            // onChange={getValue}
                            />
                        </Form.Item>
                        <div className={`font-16 font-w-400 mb-2_5 mt-5 ${styles.tip_title}`}>{t('security.mailSafe.checkMail')}</div>
                        <Form.Item name="code" rules={[{ required: true, message: t('security.codeErrorr') }]}>
                            <Input
                                allowClear
                                placeholder={t('security.inputCode')}
                                // prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                                suffix={
                                    <button type='button' className={isCounting ? `${styles.tip_color1_input}` : `${styles.text_color}`} onClick={getMailCode}>
                                        {isCounting ? `${countdown}${t('security.countdown')}` : firstCheck ? <span className={`${styles.default_color}`}>{t('security.sent')}</span> : t('security.resend')}
                                    </button>
                                }
                                className={`${styles.authcode_input} ${styles.input_box} modal-input`}
                                style={{ borderRadius: "8px" }}
                                maxLength={6}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'email')}
                                value={emailCodeInputValue}
                            />
                            {/* <button className='text-color mt-1'>粘贴</button> */}
                        </Form.Item>
                        {(type === 'set' && acountInfo?.googleCode) && <>
                            <div className={`font-16 font-w-400 mb-2_5 mt-5 ${styles.tip_title}`}>{t('security.google')}</div>
                            <Form.Item noStyle name="googleCode" rules={[{ required: true, message: t('security.codeError') }]}>
                                <Input placeholder={t('security.inputGoogleCode')}
                                    allowClear={true} className={`${styles.input_box} modal-input`}
                                    maxLength={6}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'google')}
                                    value={googleCodeInputValue} />
                            </Form.Item>
                        </>}
                        {(type === 'set' && acountInfo?.phone && !acountInfo?.googleCode) && <>
                            <div className={`font-16 font-w-400 mb-2_5 ${styles.tip_title}`}>{t('security.phone')}</div>
                            <p className={`${styles.tip_color} font-12 font-w-400 mt-1 mb-2_5`}>{firstCheck2 ? t('security.sent2') : t('security.resend2')}
                                <span>&nbsp;{encryptPhoneNumber(acountInfo.phone)}</span>
                            </p>
                            <Form.Item name="phoneCode" rules={[{ required: true, message: t('security.codeError') }]}>
                                <Input
                                    allowClear
                                    placeholder={t('security.inputCode')}
                                    // prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                                    suffix={
                                        <button type='button' className={isCounting2 ? `${styles.tip_color1_input}` : `${styles.text_color}`}
                                            onClick={getPhoneCode}
                                        >
                                            {isCounting2 ? `${countdown}${t('security.countdown')}` : firstCheck2 ? <span className={`${styles.default_color}`}>{t('security.sent')}</span> : t('security.resend')}
                                        </button>
                                    }
                                    className={`${styles.authcode_input} ${styles.input_box} modal-input`}
                                    style={{ borderRadius: "8px" }}
                                    maxLength={6}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'phone')}
                                    value={phoneCodeInputValue}
                                />
                            </Form.Item>
                        </>}

                    </Form>

                </div>
            </Modal>
        </ConfigProvider>
    );
}

export default SetPhoneModal;
