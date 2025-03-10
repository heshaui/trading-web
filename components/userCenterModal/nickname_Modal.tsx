import { Modal, ConfigProvider, Form, Input } from "antd";
// import { type CSSProperties, useState, useEffect } from "react";;
import type { ModalProps } from "antd/es/modal/interface";
// import { Iconify } from "@/components/icon/index";
// import store from "@/store"
// import { useRouter } from 'next/router';
import styles from "./styles/nickname.module.css";
import Image from 'next/image'
import { Iconify } from "@/components/icon/index";
type Props = {
    open: boolean;
    nickname: string|null;
    // onOk?: (event: boolean) => void;
    onOk?: () => void;
    onCancel: () => void;
};

function NicknameModal({ open, onCancel ,nickname}: Props) {
    // const router = useRouter();
    const [form] = Form.useForm();

    const handCancel = () => {
        form.resetFields();
        onCancel()
    };

    const handOk = async () => {
        // 这里可以添加点击验证码弹窗确认按钮后的处理逻辑
        form.validateFields()
            .then((values) => {
                console.log(values);
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
                        activeBg:'var(--background5)',
                        hoverBg:'var(--background5)',
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
                title={<p className={`${styles.title}`} >修改昵称</p>}
                centered
                onCancel={handCancel}
                footer={ModalFooter}
                width={500}
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
                        initialValues={{ nickname: nickname||'' }}
                    >
                        <Form.Item name="nickname" rules={[{ required: true,message: '请输入昵称!' }]}>
                            <Input maxLength={24} className={`${styles.input_box} modal-input`}/>
                        </Form.Item>
                        <ul className={`${styles.msg_color} mt-2_5 font-12 font-w-400`}>
                            <li className="flex align-base ">
                                <Iconify icon="emojione-monotone:small-orange-diamond" className="theme_color mr-1"/>
                                24h内仅可修改1次。
                            </li>
                            <li className="flex align-base mt-1">
                                <Iconify icon="emojione-monotone:small-orange-diamond" className="theme_color mr-1"/>
                                昵称内容上限纯英数24字符或中文12字符，不支持特殊字符。
                            </li>
                            <li className="flex align-base mt-1">
                                <Iconify icon="emojione-monotone:small-orange-diamond" className="theme_color mr-1"/>
                                不可使用个人真实姓名及联系方式等，以防泄漏您的隐私。
                            </li>
                            <li className="flex align-base mt-1">
                                <Iconify icon="emojione-monotone:small-orange-diamond" className="theme_color mr-1"/>
                                昵称内容必须符合所在国家或地区的法律规定。如有违规，IMBIT有权对其修改或实施对账号禁言、封号等惩罚性措施。
                            </li>
                            <li className="flex align-base mt-1">
                                <Iconify icon="emojione-monotone:small-orange-diamond" className="theme_color mr-1"/>
                                历史昵称可能因为版本关系，存在不符合上述规范的情况，将无法同步至域名url。
                            </li>
                        </ul>
                    </Form>

                </div>
            </Modal>
        </ConfigProvider>
    );
}

export default NicknameModal;
