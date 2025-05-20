/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { Modal, Form, Input, ConfigProvider } from "antd";
import { useState, useEffect, useRef } from "react"; //type CSSProperties,
import type { ModalProps } from "antd/es/modal/interface";
// import { Iconify } from "@/components/icon/index";
import store from "@/store"
import { toast } from "sonner";
import { useRouter } from 'next/router';
import styles from "./style/safeModal.module.css";
import { encryptEmail, encryptPhoneNumber } from "@/utils/encrypt";
import QuestionModal from "@/components/myModal/questionModal";
import { getLogin, getLoginMailCode, getLoginSmsCode, getLoginCheck } from "@/services/login";
// import { encryptWithPublicKey } from "@/utils/jsENcrypy"; //登录加密
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { useAuth } from "@/context/AuthContext";
import { getLoginUserInfo } from "@/services/userCenter"
import { LOCAL_STORAGE_KEY } from "@/config/apiConfig";
import { useTranslation } from 'next-i18next';
// import { encryptData } from "@/utils/encrypt";
import { encryptData } from "@/hooks/user-encrypt";
// import { useWebConfig } from '@/hooks/useKv';
interface acountType {
    type: string,
    email?: string,
    phone?: string,
    deviceType: string,
    password: string,
    authCodePhone?: string,
    authCodeMail?: string,
    authCodeGoogle?: string
    countryCode?: string
    isGoogleAuth?: number,
    isPhoneAuth?: number,
    isEmailAuth?: number,
    openAll?: number,
    emailTime?: number,
    phoneTime?: number
}
type Props = {
    open: boolean;
    // acount?: string | null;
    acountInfo: acountType;
    // type?: string | null; //onOk, acount, type,
    onOk?: () => void;
    onCancel: () => void;
};

