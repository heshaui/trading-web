import { Modal, ConfigProvider, Form, Input, Button } from "antd";
// import { type CSSProperties, useState, useEffect } from "react";;
import type { ModalProps } from "antd/es/modal/interface";
// import { Iconify } from "@/components/icon/index";
// import store from "@/store"
// import { useRouter } from 'next/router';
import styles from "./styles/safe.module.css";
// import Image from 'next/image'
import { Iconify } from "@/components/icon/index";
// import PhoneCodeSelector from "@/components/PhoneCodeSelector"
import { useState } from "react";
import {
    getSmsCode,
    getEmailCode,
    getEmailSafe,
    setPasswordSafe,
    getPasswordSmsCode,
    getPasswordEmailCode
} from '@/services/safeCenter'
import { toast } from "sonner";
import { encryptData, encryptEmail, encryptPhoneNumber } from "@/utils/encrypt";
import QuestionModal from "@/components/myModal/questionModal";
import TotastModal from "./totastModal";
import { getWithdrawalCheckSmsCode, getWithdrawalCheckEmailCode,checkWithdrawDeposit } from "@/services/assets";
import {getFingerprint} from "@/hooks/user-fingerprint"
import { useTranslation } from 'next-i18next';
interface acountType {
    countryCode?: string;
    email?: string;
    phone?: string;
    googleCode?: string;
    type?: string;
}
interface returnInfoType {
    emailCode?: string,
    phoneCode?: string,
    googleCode?: string,
    countryCode?: string;
    email?: string;
    phone?: string;
}
interface SafeDataType {
    userId?: number,
    registerAccount?: string,
    account?: string,
    status?: number,
    email?: string,
    phone?: string,
    inviteCode?: string,
    parentUserId?: number,
    isGoogleAuth?: number,
    isPhoneAuth?: number,
    isEmailAuth?: number,
    realnessStatus?: number,
    addressStatus?: number,
    countryCode?: string,
    userLevel?: string,
    createTime?: number,
    updateTime?: number,
    tenantId?: string,
    transactionStatus?: number,
    withdrawalStatus?: number,
    famousAphorisms?: string,
    securityIntensity?: number,
    googleCode?: string
}
type Props = {
    open: boolean;
    onOk: (event: returnInfoType) => void;
    onCancel: () => void;
    type?: string;
    acountInfo: SafeDataType;
};

