/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { Modal, Form, Input, ConfigProvider } from "antd";
import { useState, useEffect } from "react"; //type CSSProperties,
import type { ModalProps } from "antd/es/modal/interface";
// import { Iconify } from "@/components/icon/index";
import store from "@/store"
import { toast } from "sonner";
import { useRouter } from 'next/router';
import styles from "./style/safeModal.module.css";
import { encryptEmail, encryptPhoneNumber } from "@/utils/encrypt";
import QuestionModal from "@/components/myModal/questionModal";
import { getLogin, getLoginMailCode, getLoginSmsCode, } from "@/services/login";
// import { encryptWithPublicKey } from "@/utils/jsENcrypy"; //登录加密
import { encryptData } from "@/utils/encrypt";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { useAuth } from "@/context/AuthContext";
import {getLoginUserInfo} from "@/services/userCenter"
import { LOCAL_STORAGE_KEY } from "@/config/apiConfig";
import { useTranslation } from 'next-i18next';
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
}
type Props = {
    open: boolean;
    // acount?: string | null;
    acountInfo: acountType;
    // type?: string | null; //onOk, acount, type,
    // onOk?: () => void;
    onCancel: () => void;
};

function SafeModal({ open, onCancel, acountInfo }: Props) {
    const router = useRouter();
    const [form] = Form.useForm();
    const [countdown, setCountdown] = useState(0);
    const [isCounting, setIsCounting] = useState(false);
    const [pointout, setPointout] = useState(false);
    const [loading, setLoading] = useState(false);
    const [codeLoading, setCodeLoading] = useState(false);
    const { t } = useTranslation('login');
    // 添加 useAuth 钩子
    const { login } = useAuth();

    const handCancel = () => {
        onCancel()
    };
	// 获取浏览器指纹
	const getFingerprint = async () => {
		const result = await FingerprintJS.load();
		const visitorId = await result.get();
		// console.log(visitorId);
		return visitorId.visitorId;
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
                            password: acountInfo.password,
                            authCodeMail: values.code,
                        }

                    } else if (acountInfo.type === 'p') {
                        dataInfo = {
                            type: acountInfo.type,
                            phone: acountInfo.phone,
                            deviceType: fingerprint,
                            password: acountInfo.password,
                            authCodePhone: values.code,
                            countryCode: acountInfo.countryCode
                        }
                    }
                    const dataEncrypt = await encryptData(dataInfo)
                    const res = await getLogin(dataEncrypt)
                    if (res.code === "0") {
                        toast.success(t('loginsuccess'))
                        store.setUserToken(res.data.token)
                        store.updateUserInfo({ ...res.data })
                        // 添加 useAuth 的登录方法
                        login(res.data.token)
                        router.push('/')
                        // 获取用户信息
                        await getUserInfo()

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
           if(res.code === "0"){
            const userInfo = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY.USER_INFO) || '{}')
            localStorage.setItem(LOCAL_STORAGE_KEY.USER_INFO, JSON.stringify(Object.assign({}, userInfo, res.data)))
           }else{
            toast.error(res.message)
           }
        } catch (error) {
            console.error(t('safeModal.getUserInfoError'), error);
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
                    deviceType: "Web"
                };

                const dataEncrypt = await encryptData(dataInfo)
                const res = await getLoginMailCode(dataEncrypt);
                if (res.code === "0") {
                    toast.success(t('success'))
                    startCountdown(res.data);
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
                    deviceType: "Web"
                };
                const dataEncrypt = await encryptData(dataInfo)
                const res = await getLoginSmsCode(dataEncrypt);
                if (res.code === "0") {
                    toast.success(t('success'))
                    startCountdown(res.data);
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
    };
    const handleOk = (event: boolean) => {
        if (event) {
            getLoginCode()
        }
    }
    useEffect(() => {
        if (open) {
            getLoginCode()
        }
    }, [open])
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
                    className={`text-color  mt-5`}
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
            >
                <h4 className={`${styles.title_color} mt-7`}>
                    {/* 邮箱验证码/手机验证码 */}
                    {acountInfo.type === 'm' 
                        ? t('safeModal.emailCodeTitle') 
                        : t('safeModal.phoneCodeTitle')
                    }
                </h4>
                <p className={`${styles.tip_color} mt-1`}>
                    {/* 验证码已发送至 */}
                    {t('safeModal.codeSent')}
                    <span>&nbsp;
                        {acountInfo.type === 'm' 
                            ? encryptEmail(acountInfo.email) 
                            : encryptPhoneNumber(acountInfo.phone)
                        }
                    </span>
                </p>
                <Form form={form} style={{ margin: "10px 0" }} colon={false}>
                    <Form.Item 
                        name="code" 
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
                                    onClick={getLoginCode} 
                                    className={isCounting ? `${styles.tip_color}` : `${styles.text_color}`}
                                >
                                    {/* 重新发送/60s 重发 */}
                                    {isCounting 
                                        ? `${countdown} ${t('safeModal.resendCountdown')}`
                                        : t('safeModal.resend')
                                    }
                                </button>
                            }
                        />
                    </Form.Item>
                </Form>
                <QuestionModal
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
                />
            </Modal>
        </ConfigProvider>
    );
}

export default SafeModal;