function SafeModal({ open, onCancel, onOk, acountInfo }: Props) {
    const router = useRouter();
    const [form] = Form.useForm();
    const [countdown, setCountdown] = useState(0);
    const [isCounting, setIsCounting] = useState(false);
    const [countdown2, setCountdown2] = useState(0);
    const [isCounting2, setIsCounting2] = useState(false);
    const [pointout, setPointout] = useState(false);
    const [loading, setLoading] = useState(false);
    const [codeLoading, setCodeLoading] = useState(false);
    const [codeInputValue, setCodeInputValue] = useState('');
    const [emailCodeInputValue, setEmailCodeInputValue] = useState('');
    const [phoneCodeInputValue, setPhoneCodeInputValue] = useState('');
    const [googleCodeInputValue, setGoogleCodeInputValue] = useState('');
    const { t } = useTranslation('login');
    // 添加 useAuth 钩子
    const { login } = useAuth();

    // 添加定时器的引用
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const timer2Ref = useRef<NodeJS.Timeout | null>(null);

    // 添加 ref 来存储上一次的账户信息，用于比较
    const prevAccountRef = useRef({
        type: '',
        email: '',
        phone: ''
    });

    // 清除定时器的函数
    const clearTimers = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (timer2Ref.current) {
            clearInterval(timer2Ref.current);
            timer2Ref.current = null;
        }
        // 重置状态
        setCountdown(0);
        setCountdown2(0);
        setIsCounting(false);
        setIsCounting2(false);
    };

    const handCancel = () => {
        clearTimers();
        onCancel();
    };
    // 获取浏览器指纹
    const getFingerprint = async () => {
        const result = await FingerprintJS.load();
        const visitorId = await result.get();
        console.log(visitorId);
        return visitorId.visitorId;
    };
    // 过滤输入，只允许数字和字母
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
        const { value } = e.target;
        // 只保留数字和字母
        const filteredValue = value.replace(/[^0-9]/g, '');
        // setEmailCodeInputValue(filteredValue);
        // form.setFieldsValue({ code: filteredValue });
        if (type === 'code') {
            setCodeInputValue(filteredValue);
            form.setFieldsValue({ code: filteredValue });
        } else if (type === 'phoneCode') {
            setPhoneCodeInputValue(filteredValue);
            form.setFieldsValue({ phoneCode: filteredValue });
        } else if (type === 'emailCode') {
            setEmailCodeInputValue(filteredValue);
            form.setFieldsValue({ emailCode: filteredValue });
        } else if (type === 'google') {
            setGoogleCodeInputValue(filteredValue);
            form.setFieldsValue({ googleCode: filteredValue });
        }
    };
    const handOk = async () => {
        form.validateFields()
            .then(async (values) => {
                // onOk()
                setLoading(true);
                try {
                    const fingerprint = await getFingerprint();
                    let dataInfo = {};
                    if (acountInfo.type === 'm') {
                        dataInfo = {
                            type: acountInfo.type,
                            email: acountInfo.email,
                            deviceType: fingerprint,
                            platformType: "Web",
                            password: acountInfo.password,

                            authCodeMail: values.code || '',

                            authCodeGoogle: values.googleCode || '',
                            authCodePhone: values.phoneCode || ''
                        }

                    } else if (acountInfo.type === 'p') {
                        dataInfo = {
                            type: acountInfo.type,
                            phone: acountInfo.phone,
                            deviceType: fingerprint,
                            platformType: "Web",
                            password: acountInfo.password,
                            countryCode: acountInfo.countryCode,

                            // authCodePhone: values.code,
                            // authCodeMail: values.emailCode || '',
                            // authCodeGoogle: values.googleCode || '',
                            authCodeMail: values.code || '',
                            authCodeGoogle: values.googleCode || '',
                            authCodePhone: values.phoneCode || ''

                        }
                    }
                    const dataEncrypt = await encryptData(dataInfo)
                    const res = await getLogin(dataEncrypt)
                    if (res.code === "0") {
                        toast.success(res.message)
                        store.setUserToken(res.data.token)
                        store.updateUserInfo({ ...res.data })
                        // 添加 useAuth 的登录方法
                        login(res.data.token)
                        router.push('/')
                        // 获取用户信息
                        // await getUserInfo()
                        // 更新网站配置
                        if (typeof window !== 'undefined') {
                            store.getKvConfigAllFromApi()
                            store.loadCoinList()
                            store.loadGetUserInfo()
                        }

                    } else {
                        toast.error(res.message)
                    }
                    setLoading(false);
                    handCancel()
                } catch (error) {
                    setLoading(false);
                    toast.error(String(error))
                }
            })
            .catch((info) => {
                console.log("Validate Failed:", info);
            });
    };
    // 获取用户信息
    const getUserInfo = async () => {
        try {
            const res = await getLoginUserInfo()
            if (res.code === "0") {
                const userInfo = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY.USER_INFO) || '{}')
                localStorage.setItem(LOCAL_STORAGE_KEY.USER_INFO, JSON.stringify(Object.assign({}, userInfo, res.data)))
            } else {
                toast.error(res.message)
            }
        } catch (error) {
            console.error(t('safeModal.getUserInfoError'), error);
        }
    }
    const getLoginCheckList = async () => {
        if (isCounting || isCounting2 || loading || codeLoading) return toast.error(t('safeModal.codeValid'))
        setCodeLoading(true);
        let param = {};
        if (acountInfo.type === 'm') {
            param = {
                account: acountInfo.email,
                type: acountInfo.type
            }

        } else if (acountInfo.type === 'p') {
            param = {
                account: acountInfo.phone,
                type: acountInfo.type
            }
        }
        const dataEncrypt = await encryptData(param)
        try {
            const res = await getLoginCheck(dataEncrypt)
            if (res.code === "0") {
                if (res.data.message) {
                    toast.success(res.data.message)
                } else {
                    toast.success(res.message)
                }
                clearTimers()
                // if (acountInfo.type === 'm') {
                //     startCountdown(acountInfo?.emailTime || 0);
                //     startCountdown2(acountInfo?.phoneTime || 0);
                //     // startCountdown(60);
                //     // startCountdown2(60);
                // } else if (acountInfo.type === 'p') {
                //     startCountdown(acountInfo?.phoneTime || 0);
                //     startCountdown2(acountInfo?.emailTime || 0);
                //     // startCountdown(60);
                //     // startCountdown2(60)
                // }
                startCountdown(60);
                startCountdown2(60);
            } else if (res.code === "10044") {
                toast.error(t('safeModal.codeValid'))
            } else {
                toast.error(res.message)
            }
        } catch (error) {
            toast.error(String(error))

        } finally {
            setCodeLoading(false);
        }

    }
    const getLoginCode = async () => {
        if (isCounting || loading || codeLoading) return
        setCodeLoading(true)
        try {
            // setSentCodeFlag(false)
            if (acountInfo.type === 'm') {
                const dataInfo = {
                    number: acountInfo.email || '',
                    // code: "",
                    deviceType: "web"
                };

                const dataEncrypt = await encryptData(dataInfo)
                const res = await getLoginMailCode(dataEncrypt);
                if (res.code === "0") {
                    toast.success(res.message)
                    startCountdown(60);
                } else if (res.code === "10044") {
                    toast.error(t('safeModal.codeValid'))
                } else {
                    toast.error(res.message)
                }
                setCodeLoading(false)
            } else if (acountInfo.type === 'p') {
                const dataInfo = {
                    number: acountInfo.phone || '',
                    code: acountInfo.countryCode?.replace("+", ""),
                    deviceType: "web"
                };
                const dataEncrypt = await encryptData(dataInfo)
                const res = await getLoginSmsCode(dataEncrypt);
                if (res.code === "0") {
                    toast.success(res.message)
                    startCountdown(60);
                } else if (res.code === "10044") {
                    toast.error(t('safeModal.codeValid'))
                } else {
                    toast.error(res.message)
                }
                setCodeLoading(false)
            }
        } catch (error) {
            setCodeLoading(false)
            toast.error(String(error))
            console.error(t('safeModal.getLoginCodeError'), error);

        }
    };
    const getLoginCode2 = async () => {
        getLoginCheckList()
    }
    const startCountdown = (count: number) => {
        if (count === 0) return;

        // 清除之前的定时器
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        setCountdown(count);
        setIsCounting(true);

        timerRef.current = setInterval(() => {
            setCountdown((prevCountdown) => {
                if (prevCountdown === 1) {
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                    }
                    setIsCounting(false);
                    return 0;
                }
                return prevCountdown - 1;
            });
        }, 1000);
    };
    const startCountdown2 = (count: number) => {
        if (count === 0) return;

        // 清除之前的定时器
        if (timer2Ref.current) {
            clearInterval(timer2Ref.current);
        }

        setCountdown2(count);
        setIsCounting2(true);

        timer2Ref.current = setInterval(() => {
            setCountdown2((prevCountdown) => {
                if (prevCountdown === 1) {
                    if (timer2Ref.current) {
                        clearInterval(timer2Ref.current);
                        timer2Ref.current = null;
                    }
                    setIsCounting2(false);
                    return 0;
                }
                return prevCountdown - 1;
            });
        }, 1000);
    };
    const handleOk = (event: boolean) => {
        if (event) {
            if ((acountInfo.openAll === 1 && acountInfo.isGoogleAuth === 1 && (acountInfo.isEmailAuth === 0 && acountInfo.isPhoneAuth === 0)) ||
                (acountInfo.openAll === 0 && acountInfo.isGoogleAuth === 1)) {
                return
            } else {
                getLoginCode2()
            }
        }
    }
    useEffect(() => {
        if (!open) {
            clearTimers();
            return;
        }

        // 使用新的时间开始倒计时
        // if (acountInfo.type === 'm') {
        //     startCountdown(acountInfo?.emailTime || 0);
        //     startCountdown2(acountInfo?.phoneTime || 0);
        // } else if (acountInfo.type === 'p') {
        //     startCountdown(acountInfo?.phoneTime || 0);
        //     startCountdown2(acountInfo?.emailTime || 0);
        // }
        startCountdown(60);
        startCountdown2(60);
        return () => {
            clearTimers();
        };
    }, [open, acountInfo.type, acountInfo.emailTime, acountInfo.phoneTime]);

    const ModalFooter: ModalProps["footer"] = () => {
        return (
            <div className="flex-col flex-ai-start mt-10 mb-3">
                {!loading ? (
                    <button
                        type="submit"
                        className={`${styles.modal_btn} btn-color`}
                        onClick={handOk}
                    >
                        {/* 确认 */}
                        {t('safeModal.confirm')}
                    </button>
                ) : (
                    <button
                        type="button"
                        className={`${styles.modal_btn} btn-disable login-loading`}
                    >
                        {/* 确认 */}
                        {t('safeModal.confirm')}
                    </button>
                )}
                <button
                    type="button"
                    className={`text_color mt-5`}
                    onClick={() => setPointout(true)}
                >
                    {/* 收不到验证码？ */}
                    {t('safeModal.cantReceive')}
                </button>
            </div>
        );
    };

    return (
        <ConfigProvider
            theme={{
                components: {
                    Form: {
                        // itemMarginBottom: 0, // 去除表单项之间的间距
                    },
                    Input: {
                        activeBorderColor: 'var(--theme-color)',
                        hoverBorderColor: 'var(--theme-color)',
                        controlHeightLG: 50,
                        activeBg: 'var(--background5)',
                        hoverBg: 'var(--background5)',
                    },
                    Modal: {
                        contentBg: "var(--background5)",
                        footerBg: "var(--background5)",
                        headerBg: "var(--background5)",
                    },

                },
                // token: {
                //     controlHeight: 40,
                // }
            }}
        >
            <Modal
                open={open}
                title={
                    <p className={`${styles.title_color}`}>
                        {/* 安全验证 */}
                        {t('safeModal.title')}
                    </p>
                }
                centered
                onCancel={handCancel}
                footer={ModalFooter}
                width={400}
                className={`modal_box`}
                maskClosable={false}
            >
                {/* <h4 className={`${styles.title_color} mt-7`}>
                    {acountInfo.type === 'm'
                        ? t('safeModal.emailCodeTitle')
                        : t('safeModal.phoneCodeTitle')
                    }
                </h4>
                <p className={`${styles.tip_color} mt-1`}>
                    {t('safeModal.codeSent')}
                    <span>&nbsp;
                        {acountInfo.type === 'm'
                            ? encryptEmail(acountInfo.email)
                            : encryptPhoneNumber(acountInfo.phone)
                        }
                    </span>
                </p> */}
                <Form form={form} style={{ margin: "10px 0" }} colon={false}>


                    {((acountInfo.openAll === 1 && acountInfo.isEmailAuth === 1) ||
                        (acountInfo.openAll === 0 && acountInfo.isGoogleAuth === 0 && acountInfo.isEmailAuth === 1))
                        && <>
                            <div className={`${styles.title_color} mb-3`}>{t('safeModal.emailCodeTitle')}</div>
                            <Form.Item
                                name="code"
                                rules={[{ required: true, message: t('safeModal.codeNull') }]}
                                className="position-relative"
                            >
                                <Input
                                    className={`${styles.input_box} modal-input`}
                                    style={{ width: "100%", height: "40px" }}
                                    placeholder={t('safeModal.inputPlaceholder')}
                                    value={codeInputValue}
                                    onChange={(e) => handleInputChange(e, 'code')}
                                    allowClear
                                    suffix={
                                        <button
                                            type="button"
                                            onClick={getLoginCode2}
                                            className={isCounting ? `${styles.tip_color}` : `${styles.text_color}`}
                                        >
                                            {/* 重新发送/60s 重发 */}
                                            {isCounting
                                                ? `${countdown} ${t('safeModal.resendCountdown')}`
                                                : t('safeModal.resend')
                                            }
                                        </button>
                                    }
                                    maxLength={6}
                                />
                            </Form.Item></>}
                    {((acountInfo.openAll === 1 && acountInfo.isPhoneAuth === 1) ||
                        (acountInfo.openAll === 0 && acountInfo.isGoogleAuth === 0 && acountInfo.isEmailAuth === 0 && acountInfo.isPhoneAuth === 1))
                        && <>
                            <div className={`${styles.title_color} mb-3`}>{t('safeModal.phoneCodeTitle')}</div>
                            <Form.Item
                                name="phoneCode"
                                rules={[{ required: true, message: t('safeModal.codeNull') }]}
                                className="position-relative"
                            >
                                <Input
                                    className={`${styles.input_box} modal-input`}
                                    style={{ width: "100%", height: "40px" }}
                                    placeholder={t('safeModal.inputPlaceholder')}
                                    allowClear
                                    value={phoneCodeInputValue}
                                    onChange={(e) => handleInputChange(e, 'phoneCode')}
                                    suffix={
                                        <button
                                            type="button"
                                            onClick={getLoginCode2}
                                            className={isCounting2 ? `${styles.tip_color}` : `${styles.text_color}`}
                                        >
                                            {/* 重新发送/60s 重发 */}
                                            {isCounting2
                                                ? `${countdown2} ${t('safeModal.resendCountdown')}`
                                                : t('safeModal.resend')
                                            }
                                        </button>
                                    }
                                    maxLength={6}
                                />
                            </Form.Item>
                        </>}

                    {((acountInfo.openAll === 1 && acountInfo.isGoogleAuth === 1) || (acountInfo.openAll === 0 && acountInfo.isGoogleAuth === 1)) && <>
                        <div className={`${styles.title_color} mb-3`}>{t('safeModal.googleCodeTitle')}</div>
                        <Form.Item
                            name="googleCode"
                            rules={[{ required: true, message: t('safeModal.codeNull') }]}
                            className="position-relative"
                        >
                            <Input
                                className={`${styles.input_box} modal-input`}
                                style={{ width: "100%", height: "40px" }}
                                placeholder={t('safeModal.inputPlaceholder')}
                                allowClear
                                maxLength={6}
                                value={googleCodeInputValue}
                                onChange={(e) => handleInputChange(e, 'google')}
                            />
                        </Form.Item>
                    </>}
                    {/* {(acountInfo.type === 'p' &&acountInfo.openAll === 1 && acountInfo.isEmailAuth === 1) 
                    && <>
                        <div className={`${styles.title_color} mb-3`}>{t('safeModal.emailCodeTitle')}</div>
                        <Form.Item
                            name="emailCode"
                            rules={[{ required: true, message: t('safeModal.codeNull') }]}
                            className="position-relative"
                        >
                            <Input
                                className={`${styles.input_box} modal-input`}
                                style={{ width: "100%", height: "40px" }}
                                placeholder={t('safeModal.inputPlaceholder')}
                                allowClear
                                suffix={
                                    <button
                                        type="button"
                                        onClick={getLoginCode2}
                                        className={isCounting2 ? `${styles.tip_color}` : `${styles.text_color}`}
                                    >
                                        {isCounting2
                                            ? `${countdown2} ${t('safeModal.resendCountdown')}`
                                            : t('safeModal.resend')
                                        }
                                    </button>
                                }
                                value={emailCodeInputValue}
                                onChange={(e) => handleInputChange(e, 'emailCode')}
                                maxLength={6}
                            />
                        </Form.Item>
                    </>} */}
                </Form>
                {!((acountInfo.openAll === 1 && acountInfo.isGoogleAuth === 1 && (acountInfo.isEmailAuth === 0 && acountInfo.isPhoneAuth === 0)) ||
                    (acountInfo.openAll === 0 && acountInfo.isGoogleAuth === 1)) && <QuestionModal
                        open={pointout}
                        onOk={handleOk}
                        type={acountInfo.type}
                        acount={
                            acountInfo.type === "m"
                                ? (acountInfo.email || "")
                                : acountInfo.type === "p"
                                    ? (acountInfo.phone || "")
                                    : ""
                        }
                        onCancel={() => setPointout(false)}
                    />}
            </Modal>
        </ConfigProvider>
    );
}

export default SafeModal;
