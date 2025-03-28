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
    // 添加 useAuth 钩子
    const { login } = useAuth();

    const handCancel = () => {
        onCancel()
    };
	// 获取浏览器指纹
	const getFingerprint = async () => {
		const result = await FingerprintJS.load();
		const visitorId = await result.get();
		console.log(visitorId);
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
                        toast.success(res.message)
                        store.setUserToken(res.data.token)
                        // store.updateUserInfo({ ...res.data })
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
            localStorage.setItem(LOCAL_STORAGE_KEY.USER_INFO,JSON.stringify(res.data))
           }else{
            toast.error(res.message)
           }
        } catch (error) {
            console.error('获取用户信息出错:', error);
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
                    startCountdown();
                } else if (res.code === "10044") {
                    toast.error('验证码还在有效期内')
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
                    startCountdown();
                } else if (res.code === "10044") {
                    toast.error('验证码还在有效期内')
                } else {
                    toast.error(res.message)
                }
                setCodeLoading(false)
            }
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
                {/* <button
                    type="submit"
                    className={`${styles.modal_btn} btn-color`}
                    onClick={handOk}
                >
                    确认
                </button> */}
                {!loading ? (<button type="submit" className={`${styles.modal_btn} btn-color`}
                    onClick={handOk}>
                    确认
                </button>) : (<button type="button" className={`${styles.modal_btn} btn-disable login-loading`}>
                    确认
                </button>
                )}
                <button
                    type="button"
                    className={`${styles.text_color} mt-5`}
                    onClick={() => setPointout(true)}
                >
                    收不到验证码？
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
                        activeBorderColor: '#FF5F1F',
                        hoverBorderColor: '#FF5F1F',
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
                title={<p className={`${styles.title_color}`}>安全验证</p>}
                centered
                onCancel={handCancel}
                footer={ModalFooter}
                width={400}
                className={`modal_box`}
            >
                <h4 className={`${styles.title_color} mt-7`}>{acountInfo.type == 'm' ? '邮箱验证码' : "手机验证码"}</h4>
                <p className={`${styles.tip_color} mt-1`}>验证码已发送至
                    <span>&nbsp;{acountInfo.type == 'm' ? encryptEmail(acountInfo.email) : encryptPhoneNumber(acountInfo.phone)}</span>
                </p>
                <Form form={form} style={{ margin: "10px 0" }} colon={false}>
                    <Form.Item name="code" rules={[{ required: true, message: "不能为空！" }]} className="position-relative">
                        <Input
                            className={`${styles.input_box} modal-input`}
                            style={{ width: "100%", height: "40px" }}
                            placeholder="请输入"
                            allowClear
                            suffix={
                                <button type="button" onClick={getLoginCode} className={isCounting ? `${styles.tip_color}` : `${styles.text_color}`} >
                                    {isCounting ? `${countdown}s 重发` : "重新发送"}
                                    {/* {isCounting ? t("sys.login.sendSmsText", { second: countdown }) : t("sys.getcode")} */}
                                </button>
                            }
                        />
                        {/* <span className={`${styles.text_color} ${styles.code_err}`}>验证码错误</span> */}
                    </Form.Item>
                </Form>
                <QuestionModal
                    open={pointout}
                    onOk={handleOk}
                    type={acountInfo.type}
                    acount={
                        acountInfo.type === "m" ? (acountInfo.email || "") :
                            acountInfo.type === "p" ? (acountInfo.phone || "") : ""
                    }
                    onCancel={() => setPointout(false)} />
            </Modal>
        </ConfigProvider>
    );
}

export default SafeModal;
