import { Modal, ConfigProvider, Form, Input } from "antd";
// import { type CSSProperties, useState, useEffect } from "react";;
import type { ModalProps } from "antd/es/modal/interface";
// import { Iconify } from "@/components/icon/index";
// import store from "@/store"
// import { useRouter } from 'next/router';
import styles from "./styles/delect.module.css";
// import Image from 'next/image'
// import { Iconify } from "@/components/icon/index";
// import { updateUserCenter } from '@/services/userCenter'
import { toast } from "sonner";
import { deleteByIds } from '@/services/assets'
import { useTranslation } from 'next-i18next';
type Props = {
    open: boolean;
    onOk: () => void;
    onCancel: () => void;
    info: number[];
};

function NicknameModal({ open, onCancel, onOk, info }: Props) {
    const { t } = useTranslation(['assets']);

    const handCancel = () => {
        onCancel()
    };

    const handOk = async () => {
        await delectAddress()

    };
    const delectAddress = async () => {
        try {
            const res = await deleteByIds(info)
            if (res.code === '0') {
                toast.success(t('modal.deleteAddress.success'))
                onOk()
                onCancel()
            }
        } catch (error) {
            toast.error(String(error))
        }
    }
    const ModalFooter: ModalProps["footer"] = () => {

        return (
            <div className="flex-x align-center justify-end" >
                <button
                    type="button"
                    className={`${styles.modal_footerBtn} cancel_btn2 mr-5 font-14 font-w-500`}
                    onClick={handCancel}
                >
                    {t('modal.deleteAddress.cancel')}
                </button>
                <button
                    type="submit"
                    className={`${styles.modal_footerBtn} default_btn`}
                    onClick={handOk}
                >
                    {t('modal.deleteAddress.confirm')}
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
                        // color: 'var(--then-color)',
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
                title={<p className={`${styles.title}`}>{t('modal.deleteAddress.title')}</p>}
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
                maskClosable={false}
            >
                <div className={`flex-col  ${styles.msg_color}`} style={{ width: "100%" }}>
                    {t('modal.deleteAddress.message')}

                </div>
            </Modal>
        </ConfigProvider>
    );
}

export default NicknameModal;
