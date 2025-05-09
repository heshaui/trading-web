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
import { useTranslation } from 'next-i18next';
type Props = {
    open: boolean;
    type: string;
    // onOk?: (event: boolean) => void;
    onOk: (type: string) => void;
    onCancel: () => void;
};
// 0:修改手机号 1:关闭手机验证 2:修改邮箱 3:修改密码 4:关闭谷歌验证
function CheckModal({ open, onCancel, type, onOk }: Props) {
    const { t } = useTranslation(['userCenter']);
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
                    {t('security.changeCheck.cancel')}
                </button>
                <button
                    type="submit"
                    className={`${styles.modal_footerBtn} default_btn`}
                    onClick={handOk}
                >
                    {t('security.changeCheck.continue')}
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
                maskClosable={false}
            >
                <div className="flex-col flex-ai-center" style={{ width: "100%" }}>
                    {/* 修改手机号 */}
                    {type == "0" && (
                        <>
                            <Image src="/images/userCenter/safe/change_phone.png" alt="" className={`${styles.icon_box}`} width={160} height={160} />
                            <p className={`${styles.title} `}>
                                {t('security.changeCheck.title')}
                            </p>
                            <p className={`${styles.msg_color} mt-4 text-center` }>
                                {t('security.changeCheck.msg')}
                            </p>
                        </>
                    )}
                    {/* 关闭手机验证 */}
                    {type === "1" && (
                        <>
                            <Image src="/images/userCenter/safe/change_phone.png" alt="" className={`${styles.icon_box}`} width={160} height={160} />
                            <p className={`${styles.title} `}>
                                {t('security.changeCheck.title1')}
                            </p>
                            <p className={`${styles.msg_color} mt-4 text-center` }>
                                {t('security.changeCheck.msg1')}
                            </p>
                        </>
                    )}
                    {/* 修改邮箱 */}
                     {(type === "2") && (
                        < >
                            <Image src="/images/userCenter/safe/change_email.png" alt="" className={`${styles.icon_box}`} width={160} height={160} />
                            <p className={`${styles.title} `}>
                                {t('security.changeCheck.title2')}
                            </p>
                            <p className={`${styles.msg_color} mt-4 text-center` } style={{width: '70%'}}>
                                {t('security.changeCheck.msg2')}
                            </p>
                        </>
                    )}
                    {/* 修改密码 */}
                     {(type === "3"||type==='5') && (
                        <>
                            <Image src="/images/userCenter/safe/change_lock.png" alt="" className={`${styles.icon_box}`} width={160} height={160} />
                            <p className={`${styles.title} `}>
                                {t('security.changeCheck.title3')}
                            </p>
                            <p className={`${styles.msg_color} mt-4 text-center` }>
                                {t('security.changeCheck.msg3')}
                            </p>
                        </>
                    )}
                    {/* 解绑谷歌验证 */}
                     {type === "4" && (
                        <>
                            <Image src="/images/userCenter/safe/change_google.png" alt="" className={`${styles.icon_box}`} width={160} height={160} />
                            <p className={`${styles.title} `}>
                                {t('security.changeCheck.title4')}
                            </p>
                            <p className={`${styles.msg_color} mt-4 text-center` }>
                                {t('security.changeCheck.msg4')}
                            </p>
                        </>
                    )}
                </div>
            </Modal>
        </ConfigProvider>
    );
}

export default CheckModal;
