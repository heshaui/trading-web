import { Modal, ConfigProvider, Form, Input ,AutoComplete} from "antd";
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
import { bindEmail, getEmailCode } from '@/services/safeCenter'
import { toast } from "sonner";
import { encryptData } from "@/utils/encrypt";
import type { AutoCompleteProps } from 'antd';
import { emailSuffixes } from "@/utils/enum";

type Props = {
    open: boolean;
    // onOk?: (event: boolean) => void;
    onOk?: () => void;
    onCancel: () => void;
    type: string;
};

function SetPhoneModal({ open, onCancel, type }: Props) {
    // const router = useRouter();
    const [isCounting, setIsCounting] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [firstCheck, setFirstCheck] = useState(true);
    const [loading, setLoading] = useState(false); // 按钮loading
    const [codeLoading, setCodeLoading] = useState(false); // 验证码loading
    const [options, setOptions] = useState<AutoCompleteProps['options']>([]);

    const [form] = Form.useForm();

    const handCancel = () => {
        form.resetFields();
        // setFirstCheck(true)
        onCancel()
    };

    const handOk = async () => {
        // 这里可以添加点击验证码弹窗确认按钮后的处理逻辑
        form.validateFields()
            .then(async (values) => {
                // console.log(values);
                if (firstCheck) return toast.error('请先发送验证码')
                try {
                    let params = {}
                    if (type === 'set') {
                        params = {
                            isPhoneAuth: 1,
                            email: values.email,
                            code: values.code,
                            googleCode: values.googleCode
                        }

                    } else if (type === 'change') {
                        params = {
                            phoneStatus: 1,
                            email: values.email,
                            code: values.code
                        }

                    }
                    console.log(params, 11);

                    const dataEncrypt = await encryptData(params)
                    const res = await bindEmail(dataEncrypt)
                    if (res.code === '0') {
                        toast.success(res.data)
                        handCancel()
                    } else {
                        toast.error(res.message)
                    }
                } catch (error) {
                    toast.error(String(error))
                }
            });
    };
    const getMailCode = async () => {
        if (isCounting || loading || codeLoading) return
        const number = form.getFieldValue('email')
        if (!number) return toast.error('请先输入邮箱！')
        setCodeLoading(false)
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
                    保存
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
                    },
                    Select:{
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
                title={<p className={`${styles.title}`} >{type === 'set' ? '设置邮箱' : '修改邮箱'}</p>}
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
                        <div className={`font-16 font-w-400 mb-2_5 ${styles.tip_title}`}>邮箱</div>
                        <Form.Item name="email" rules={[{ required: true, message: "邮箱不能为空！" }]}>
                            {/* <Input placeholder="请输入新邮箱" allowClear={true} className={`${styles.input_box} modal-input `} /> */}
                            <AutoComplete
                                onSearch={handleSearch}
                                // placeholder="请输入手机/邮箱"
                                placeholder="请输入邮箱"
                                options={options}
                                allowClear={true}
                                backfill={true}
                                className={`${styles.input_box} autoComplete-custom custom-sleect`}
                            // onChange={getValue}
                            />
                        </Form.Item>
                        <div className={`font-16 font-w-400 mb-2_5 mt-5 ${styles.tip_title}`}>新邮箱验证</div>
                        <Form.Item name="code" rules={[{ required: true, message: "验证码不能为空！" }]}>
                            <Input
                                allowClear
                                placeholder="请输入验证码"
                                // prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                                suffix={
                                    <button type='button' className={isCounting ? `${styles.tip_color1_input}` : `${styles.text_color}`} onClick={getMailCode}>
                                        {isCounting ? `${countdown}s 重发` : firstCheck ? <span className={`${styles.default_color}`}>发送验证码</span> : "重新发送"}
                                    </button>
                                }
                                className={`${styles.authcode_input} ${styles.input_box} modal-input`}
                                style={{ borderRadius: "8px" }}
                            />
                            {/* <button className='text-color mt-1'>粘贴</button> */}
                        </Form.Item>
                        {type === 'set' && <>
                            <div className={`font-16 font-w-400 mb-2_5 mt-5 ${styles.tip_title}`}>谷歌验证码</div>
                            <Form.Item noStyle name="googleCode" rules={[{ required: true, message: "谷歌验证码不能为空！" }]}>
                                <Input placeholder="请输入谷歌验证码" allowClear={true} className={`${styles.input_box} modal-input`} />
                            </Form.Item>
                        </>}

                    </Form>

                </div>
            </Modal>
        </ConfigProvider>
    );
}

export default SetPhoneModal;
