import { Modal, ConfigProvider, Form, QRCode } from "antd";

import type { ModalProps } from "antd/es/modal/interface";
import styles from "../../../styles/cancelModal.module.css";
import { useTranslation } from 'next-i18next';
import { toast } from "sonner";
interface UserCenterData {
    userId: number,
    nickname?: string,
    avatarUrl?: string,
    birthday?: string,
    isNicknameUpdate?:boolean,
    nicknameUpdateTime?: number,
  }
type Props = {
    open: boolean;
    onOk: () => void;
    onCancel: () => void;
};

function TableCancelModal({ open, onCancel ,onOk}: Props) {
    const { t } = useTranslation('common');
    const handCancel = () => {
        onCancel()
    };

    const handOk = async () => {
       toast.error('暂无接口')
    };

    const ModalFooter: ModalProps["footer"] = () => {
        return (
            <div className="flex-x-cc" >
                <button
                    type="button"
                    className={`${styles.modal_footerBtn} cancel_btn2 mr-5 font-14 font-w-500`}
                    onClick={handCancel}
                >
                    {t('cancel')}
                </button>
                <button
                    type="button"
                    className={`${styles.modal_footerBtn} default_btn mr-5 font-14 font-w-500`}
                    onClick={handOk}
                >
                    {t('ok')}
                </button>
            </div>
        );
    };

    return (
        <ConfigProvider
            theme={{
                components: {
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
                // title={<p className={`${styles.title}`} >
                //     {/* 修改昵称 */}
                //     {t('usersetting.modifyNickname')}
                // </p>}
                centered
                onCancel={handCancel}
                footer={ModalFooter}
                width={300}
                className={`modal_box`}
                classNames={{
                    content: styles.modal_content,
                    body: styles.modal_body,
                    footer: styles.modal_footer,
                }}
            >
                <div className="flex-y-cc" style={{ width: "100%",height:80 }}>
                {t('modal.confirmCancel')}
                </div>
            </Modal>
        </ConfigProvider>
    );
}

export default TableCancelModal;
