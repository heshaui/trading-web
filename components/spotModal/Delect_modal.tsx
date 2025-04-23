import { Modal, ConfigProvider, Checkbox } from "antd";

import type { ModalProps } from "antd/es/modal/interface";
// import { Iconify } from "@/components/icon/index";
// import store from "@/store"
// import { useRouter } from 'next/router';
import styles from "./styles/modal.module.css";
// import Image from 'next/image'
import { Iconify } from "@/components/icon/index";
import { updateUserCenter } from '@/services/userCenter'
import { toast } from "sonner";
import { useState } from "react";
// import {encryptData} from '@/utils/encrypt'
import dayjs from "dayjs";
import { useTranslation } from 'next-i18next';
import { LOCAL_STORAGE_KEY } from "@/config/apiConfig";
import { encryptData } from '@/hooks/user-encrypt'
import {revocationOrder} from '@/services/spot'
import Image from "next/image";
type Props = {
    open: boolean;
    orderId: string[];
    errMsg?: string;
    onOk: () => void;
    onCancel: () => void;
};

function DelectModal({ open, onCancel, onOk, errMsg, orderId }: Props) {
    const { t } = useTranslation(['spot']);
    const handCancel = () => {
        // form.resetFields();
        onCancel()
    };

    const handOk = async () => {
        try {
            const paeam={
                orderId: orderId,
            }
            const encrypt=await encryptData(paeam)
            const res = await revocationOrder(encrypt)
            if(res.code==='0'){
                toast.success(res.message)
                onOk()
                onCancel()
            }else{
                toast.error(res.message)
            }
        } catch (error) {
            toast.error(String(error))
        }

    };

    const ModalFooter: ModalProps["footer"] = () => {

        return (
            <div className="flex-x-cc" >
                <button
                    type="submit"
                    className={`${styles.modal_footerBtn} cancel_btn2 mr-5`}
                    onClick={handCancel}
                >
                    取消
                </button>
                <button
                    type="submit"
                    className={`${styles.modal_footerBtn} default_btn `}
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
                // title={<p className={`${styles.title}`} >
                //     {/* 下单确认 */}
                //     {t('spot.modal.title')}
                // </p>}
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
                <div className="flex-col flex-ai-center " style={{ minHeight: "230px" }}>
                    <div className="flex-y-cc w-full">
                        <Image src="/images/pubic_icon/icon_spot_err3.png" alt="" className={`${styles.icon_box}`} width={160} height={160} />
                        <p className={`${styles.title_color} mt-4 font-20 font-w-500 text-center`}>{errMsg || '确定取消全部订单？'}</p>
                    </div>

                </div>
            </Modal>
        </ConfigProvider>
    );
}

export default DelectModal;
