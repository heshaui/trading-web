import { Modal } from "antd";
// import { type CSSProperties, useState, useEffect } from "react";
import { useEffect } from "react";;
import type { ModalProps } from "antd/es/modal/interface";
// import { Iconify } from "@/components/icon/index";
// import store from "@/store"
// import { useRouter } from 'next/router';
import styles from "./styles/errModal.module.css";
import Image from "next/image";
import { useThemeMode } from "@/hooks/useThemeMode";
import { useTranslation } from 'next-i18next';
import { ROUTER_KEY_ASSETS,ROUTER_KEY_SPOT } from '@/config/apiConfig'
import { useRouter } from 'next/router';
type Props = {
    open: boolean;
    message?: string;
    type: string;
    // onOk?: (event: boolean) => void;
    onCancel: () => void;
};

function TotastModal({ open, message, type, onCancel }: Props) {
    const router = useRouter();
    const { t } = useTranslation(['assets']);
    const { isDayMode } = useThemeMode();
    useEffect(() => {

    }, []);

    const handCancel = () => {
        onCancel()
    };
    const handOk = () => {
        onCancel()
    };
    // const handOk = async (type: string) => {
    //     console.log(type);
    //     // 这里可以添加点击验证码弹窗确认按钮后的处理逻辑
    // };
    const ModalFooter: ModalProps["footer"] = () => {

        return (
            <div className="flex-x-cc mt-10 mb-8">
                {type === 'error' && <button
                    type="button"
                    className={`${styles.errModal_btn} btn-color`}
                    onClick={handOk}
                >
                    {/* 我知道了 */}
                    {t('modal.confirm')}
                </button>}
                {(type === 'success' || type === 'loading') && <div className="flex-y-cc">
                    <button
                        type="button"
                        className={`${styles.errModal_btn} btn-color`}
                        onClick={() => {
                            router.push(ROUTER_KEY_SPOT.INDEX)
                            handCancel()
                        }}
                    >
                        {/* 去交易 */}
                        {t('modal.goTrade')}
                    </button>
                    <button
                        type="button"
                        className={`${styles.errModal_btn} disabled_btn2 mt-5`}
                        onClick={() => {
                            router.push(ROUTER_KEY_ASSETS.SPOT_ACCOUNT)
                            handCancel()
                        }}
                    >
                        {/* 查看资产 */}
                        {t('modal.checkAsset')}
                    </button>
                </div>}
            </div>
        );
    };

    return (
        <Modal
            open={open}
            // title={}
            centered
            onCancel={handCancel}
            footer={ModalFooter}
            width={400}
            className={`modal_box`}
        >
            <div className="flex-col flex-ai-center">
                {type === 'error' && <>
                    <Image src={isDayMode ? "/images/pubic_icon/icon_anti_err_day.png" : "/images/pubic_icon/icon_anti_err_night.png"}
                        alt="" className={`${styles.icon_box}`} width={160} height={160} />
                    <p className={`${styles.title} `}>
                        {/* 操作失败 */}
                        {t('modal.operationFailed')}
                    </p>
                    <p className={`${styles.msg_color} mt-4`}>{message}</p>
                </>}
                {type === 'success' && <>
                    <Image src={isDayMode ? "/images/pubic_icon/icon_anti_fishing_day.png" : "/images/pubic_icon/icon_anti_fishing_night.png"}
                        alt="" className={`${styles.icon_box}`} width={160} height={160} />
                    <p className={`${styles.title} `}>
                        {/* 提现成功 */}
                        {t('modal.success')}
                    </p>
                    <p className={`${styles.msg_color} mt-4`}>{message}</p>
                </>}
                {type === 'loading' && <>
                    <Image src={isDayMode ? "/images/pubic_icon/icon_anti_loading_day.png" : "/images/pubic_icon/icon_anti_loading_night.png"}
                        alt="" className={`${styles.icon_box}`} width={160} height={160} />
                    {/* <p className={`${styles.title} `}>{message}</p> */}
                    <p className={`${styles.msg_color} mt-4`}>
                        {/* 提现审核已提交，请耐心等待审核 */}
                        {t('modal.loading')}
                    </p>
                </>}
            </div>
        </Modal>
    );
}

export default TotastModal;
