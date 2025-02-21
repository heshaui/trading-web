"use client";
import { Modal, Form, Input } from "antd";
import {  useState, useEffect } from "react"; //type CSSProperties,
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
import {encryptData} from "@/utils/encrypt";


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

function SafeModal({ open,  onCancel, acountInfo }: Props) {
    const router = useRouter();
    const [form] = Form.useForm();
    const [countdown, setCountdown] = useState(0);
    const [isCounting, setIsCounting] = useState(false);
    const [pointout, setPointout] = useState(false);
    const [loading, setLoading] = useState(false);
    const [codeLoading, setCodeLoading] = useState(false);
    useEffect(() => {
        if (open) {
            // if (open) {
            getLoginCode()
        }
    }, [open])
    const handCancel = () => {
        onCancel()
    };

    const handOk = async () => {
        form.validateFields()
            .then(async (values) => {
                // onOk()
                setLoading(true);
                try {
                    let dataInfo = {};
                    if (acountInfo.type === 'm') {
                        dataInfo = {
                            type: acountInfo.type,
                            email: acountInfo.email,
                            deviceType: acountInfo.deviceType,
                            password: acountInfo.password,
                            authCodeMail: values.code,
                        }

                    } else if (acountInfo.type === 'p') {
                        dataInfo = {
                            type: acountInfo.type,
                            phone: acountInfo.phone,
                            deviceType: acountInfo.deviceType,
                            password: acountInfo.password,
                            authCodePhone: values.code,
                        }
                    }
                    const dataEncrypt =await encryptData(dataInfo)
                    const res = await getLogin(dataEncrypt)
                    if (res.code === "0") {
                        toast.success(res.message)
                        store.setUserToken(res.data.token)
                        router.push('/')
                    }else{
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
    const getLoginCode = async () => {
        if (isCounting||loading||codeLoading) return
        setCodeLoading(true)
        try {
            // setSentCodeFlag(false)
            if (acountInfo.type === 'm') {
                const dataInfo = {
                    number: acountInfo.email || '',
                    // code: "",
                    deviceType: "web"
                };
                const dataEncrypt =await encryptData(dataInfo)
                const res = await getLoginMailCode(dataEncrypt);
                if (res.code === "0") {
                    toast.success(res.message)
                    startCountdown();
                } else if (res.code === "10044") {
                    toast.error(res.message)
                }
                setCodeLoading(false)
            } else if (acountInfo.type === 'p') {
                const dataInfo = {
                    number: acountInfo.phone || '',
                    code: acountInfo.countryCode?.replace("+", ""),
                    deviceType: "web"
                };
                const dataEncrypt =await encryptData(dataInfo)
                const res = await getLoginSmsCode(dataEncrypt);
                if (res.code === "0") {
                    toast.success(res.message)
                    startCountdown();
                } else if (res.code === "10044") {
                    toast.error('验证码还在有效期内')
                }else{
                    toast.error(res.message)
                }
                setCodeLoading(false)
            }
        } catch (error) {
            setCodeLoading(false)
            toast.error(String(error))
            console.error('获取验证码出错:', error);

        }
    }
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
                </button>) : (<button type="button" className={`${styles.modal_btn} btn-color login-loading`}>
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
        <Modal
            open={open}
            title="安全验证"
            centered
            onCancel={handCancel}
            footer={ModalFooter}
            width={400}
        >
            <h4 className={`${styles.title_color} mt-7`}>{acountInfo.type == 'm' ? '邮箱验证码' : "手机验证码"}</h4>
            <p className={`${styles.tip_color} mt-1`}>验证码已发送至
                <span>&nbsp;{acountInfo.type == 'm' ? encryptEmail(acountInfo.email) : encryptPhoneNumber(acountInfo.phone)}</span>
            </p>
            <Form form={form} style={{ margin: "10px 0" }} colon={false}>
                <Form.Item name="code" rules={[{ required: true, message: "不能为空！" }]} className="position-relative">
                    <Input
                        className="custom-input mb-2"
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
                onOk={() => setPointout(false)}
                type={acountInfo.type}
                acount={
                    acountInfo.type === "m" ? (acountInfo.email || "") :
                        acountInfo.type === "p" ? (acountInfo.phone || "") : ""
                }
                onCancel={() => setPointout(false)} />
        </Modal>
    );
}

export default SafeModal;
