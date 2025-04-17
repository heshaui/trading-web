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
interface orderInfoType {
    amount?: number;
    baseSymbol?: string;
    baseSymbolCount?: number;
    canceledTime?: number;
    coinSymbol?: string;
    completedTime?: number;
    createTime?: number;
    direction?: number;
    fee?: number;
    orderId?: string;
    orderResource?: number;
    price?: number;
    status?: number;
    symbol?: string;
    tenantId?: string;
    tradedAmount?: number;
    turnover?: number;
    type?: number;
    updateTime?: number;
    useDiscount?: number;
}
type Props = {
    open: boolean;
    orderInfo?:orderInfoType;
    onOk: (event: boolean) => void;
    onCancel: () => void;
};

function SpotBuyModal({ open, onCancel, onOk ,orderInfo}: Props) {
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
                    type="button"
                    className={`${styles.modal_footerBtn} cancel_btn2 mr-5 font-14 font-w-500 flex-1`}
                    onClick={handCancel}
                >
                    {t('spot.modal.cancel')}
                </button>
                <button
                    type="submit"
                    className={`${styles.modal_footerBtn} default_btn flex-1`}
                    onClick={handOk}
                >
                    {t('spot.modal.confirm')}
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
                title={<p className={`${styles.title}`} >
                    账户入金
                </p>}
                centered
                onCancel={handCancel}
                footer={ModalFooter}
                width={470}
                className={`modal_box`}
                classNames={{
                    content: styles.modal_content,
                    body: styles.modal_body,
                    footer: styles.modal_footer,
                }}
            >
                <div className="" style={{ width: "100%" ,minHeight: "230px"}}>
                    {/* t() */}
                    <p className={`font-14 font-w-400 ${styles.tip_color} mb-3`}>选择最适合您的方式入金。</p>
                    <button className={`${styles.msg_btn_item} w-full flex-x align-center`}>
                        <Iconify icon="mingcute:tether-usdt-fill" className={`${styles.theme_color}`} size={48}/>
                        <div className="flex-y align-start ml-2_5">
                            <p className={`font-16 font-w-500 ${styles.title_color}`}>充值USDT</p>
                            <p className={`font-14 font-w-400 ${styles.tip_color}`}>通过区块链将其他交易所资产转入</p>
                        </div>
                    </button>
                </div>
            </Modal>
        </ConfigProvider>
    );
}

export default SpotBuyModal;