function AntiSafeModal({ open, onCancel, type, onOk, acountInfo }: Props) {
    const { t } = useTranslation(['assets']);
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
    const [pointout, setPointout] = useState(false);
    const [emailCodeInputValue, setEmailCodeInputValue] = useState('');
    const [phoneCodeInputValue, setPhoneCodeInputValue] = useState('');
    const [googleCodeInputValue, setGoogleCodeInputValue] = useState('');
    const [errOpen,setErrOpen]=useState(false)

    const [form] = Form.useForm();

    const handCancel = () => {
        form.resetFields();
        setFirstCheck(true)
        setFirstCheck2(true)
        onCancel()
    };

    const handOk = async () => {
        form.validateFields()
            .then(async (values) => {
                const dataInfo = {
                    emailCode: values.emailCode||'',
                    phoneCode: values.phoneCode||'',
                    googleCode: values.googleCode||''
                }
                
                // onOk(dataInfo)
                // handCancel()
                checkMoneySafe(dataInfo)

            })

    };

    const checkMoneySafe = async (dataInfo: acountType) => {
        setLoading(true)
        try {
            const dataEncrypt = await encryptData(dataInfo)
            const res = await checkWithdrawDeposit(dataEncrypt)
            if (res.code === "0") {
                toast.success(res.message)
                onOk(dataInfo)
                handCancel()
            } else {
                toast.error(res.message)
            }
        } catch (error) {
            // setErrOpen(true)
            toast.error(String(error))
        }finally{
            setLoading(false)

        }
    }

    const getLockPhoneCode = async () => {
        if (isCounting2 || loading || codeLoading2) return
        setCodeLoading2(true)
        const fingerprint = await getFingerprint()
        try {
            const dataInfo = {
                number: acountInfo?.phone,
                code: acountInfo?.countryCode?.replace('+', ''),
                deviceType: fingerprint
            };
            const dataEncrypt = await encryptData(dataInfo)
            const res = await getWithdrawalCheckSmsCode(dataEncrypt);
            if (res.code === "0") {
                setFirstCheck2(false)
                toast.success(res.message)
                startCountdown2();
            } else if (res.code === "10044") {
                toast.error(t('modal.codeValid')) //验证码还在有效期内
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
    const getLockEmailCode = async () => {
        if (isCounting || loading || codeLoading) return
        setCodeLoading(true)
        const fingerprint = await getFingerprint()
        try {
            const dataInfo = {
                number: acountInfo?.email,
                deviceType: fingerprint
            };
            
            const dataEncrypt = await encryptData(dataInfo)
            // console.log(dataEncrypt, 111);

            const res = await getWithdrawalCheckEmailCode(dataEncrypt);
            if (res.code === "0") {
                setFirstCheck(false)
                toast.success(res.message)
                startCountdown();
            } else if (res.code === "10044") {
                toast.error(t('modal.codeValid')) //验证码还在有效期内
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
    // 过滤输入，只允许数字和字母
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>,type:string) => {
        const { value } = e.target;
        // 只保留数字和字母
        const filteredValue = value.replace(/[^0-9]/g, '');
        // setEmailCodeInputValue(filteredValue);
        // form.setFieldsValue({ emailCode: filteredValue });
        if(type === 'email'){
            setEmailCodeInputValue(filteredValue);
            form.setFieldsValue({ emailCode: filteredValue });
        }else if(type === 'phone'){
            setPhoneCodeInputValue(filteredValue);
            form.setFieldsValue({ phoneCode: filteredValue });
        }else if(type === 'google'){
            setGoogleCodeInputValue(filteredValue);
            form.setFieldsValue({ googleCode: filteredValue });
        }
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
    const handQuestionOk = async () => {
        // 判断需要请求的验证码类型
        if (acountInfo.isGoogleAuth === 1) {
            // Google验证开启时
            if (acountInfo.email) {
                // 有邮箱时优先使用邮箱验证
                await getLockEmailCode();
            } else if (acountInfo.phone) {
                // 没有邮箱但有手机号时使用手机验证
                await getLockPhoneCode();
            }
        } else {
            // Google验证未开启时，同时请求邮箱和手机验证码
            if (acountInfo.email) {
                 getLockEmailCode();
            }
            if (acountInfo.phone) {
                 getLockPhoneCode();
            }
        }
        setPointout(false)
    }
    const ModalFooter: ModalProps["footer"] = () => {

        return (
            <div className="flex-col flex-ai-start mt-10 mb-3" >
                <button
                    type="submit"
                    className={`${styles.modal_footerBtn} default_btn`}
                    onClick={handOk}
                >
                    {loading ? <Iconify icon="tabler:loader" size={24} className={`loading`} /> : t('modal.confirm')}
                </button>
                {/* <Button type="primary" onClick={handOk}
                className={`${styles.modal_footerBtn} default_btn`}
                loading={loading}
                >
                    确认
                </Button> */}
                <button
                    type="button"
                    className={`text-color mt-5`}
                    onClick={() => setPointout(true)}
                >
                    {/* 收不到验证码？ */}
                    {t('modal.codeError')}
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
                title={<p className={`${styles.title}`} >
                    {/* 安全验证 */}
                    {t('modal.safeVerification')}
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
                        {(acountInfo.email) && (<>
                            <div className={`font-16 font-w-400 mb-2_5 ${styles.tip_title}`}>
                                {/* 邮箱验证 */}
                                {t('modal.emailCheck')}
                                </div>
                            <p className={`${styles.tip_color} font-12 font-w-400 mt-1 mb-2_5`}>{firstCheck ? t('modal.sent2') : t('modal.resend2')}
                                <span>&nbsp;{encryptEmail(acountInfo.email)}</span>
                            </p>
                            <Form.Item name="emailCode" rules={[{ required: true, message: t('modal.codeError2') }]}>
                                <Input
                                    allowClear
                                    placeholder={t('modal.inputCode')}
                                    // prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                                    suffix={
                                        <button type='button' className={isCounting ? `${styles.tip_color1_input}` : `${styles.text_color}`}
                                            onClick={getLockEmailCode}
                                        >
                                            {isCounting ? `${countdown}${t('modal.countdown')}` : firstCheck ? <span className={`${styles.default_color}`}>{t('modal.sent')}</span> : t('modal.resend')}
                                        </button>
                                    }
                                    className={`${styles.authcode_input} ${styles.input_box} modal-input`}
                                    style={{ borderRadius: "8px" }}
                                    maxLength={6}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'email')}
                                    value={emailCodeInputValue}
                                />
                            </Form.Item>
                        </>)}
                        {(acountInfo.phone && (acountInfo.isGoogleAuth===0 || !acountInfo.email||!acountInfo.googleCode)) && (<>

                            <div className={`font-16 font-w-400 mb-2_5 ${styles.tip_title}`}>{t('modal.phone')}</div>
                            <p className={`${styles.tip_color} font-12 font-w-400 mt-1 mb-2_5`}>{firstCheck2 ? t('modal.sent2') : t('modal.resend2')}
                                <span>&nbsp;{encryptPhoneNumber(acountInfo.phone)}</span>
                            </p>
                            <Form.Item name="phoneCode" rules={[{ required: true, message: t('modal.codeError2') }]}>
                                <Input
                                    allowClear
                                    placeholder={t('modal.inputPhoneCode')}
                                    // prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                                    suffix={
                                        <button type='button' className={isCounting2 ? `${styles.tip_color1_input}` : `${styles.text_color}`}
                                            onClick={getLockPhoneCode}
                                        >
                                            {isCounting2 ? `${countdown2}${t('modal.countdown')}` : firstCheck2 ? <span className={`${styles.default_color}`}>{t('modal.sent')}</span> : t('modal.resend')}
                                        </button>
                                    }
                                    className={`${styles.authcode_input} ${styles.input_box} modal-input`}
                                    style={{ borderRadius: "8px" }}
                                    maxLength={6}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'phone')}
                                    value={phoneCodeInputValue}
                                />
                            </Form.Item>
                        </>)}
                        {(acountInfo.isGoogleAuth===1||acountInfo.googleCode) && (<>
                            <div className={`font-16 font-w-400 mb-2_5 ${styles.tip_title}`}>{t('modal.google')}</div>
                            <Form.Item name="googleCode" rules={[{ required: true, message: t('modal.codeError2') }]}>
                                <Input placeholder={t('modal.inputGoogleCode')} allowClear className={`${styles.input_box} modal-input`}
                                    suffix={
                                        <button type='button' className={`${styles.default_color}`} onClick={handlePaste}>
                                            {t('modal.paste')}
                                        </button>
                                    }
                                    maxLength={6}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'google')}
                                    value={googleCodeInputValue}
                                />
                            </Form.Item>
                        </>)}



                    </Form>
                    <QuestionModal open={pointout} onOk={handQuestionOk} type={'safe'} acount={acountInfo.phone || ''} acount2={acountInfo.email || ''} onCancel={() => setPointout(false)} />
                    {/* loading success error */}
                    {/* <TotastModal open={errOpen} message={t('modal.error4')} type={'error'} onCancel={() => setErrOpen(false)}/> */}
                </div>
            </Modal>
        </ConfigProvider>
    );
}

export default AntiSafeModal;
