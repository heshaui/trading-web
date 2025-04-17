import { Modal, ConfigProvider, Form, Input } from "antd";

import type { ModalProps } from "antd/es/modal/interface";
// import { Iconify } from "@/components/icon/index";
// import store from "@/store"
// import { useRouter } from 'next/router';
import styles from "../styles/modal.module.css";
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
interface UserCenterData {
    userId: number,
    nickname?: string,
    avatarUrl?: string,
    birthday?: string,
    isNicknameUpdate?: boolean,
    nicknameUpdateTime?: number,
}
type Props = {
    open: boolean;
    // onOk?: (event: boolean) => void;
    onOk: (event: boolean) => void;
    onCancel: () => void;
};

function NicknameModal({ open, onCancel, onOk }: Props) {
    const { t } = useTranslation('common');
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
                <button
                    type="button"
                    className={`${styles.modal_footerBtn} cancel_btn2 mr-5 font-14 font-w-500 flex-1`}
                    onClick={handCancel}
                >
                    {/* 取消 */}
                    {t('cancel')}
                </button>
                <button
                    type="submit"
                    className={`${styles.modal_footerBtn} default_btn flex-1`}
                    onClick={handOk}
                >
                    {/* 保存 */}
                    {t('save')}
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
                title={<p className={`${styles.title}`} >
                    下单确认
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
                <div className="" style={{ width: "100%" }}>
                    {/* t() */}
                    <p className="font-18 font-w-500">BTC/USDT</p>
                    <p className={`${styles.success_icon} font-14 font-w-400`}>买入/市价</p>
                    <ul className={`${styles.tip_color1} font-14 font-w-400`}>
                        <li className="flex-x align-center justify-between">
                            <p>价格</p>
                            <p className={`${styles.title_color}`}>市价</p>
                        </li>
                        <li className="flex-x align-center justify-between">
                            <p>数量</p>
                            <p className={`${styles.title_color}`}>10000USDT</p>
                        </li>
                    </ul>
                    <div className={`${styles.warning_box} font-12 font-w-400 flex align-start mb-2_5 `}>
                        <Iconify icon="ep:warning-filled" className="warning_color mr-1" size={16} />
                        <span>
                            市场行情千变万化，市价单交易伴随着滑点，其最终成交价可能低于/高于最新价，请留意市场深度及价格波动
                        </span>
                    </div>

                </div>
            </Modal>
        </ConfigProvider>
    );
}

export default NicknameModal;
