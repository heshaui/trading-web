import { Modal, ConfigProvider, Form, Input, Steps, QRCode } from "antd";
// import { type CSSProperties, useState, useEffect } from "react";;
import type { ModalProps } from "antd/es/modal/interface";
// import { Iconify } from "@/components/icon/index";
// import store from "@/store"
// import { useRouter } from 'next/router';
import styles from "./styles/setGoogle.module.css";
// import Image from 'next/image'
import { Iconify } from "@/components/icon/index";
// import PhoneCodeSelector from "@/components/PhoneCodeSelector"
import { useState, useEffect } from "react";
import useCopyToClipboard from '@/hooks/use-copy-to-clipboard';
import { getGoogleKey,bindGoogle } from '@/services/safeCenter'
import {
    getSmsCode,
    getEmailCode,
    unbindGoogle
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
    onOk: () => void;
    onCancel: () => void;
    type?: string;
    acountInfo: SafeDataType;
};

function BindGoogleModal({ open, onCancel, type, onOk, acountInfo }: Props) {
    // const router = useRouter();
    const [firstCheck, setFirstCheck] = useState(true);
    const [firstCheck2, setFirstCheck2] = useState(true);
    const [loading, setLoading] = useState(false); // 按钮loading
    const [qrCodeLoading, setQrCodeLoading] = useState('loading');// 二维码loading
    const [current, setCurrent] = useState(0);
    const [secretKey, setSecretKey] = useState({
        secretKey: '',
        codeUri: ''
    })
    const [codeValue] = useState("https://ant.design") //, setcodeValue
    const { copyFn } = useCopyToClipboard();

    const [form] = Form.useForm();


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
                        code: values.googleCode || ''
                    }
                    const dataEncrypt = await encryptData(params)
                    const res = await bindGoogle(dataEncrypt)
                    if (res.code === "0") {
                        toast.success(res.message)
                        onOk()
                        handCancel()
                        setCurrent(0)
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

    const getGoogleKeyData = async () => {
        try {

            const res = await getGoogleKey()
            if (res.code === "0") {
                setSecretKey({
                    secretKey: res.data.secretKey,
                    codeUri: res.data.codeUri
                })
            } else {
                toast.error(res.message)
            }

        } catch (error) {
            toast.error(String(error))
        }
    }

    const steps = [
        {
            title: <p className={`${styles.tip_title}`}>Android/iOS 谷歌验证器下载</p>,
            description: <div>
                <p className={`${styles.tip_color} font-12 font-w-400`}>i0S用户在App Store搜索"Authenticator"下载</p>
                <p className={`${styles.tip_color} font-12 font-w-400 mt-1`}>Andriod用户在应用商店或手机浏览器搜索"谷歌验证器"下载</p>
            </div>,

        },
        {
            title: <p className={`${styles.tip_title}`}>在谷歌验证器中添加密钥并备份</p>,
            description: <div>
                <p className={`${styles.tip_color} font-12 font-w-400`}>打开谷歌验证器，扫描下方二维码或手动输入下述密钥添加验证令牌</p>
                <p className={`error_icon font-12 font-w-400 mt-1`}>
                    <Iconify icon="mingcute:warning-fill" size={12} />
                    密钥用于手机更换或丢失时找回谷歌验证器，绑定前请务必将下述密钥备份保存。
                </p>
                <div className={`flex-x align-end mt-1`}>
                    <QRCode
                        style={{ backgroundColor: "#fff", padding: "6px", minWidth: "68px" }}
                        value={`${secretKey.codeUri || ''}`} size={68}
                    />
                    <div className={`${styles.tip_title} ml-4`}>
                        <p className={`${styles.tip_title} font-12 font-w-400`}>复制密钥</p>
                        <div className={`${styles.invite_code} font-12 mt-1`}>
                            <span className={`${styles.tip_color} mr-2`}>{secretKey.secretKey || '--'}</span>
                            <Iconify icon="bx:copy" className={`${styles.tip_title} cursor-pointer`} size={20}
                                onClick={() => copyFn(secretKey.secretKey || '')}
                            />
                        </div>

                    </div>
                </div>
            </div>,

        },
        {
            title: <p className={`${styles.tip_title}`}>验证谷歌验证码</p>,
            description: <div>
                <ConfigProvider
                    theme={{
                        components: {
                            Form: {
                                itemMarginBottom: 0, // 去除表单项之间的间距
                            },
                            Input: {
                                activeBorderColor: '#FF5F1F',
                                hoverBorderColor: '#FF5F1F',
                                controlHeightLG: 50,
                                activeBg: 'var(--background5)',
                                hoverBg: 'var(--background5)',
                            },
                            Steps:{

                            }
                        }
                    }}
                >
                    <Form form={form} layout="vertical" className="mt-2_5">
                        <Form.Item name="googleCode" rules={[{ required: true, message: '请输入谷歌验证码' }]}>
                            <Input placeholder="请输入谷歌验证码"
                                style={{width:'90%'}}
                                className={`${styles.authcode_input} ${styles.input_box} modal-input2`} />
                        </Form.Item>
                    </Form>
                </ConfigProvider>

            </div>,

        },
    ]
    const onNextSetup = () => {
        setCurrent(current + 1);
    }
    const onPrevSetup = () => {
        setCurrent(current - 1);
    }
    useEffect(() => {
        if (open) {
            getGoogleKeyData()
        }
    }, [open])
    const ModalFooter: ModalProps["footer"] = () => {

        return (
            <div className="flex-x-cc" style={{width:'100%'}}>
                <div className="flex-x align-center justify-end" style={{width:'80%'}}>


                {current < steps.length - 1 && (
                    <button
                        type="submit"
                        className={`${styles.modal_footerBtn2} default_btn mt-4 mb-6 mr-5`}
                        onClick={onNextSetup}
                    >
                        下一步
                    </button>
                )}
                {current === steps.length - 1 && (
                    <button
                        type="submit"
                        className={`${styles.modal_footerBtn2} default_btn mt-4 mb-6 mr-5`}
                        onClick={handOk}
                    >
                        绑定
                    </button>
                )}
                <button
                    type="submit"
                    className={`${styles.modal_footerBtn2}  cancel_btn2 mt-4 mb-6`}
                    onClick={handCancel}
                >
                    取消
                </button>
                </div>
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
                title={<p className={`${styles.title}`} >输入验证码开启谷歌验证器
                    {/* {type}{acountInfo.type}  */}
                </p>}
                centered
                onCancel={handCancel}
                footer={ModalFooter}
                width={545}
                className={`modal_box`}
                classNames={{
                    content: styles.modal_content,
                    body: styles.modal_body,
                    footer: styles.modal_footer,
                }}
            >
                <div className="flex-col flex-ai-center" style={{ width: "100%" }}>
                    <Steps
                        direction="vertical"
                        current={current}
                        labelPlacement="vertical"
                        items={steps} />
                    {/* {items[current].content} */}
                </div>
            </Modal>
        </ConfigProvider>
    );
}

export default BindGoogleModal;
