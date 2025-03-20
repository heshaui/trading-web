import { Modal, ConfigProvider, Form, Input } from "antd";
// import { type CSSProperties, useState, useEffect } from "react";;
import type { ModalProps } from "antd/es/modal/interface";
// import { Iconify } from "@/components/icon/index";
// import store from "@/store"
// import { useRouter } from 'next/router';
import styles from "./styles/changeCheck.module.css";
import Image from 'next/image'
import { Iconify } from "@/components/icon/index";
import { updateUserCenter } from '@/services/userCenter'
import { toast } from "sonner";
type Props = {
    open: boolean;
    type: string;
    // onOk?: (event: boolean) => void;
    onOk: (type: string) => void;
    onCancel: () => void;
};
// 0:修改手机号 1:关闭手机验证 2:修改邮箱 3:修改密码 4:关闭谷歌验证
function CheckModal({ open, onCancel, type, onOk }: Props) {

    const handCancel = () => {
        onCancel()
    };

    const handOk = async () => {
        onOk(type)
        onCancel()
    };
    const ModalFooter: ModalProps["footer"] = () => {

        return (
            <div className="flex-x-cc mt-10 mb-3" >
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
                    继续
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
                    }
                },
                token: {
                    // colorBgContainerDisabled: '#fff',
                }
            }}
        >
            <Modal
                open={open}
                // title={<p className={`${styles.title}`} >修改昵称</p>}
                centered
                onCancel={handCancel}
                footer={ModalFooter}
                width={400}
                className={`modal_box`}
                classNames={{
                    content: styles.modal_content,
                    body: styles.modal_body,
                    footer: styles.modal_footer,
                }}
            >
                <div className="flex-col flex-ai-center" style={{ width: "100%" }}>
                    {type == "0" && (
                        <>
                            <Image src="/images/userCenter/safe/change_phone.png" alt="" className={`${styles.icon_box}`} width={160} height={160} />
                            <p className={`${styles.title} `}>您确认修改手机号吗？</p>
                            <p className={`${styles.msg_color} mt-4 text-center` }>为保障您的资产安全，修改手机号后，24H将禁止出金。</p>
                        </>
                    )}
                    {type === "1" && (
                        <>
                            <Image src="/images/userCenter/safe/change_phone.png" alt="" className={`${styles.icon_box}`} width={160} height={160} />
                            <p className={`${styles.title} `}>您确认关闭手机验证吗？</p>
                            <p className={`${styles.msg_color} mt-4 text-center` }>确认后，您将无法使用手机获取到验证码。</p>
                        </>
                    )}
                     {(type === "2") && (
                        < >
                            <Image src="/images/userCenter/safe/change_email.png" alt="" className={`${styles.icon_box}`} width={160} height={160} />
                            <p className={`${styles.title} `}>您确认修改邮箱吗？</p>
                            <p className={`${styles.msg_color} mt-4 text-center` } style={{width: '70%'}}>为保障您的资产安全，修改邮箱后，24H将禁止出金。</p>
                        </>
                    )}
                     {(type === "3"||type==='5') && (
                        <>
                            <Image src="/images/userCenter/safe/change_lock.png" alt="" className={`${styles.icon_box}`} width={160} height={160} />
                            <p className={`${styles.title} `}>您确认修改密码吗？</p>
                            <p className={`${styles.msg_color} mt-4 text-center` }>为保障您的资产安全，修改密码后，24H将禁止出金。</p>
                        </>
                    )}
                     {type === "4" && (
                        <>
                            <Image src="/images/userCenter/safe/change_google.png" alt="" className={`${styles.icon_box}`} width={160} height={160} />
                            <p className={`${styles.title} `}>您确认解绑谷歌验证器吗？</p>
                            <p className={`${styles.msg_color} mt-4 text-center` }>为保障您的资产安全，解绑谷歌身份验证器后，24H将禁止出金。</p>
                        </>
                    )}
                </div>
            </Modal>
        </ConfigProvider>
    );
}

export default CheckModal;
