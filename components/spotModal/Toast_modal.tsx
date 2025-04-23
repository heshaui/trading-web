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
import Image from "next/image";
interface toastDataType {
    coinSymbol: string;
    price: string|number;
    amount: string|number;
    symbol: string;
    baseSymbol: string;
}
type Props = {
    open: boolean;
    type?: string;
    toastData: toastDataType;
    onOk?: () => void;
    onCancel: () => void;
};

function ToastModal({ open, onCancel, onOk, toastData, type }: Props) {
    const { t } = useTranslation(['spot']);
    const handCancel = () => {
        // form.resetFields();
        onCancel()
    };

    const handOk = async () => {
        // 这里可以添加点击验证码弹窗确认按钮后的处理逻辑

    };

    const ModalFooter: ModalProps["footer"] = () => {

        return (
            <div className="flex-x-cc" >
                {/* <button
                    type="submit"
                    className={`${styles.modal_footerBtn} default_btn `}
                    onClick={handOk}
                >
                </button> */}
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
                width={275}
                className={`modal_box`}
                classNames={{
                    content: styles.modal_content,
                    body: styles.modal_body,
                    footer: styles.modal_footer,
                }}
            >
                <div className="flex-col flex-ai-center " >

                    <div className="flex-x align-start justify-center w-full">
                        <Image src="/images/pubic_icon/icon_success.png" alt="" className={`${styles.icon_box2}`} width={38} height={38} />
                        <ul className={`flex-col flex-ai-start flex-1 ${styles.title_color} ml-2`}>
                            <li className={` mt-2_5 font-16 font-w-500 `}>
                                已撤单
                            </li>
                            <li className={` mt-5 font-14 font-w-400 `}>
                                币对：{toastData.symbol}
                            </li>
                            <li className={` mt-3 font-14 font-w-400 `}>
                                价格：{toastData.price}&nbsp;{toastData.symbol?.split('/')?.[1] || '--'}
                            </li>
                            <li className={` mt-3 font-14 font-w-400 `}>
                                撤单量：{toastData.amount}&nbsp;{toastData.symbol?.split('/')?.[0] || '--'}
                            </li>
                        </ul>
                    </div>

                </div>
            </Modal>
        </ConfigProvider>
    );
}

export default ToastModal;
