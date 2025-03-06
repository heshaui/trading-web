import { Modal, ConfigProvider, Form, Input } from "antd";
// import { type CSSProperties, useState, useEffect } from "react";;
import type { ModalProps } from "antd/es/modal/interface";
// import { Iconify } from "@/components/icon/index";
// import store from "@/store"
// import { useRouter } from 'next/router';
import styles from "./styles/nickname.module.css";
import Image from 'next/image'
import { Iconify } from "@/components/icon/index";
import { updateUserCenter } from '@/services/userCenter';
import dayjs from 'dayjs';
import { toast } from "sonner";
type Props = {
    open: boolean;
    userId: number;
    // onOk?: (event: boolean) => void;
    onOk: (bool: boolean) => void;
    onCancel: () => void;
};

function BirthdayModal({ open, onCancel, userId, onOk }: Props) {
    // const router = useRouter();
    const [form] = Form.useForm();

    const handCancel = () => {
        // form.resetFields();
        onCancel()
    };

    const handOk = async () => {
        // 这里可以添加点击验证码弹窗确认按钮后的处理逻辑
        form.validateFields()
            .then(async (values) => {
                console.log(values);
                const params = {
                    userId: userId,
                    birthday: dayjs(values.birthday).valueOf() + '' 
                }

                try {
                    const res = await updateUserCenter(params);
                    if(res.code === '0'){
                        toast.success('生日修改成功');
                        onOk(true)
                        onCancel()
                    }

                } catch (error) {

                }

            });
    };
    const ModalFooter: ModalProps["footer"] = () => {

        return (
            <div className="flex-x align-center justify-end" >
                <button
                    type="button"
                    className={`${styles.modal_footerBtn} cancel_btn2 mr-5 font-14 font-w-500`}
                    onClick={handCancel}
                >
                    取消
                </button>
                <button
                    type="submit"
                    className={`${styles.modal_footerBtn} default_btn`}
                    onClick={handOk}
                >
                    保存
                </button>
            </div>
        );
    };
    // 自定义验证规则
    const validatePassword = (_: any, value: string) => {
        if (typeof value === 'string') {
            value = value.trim();
        }
        if (!value) {
            return Promise.reject(new Error("请输入生日!"));
        }
        const validFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY/MM/DD']
        let isValid = false;

        validFormats.forEach((format) => {
            if (dayjs(value, format, true).isValid()) {
                isValid = true;
            }
        });

        if (!isValid) {
            return Promise.reject(new Error("请输入有效的日期格式（年/月/日）！"));
        }

        return Promise.resolve();
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
                    Modal:{
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
                title={<p className={`${styles.title}`} >添加生日</p>}
                centered
                onCancel={handCancel}
                footer={ModalFooter}
                width={440}
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
                    // initialValues={{ nickname: nickname||'' }}
                    >
                        <Form.Item name="birthday" rules={[
                            { validator: validatePassword }
                        ]}>
                            <Input placeholder="年/月/日"
                                className={`${styles.input_box} modal-input`}
                                maxLength={13}
                                suffix={
                                    <Iconify icon="cuida:calendar-outline" className={`${styles.suffix_icon} mr-1`} />
                                }
                            />
                        </Form.Item>
                        <ul className={`${styles.msg_color} mt-2_5 font-12 font-w-400`}>
                            <li className="flex align-base ">
                                请您输入正确日期，填写后将无法修改。
                            </li>
                        </ul>
                    </Form>

                </div>
            </Modal>
        </ConfigProvider>
    );
}

export default BirthdayModal;
