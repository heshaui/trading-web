import { Modal, ConfigProvider } from "antd";
import type { ModalProps } from "antd/es/modal/interface";
// import { Iconify } from "@/components/icon/index";
// import store from "@/store"
// import { useRouter } from 'next/router';
import styles from "./style/errModal.module.css";
import Image from 'next/image';
import { useTranslation } from 'next-i18next';

type Props = {
    open: boolean;
    onOk: () => void;
    onCancel: () => void;
};

function ResetSuccessModal({ open, onOk, onCancel }: Props) {
    const { t } = useTranslation('resetPassword');

    const handCancel = () => {
        onCancel()
    };

    const handOk = () => {
        onOk()
        // 这里可以添加点击验证码弹窗确认按钮后的处理逻辑
    };
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
                    onClick={handOk}
                >
                    {/* 登录 */}
                    {t('gologin')}
                </button>
            </div>
        );
    };

    return (
        <ConfigProvider
            theme={{
                components: {
                    Form: {
                        // itemMarginBottom: 0, // 去除表单项之间的间距
                    },
                    Input: {
                        activeBorderColor: 'var(--theme-color)',
                        hoverBorderColor: 'var(--theme-color)',
                        controlHeightLG: 50,
                        activeBg: 'var(--background5)',
                        hoverBg: 'var(--background5)',
                    },
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
                    <Image src="/images/login/icon_success.png" alt="" className={`${styles.icon_box}`} width={160} height={160} />
                    <p className={`${styles.title} `}>{t('resetSuccess')}</p>
                    <p className={`${styles.msg_color} mt-4`}>{t('resetSuccessMsg')}</p>
                </div>
            </Modal>
        </ConfigProvider>
    );
}

export default ResetSuccessModal;
