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
import {useCopyToClipboard} from '@/hooks/use-copy-to-clipboard';
import { getGoogleKey,bindGoogle } from '@/services/safeCenter'
// import {
//     getSmsCode,
//     getEmailCode,
//     unbindGoogle
// } from '@/services/safeCenter'
import { toast } from "sonner";
import { encryptData, encryptEmail, encryptPhoneNumber } from "@/utils/encrypt";
import { useTranslation } from 'next-i18next';
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
    const [codeInputValue, setCodeInputValue] = useState('');
    const [secretKey, setSecretKey] = useState({
        secretKey: '',
        codeUri: ''
    })
    const { t } = useTranslation(['userCenter']);
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
                        googleCode: values.googleCode || '',
                        platformType:'Web'
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
        // 过滤输入，只允许数字和字母
        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const { value } = e.target;
            // 只保留数字和字母
            const filteredValue = value.replace(/[^0-9]/g, '');
            setCodeInputValue(filteredValue);
            form.setFieldsValue({ googleCode: filteredValue });
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
            title: <p className={`${styles.tip_title}`}>
                {/* Android/iOS 谷歌验证器下载 */}
                {t('security.bindGoogle.title1')}
                </p>,
            description: <div>
                <p className={`${styles.tip_color} font-12 font-w-400`}>{t('security.bindGoogle.tip1')}</p>
                <p className={`${styles.tip_color} font-12 font-w-400 mt-1`}>{t('security.bindGoogle.tip2')}</p>
            </div>,

        },
        {
            title: <p className={`${styles.tip_title}`}>
                {/* 在谷歌验证器中添加密钥并备份 */}
                {t('security.bindGoogle.title2')}
            </p>,
            description: <div>
                <p className={`${styles.tip_color} font-12 font-w-400`}>{t('security.bindGoogle.tip3')}</p>
                <p className={`error_icon font-12 font-w-400 mt-1`}>
                    <Iconify icon="mingcute:warning-fill" size={12} />
                    {t('security.bindGoogle.tip4')}
                </p>
                <div className={`flex-x align-end mt-1`}>
                    <QRCode
                        style={{ backgroundColor: "#fff", padding: "6px", minWidth: "68px" }}
                        value={`${secretKey.codeUri || ''}`} size={68}
                    />
                    <div className={`${styles.tip_title} ml-4`}>
                        <p className={`${styles.tip_title} font-12 font-w-400`}>{t('security.bindGoogle.copyKey')}</p>
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
            title: <p className={`${styles.tip_title}`}>
                {/* 验证谷歌验证码 */}
                {t('security.bindGoogle.title3')}
            </p>,
            description: <div>
                <ConfigProvider
                    theme={{
                        components: {
                            Form: {
                                itemMarginBottom: 0, // 去除表单项之间的间距
                            },
                            Input: {
                                activeBorderColor: 'var(--theme-color)',
                                hoverBorderColor: 'var(--theme-color)',
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
                        <Form.Item name="googleCode" rules={[{ required: true, message: t('security.bindGoogle.googleCodeNull') }]}>
                            <Input placeholder={t('security.bindGoogle.googleCodeNull')}
                                style={{width:'90%'}}
                                className={`${styles.authcode_input} ${styles.input_box} modal-input2`} 
                                maxLength={6}
                                value={codeInputValue}
                                onChange={handleInputChange}
                                />
                        </Form.Item>
                    </Form>
                </ConfigProvider>

            </div>,

        },
    ]
    const onNextSetup = () => {
        setCurrent(current + 1);
    }
    // const onPrevSetup = () => {
    //     setCurrent(current - 1);
    // }
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
                        {/* 下一步 */}
                        {t('security.bindGoogle.next')}
                    </button>
                )}
                {current === steps.length - 1 && (
                    <button
                        type="submit"
                        className={`${styles.modal_footerBtn2} default_btn mt-4 mb-6 mr-5`}
                        onClick={handOk}
                    >
                        {/* 绑定 */}
                        {t('security.bindGoogle.bind')}
                    </button>
                )}
                <button
                    type="submit"
                    className={`${styles.modal_footerBtn2}  cancel_btn2 mt-4 mb-6`}
                    onClick={handCancel}
                >
                    {/* 取消 */}
                    {t('security.bindGoogle.cancel')}
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
                    {/* 输入验证码开启谷歌验证器 */}
                    {t('security.bindGoogle.modalTitle')}
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
                maskClosable={false}
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
