import { Modal,ConfigProvider } from "antd";
// import { type CSSProperties, useState, useEffect } from "react";;
import type { ModalProps } from "antd/es/modal/interface";
// import { Iconify } from "@/components/icon/index";
// import store from "@/store"
// import { useRouter } from 'next/router';
import styles from "./style/noteModal.module.css";
import Image from 'next/image'
import { useTranslation } from 'next-i18next';
type Props = {
    open: boolean;
    onOk?: (event: boolean) => void;
    onCancel: () => void;
};

function NoteModal({ open, onCancel }: Props) {
    // const router = useRouter();
    const { t } = useTranslation('login');
    const handCancel = () => {
        onCancel()
    };

    // const handOk = async (type: string) => {
    //     console.log(type);
    //     // 这里可以添加点击验证码弹窗确认按钮后的处理逻辑
    // };
    const ModalFooter: ModalProps["footer"] = () => {
      
        return (
            <div className="flex-x-cc mt-10 mb-8">
                {/* <button
                    type="button"
                    className="px-14 py-1 shadow-none"
                    onClick={handleCancel}
                >
                    取消
                </button> */}
                <button
                    type="button"
                    className={`${styles.errModal_btn} btn-color`}
                    onClick={handCancel}
                >
                    我知道了
                </button>
            </div>
        );
    };

    return (
        <ConfigProvider
            theme={{
                components: {
                    Modal: {
                        contentBg: "var(--background5)",
                        footerBg: "var(--background5)",
                        headerBg: "var(--background5)",
                    },

                },
            }}
        >
        <Modal
            open={open}
            // title={}
            centered
            onCancel={handCancel}
            footer={ModalFooter}
            width={400}
            className={`${styles.modal_box} modal_box`}
        >
            <div className="flex-col flex-ai-center">
                <Image src="/images/login/icon_note.png" alt="" className={`${styles.icon_box}`} width={160} height={160}/>
                {/* t() */}
                <p className={`${styles.title} `}>{t('errModal.title')}</p> 
                <p className={`${styles.msg_color} mt-4`}>
                    {t('errModal.msg')}
                </p>
            </div>
        </Modal>
        </ConfigProvider>
    );
}

export default NoteModal;
