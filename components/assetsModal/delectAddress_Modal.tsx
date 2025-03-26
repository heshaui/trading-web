import { Modal, ConfigProvider, Form, Input } from "antd";
// import { type CSSProperties, useState, useEffect } from "react";;
import type { ModalProps } from "antd/es/modal/interface";
// import { Iconify } from "@/components/icon/index";
// import store from "@/store"
// import { useRouter } from 'next/router';
import styles from "./styles/delect.module.css";
import Image from 'next/image'
import { Iconify } from "@/components/icon/index";
import { updateUserCenter } from '@/services/userCenter'
import { toast } from "sonner";
import { deleteByIds } from '@/services/assets'
type Props = {
    open: boolean;
    onOk: () => void;
    onCancel: () => void;
    info: number[];
};

function NicknameModal({ open, onCancel, onOk, info }: Props) {

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
                toast.success('删除成功')
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
                    取消
                </button>
                <button
                    type="submit"
                    className={`${styles.modal_footerBtn} default_btn`}
                    onClick={handOk}
                >
                    确认
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
                title={<p className={`${styles.title}`} >确认删除</p>}
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
                <div className={`flex-col  ${styles.msg_color}`} style={{ width: "100%" }}>
                    确认删除后不可恢复，是否确认删除？

                </div>
            </Modal>
        </ConfigProvider>
    );
}

export default NicknameModal;
