import { Modal, ConfigProvider, Checkbox } from "antd";

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
import appStore from '@/store';
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
    modalData?:any;
    onOk: (event: boolean) => void;
    onCancel: () => void;
};


    // 获取当前选中的货币对，如果没有则使用币对列表的第一个数据
    const currentPair = appStore.getCurrentPair() || appStore.currencyPairs[0];
function NicknameModal({ open, onCancel, onOk ,orderInfo,modalData}: Props) {
    const { t } = useTranslation(['spot']);
    const [noRemind, setNoRemind] = useState(false);
    
    const handCancel = () => {
        // form.resetFields();
        onCancel()
    };

    const handOk = async () => {
        console.log('提交订单');
        
        // 如果用户选择不再提醒，保存到本地存储
        if (noRemind) {
            localStorage.setItem('noRemind', 'true');
        }
        
        onOk(true)
        // onCancel()
        // 这里可以添加点击验证码弹窗确认按钮后的处理逻辑
    };
    
    // 处理复选框选中状态变化
    const handleCheckboxChange = (e: any) => {
        setNoRemind(e.target.checked);
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
                    {t('spot.modal.cancel')}
                </button>
                <button
                    type="submit"
                    className={`${styles.modal_footerBtn} default_btn flex-1`}
                    onClick={handOk}
                >
                    {/* 确认 */}
                    {t('spot.modal.confirm')}
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
                    {/* 下单确认 */}
                    {t('spot.modal.title')}
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
                    <p className="font-18 font-w-500">{currentPair?.coinSymbol}/{currentPair?.baseSymbol}</p>
                    <p className={`${styles.success_icon} font-14 font-w-400 mt-1`}>
                        {/* 买入/市价 */}
                        {modalData.direction===0?t('spot.modal.buy'):t('spot.modal.sell')} / {modalData.type===0?t('spot.modal.market'):t('spot.select.limit')}
                        </p>
                    <ul className={`${styles.tip_color1} ${styles.msg_card_box} font-14 font-w-400 mt-4 mb-2_5`}>
                        <li className="flex-x align-center justify-between">
                            <p>
                                {/* 价格 */}
                                {t('spot.modal.price')}
                            </p>
                            <p className={`${styles.title_color}`}>
                                {/* 市价 */}
                                {modalData.type===0?t('spot.modal.market'):modalData.price}{currentPair?.baseSymbol}
                            </p>
                        </li>
                        {/* 市价买单不显示数量 */}
                        {!(modalData.type===0 && modalData.direction===0) && (
                            <li className="flex-x align-center justify-between mt-3">
                                <p>
                                    {/* 数量 */}
                                    {t('spot.modal.amount')}
                                </p>
                                <p className={`${styles.title_color}`}>{modalData.amount}{currentPair?.coinSymbol}</p>
                            </li>
                        )}
                        {/* 市价卖单不显示成交额 */}
                        {!(modalData.type===0 && modalData.direction===1) && (
                            <li className="flex-x align-center justify-between mt-3">
                                <p>
                                    {/* 成交额 */}
                                    {t('spot.trade.amount2')}
                                </p>
                                <p className={`${styles.title_color}`}>{modalData.account}{currentPair?.baseSymbol}</p>
                            </li>
                        )}
                    </ul>
                  { modalData.type===0 && <div className={`${styles.warning_box} font-12 font-w-400 flex align-start mb-2_5 `} >
                        <Iconify icon="ep:warning-filled" className="warning_color mr-1" size={16} />
                        <span>
                            {/* 市场行情千变万化，市价单交易伴随着滑点，其最终成交价可能低于/高于最新价，请留意市场深度及价格波动 */}
                            {t('spot.modal.warning')}
                        </span>
                    </div>}
                    <Checkbox 
                        className="custom-checkbox text-color-default mb-5" 
                        checked={noRemind}
                        onChange={handleCheckboxChange}
                    >
                        <p className={`${styles.title_color}`}>
                            {/* 不再提醒,可在交易设置中，开启或关闭提示。 */}
                            {t('spot.modal.noRemind')}
                        </p>
                    </Checkbox>
                </div>
            </Modal>
        </ConfigProvider>
    );
}

export default NicknameModal;
