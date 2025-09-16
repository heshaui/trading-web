import { Modal, ConfigProvider, Form, Input } from "antd";

import type { ModalProps } from "antd/es/modal/interface";
// import { Iconify } from "@/components/icon/index";
// import store from "@/store"
// import { useRouter } from 'next/router';
import styles from "./styles/withdrawmoney.module.css";
// import Image from 'next/image'
import { Iconify } from "@/components/icon/index";
import { updateUserCenter } from '@/services/userCenter'
import { toast } from "sonner";
import { useState } from "react";
import dayjs from "dayjs";
// import ErrModal from "./TotastModal";
import { creatWithdraw } from '@/services/assets'
import { encryptData } from "@/hooks/user-encrypt";
import WithdrawMoneySafe from "./withdrawMoneySafeModal";
import TotastModal from "./totastModal";
import { getUserInfo } from '@/hooks/userInfo';
import { useTranslation } from "next-i18next";
import { useResetStateContext } from '@/hooks/useStateProvider';

interface paramsType {
    coinId: number;
    protocolId: number;
    amount: string;
    toAddress: string;
    smsCode: string;
    emailCode: string;
    googleCode: string;
}
interface withdrawType {
    coinId: number,
    toAddress: string,
    protocolId: number,
    momo: string,
    amount: string,
    minWithdrawAmount: number,
    minWithdrawFee: number,
    withdrawFee: number,
    maxWithdrawAmount: number,
    minWithdraw: number,
    maxWithdraw: number,
    minRecharge: number,
    coinName: string,
    countWithdrawFee: number,
    protocolName: string,
    amountAfter: number,
}
type Props = {
    open: boolean;
    withdrawInfo?: withdrawType;
    onOk?: () => void;
    onCancel: () => void;
};

function WithdrawMoneyCheck({ open, onCancel, withdrawInfo, onOk }: Props) {
    const { t } = useTranslation(['assets']);
    const [safeModalOpen, setSafeModalOpen] = useState(false)
    const [userInfo, setUserInfo] = useState({})
    const [totastOpen, setTotastOpen] = useState(false)
    const [totastMessage, setTotastMessage] = useState('')
    const [totastType, setTotastType] = useState('')
    const {  setResetState } = useResetStateContext();
    const handCancel = () => {
        onCancel()
    };

    const handOk = async () => {
        // setErrOpen(true)
        const userInfo = getUserInfo()
        const coinInfo = Object.assign(userInfo, withdrawInfo)
        setUserInfo(coinInfo)
        setSafeModalOpen(true)
        // onCancel()
    };
    const safeModalOk = async (event: any) => {
        const params = {
            coinId: withdrawInfo?.coinId,
            protocolId: withdrawInfo?.protocolId,
            amount: withdrawInfo?.amount,
            toAddress: withdrawInfo?.toAddress,
            smsCode: event.smsCode || '',
            emailCode: event.emailCode || '',
            googleCode: event.googleCode || '',
        }
        const encrypt = await encryptData(params)
        try {
            const res = await creatWithdraw(encrypt)
            // console.log(res);
            if (res.code === '0') {
                // toast.success(res.message)
                // onOk(true)
                setResetState(true) // 重置状态
                setTotastOpen(true)
                setTotastMessage(`${withdrawInfo?.amount} ${withdrawInfo?.coinName}`)
                setTotastType('loading')
                onOk?.()
                // handCancel()
            } else if(res.code==='1') {
                setTotastOpen(true)
                setTotastType('loading')
                handCancel()
            }
            else {
                setTotastOpen(true)
                setTotastMessage(res.message||t('withdrawMoneyCheck.operationFailed'))
                setTotastType('error')
                toast.error(res.message)
            }

        } catch (error) {
            setTotastOpen(true)
            setTotastMessage(String(error)||t('withdrawMoneyCheck.operationFailed'))
            setTotastType('error')
        }
    }


    const ModalFooter: ModalProps["footer"] = () => {

        return (
            <div className="flex-x align-center justify-end mb-5 mt-5" >
                {/* <button
                    type="button"
                    className={`${styles.modal_footerBtn} cancel_btn2 mr-5 font-14 font-w-500`}
                    onClick={handCancel}
                >
                    取消
                </button> */}
                <button
                    type="submit"
                    className={`${styles.modal_footerBtn} default_btn`}
                    onClick={handOk}
                >
                    {t('modal.confirm2')}
                </button>
            </div>
        );
    };

    return (
        <ConfigProvider
            theme={{
                components: {
                    // Form: {
                    //     itemMarginBottom: 0, // 去除表单项之间的间距
                    // },
                    // Button: {
                    //     controlHeightLG: 50,
                    //     defaultActiveBorderColor: 'var(--theme-color)', //默认按钮激活态边框颜色
                    //     defaultActiveColor: 'var(--theme-color)', //默认按钮激活态文本颜色
                    //     defaultBg: 'var(--theme-color)', //默认按钮背景颜色
                    //     defaultHoverBorderColor: 'var(--theme-color)', //默认按钮悬浮态边框颜色
                    //     defaultHoverColor: 'var(--theme-color)', //默认按钮悬浮态文本颜色
                    //     defaultColor: '#fff', //默认按钮文本颜色
                    // },
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
                    {/* 提现确认 */}
                    {t('withdrawMoneyCheck.withdrawConfirm')}
                </p>}
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
                maskClosable={false}
            >
                <div className={`flex-col flex-ai-center  font-14 font-w-400`} style={{ width: "100%" }}>
                    <p className={`${styles.title_color} font-24 font-w-500`}>{withdrawInfo?.amount} {withdrawInfo?.coinName}</p>
                    <p className={`${styles.tip_color} mt-2`}>
                        {/* 提现金额 */}
                        {t('withdrawMoneyCheck.withdrawAmount')}
                    </p>
                    <ul className={`${styles.card_bgc3} mt-2`}>
                        <li className={`${styles.title_color} font-14 font-w-400 flex-x align-center justify-between mb-5`}>
                            <p className={`${styles.tip_color}`}>
                                {/* 提现地址 */}
                                {t('withdrawMoneyCheck.withdrawAddress')}
                            </p>
                            <p >{withdrawInfo?.toAddress}</p>
                        </li>
                        <li className={`${styles.title_color} font-14 font-w-400 flex-x align-center justify-between mb-5`}>
                            <p className={`${styles.tip_color}`}>
                                {/* 网络 */}
                                {t('withdrawMoneyCheck.network')}
                            </p>
                            <p >{withdrawInfo?.protocolName}</p>
                        </li>
                        <li className={`${styles.title_color} font-14 font-w-400 flex-x align-center justify-between mb-5`}>
                            <p className={`${styles.tip_color}`}>
                                {/* 数量 */}
                                {t('withdrawMoneyCheck.amountAfter')}
                            </p>
                            <p className="flex-y">
                                <span className="text-right">
                                    {/* 到账： */}
                                    {t('withdrawMoneyCheck.toAccount')}
                                    {withdrawInfo?.amountAfter}
                                    {withdrawInfo?.coinName}
                                </span>
                                <span className="text-right">
                                    {/* 手续费： */}
                                    {t('withdrawMoneyCheck.withdrawFee')}
                                    {withdrawInfo?.countWithdrawFee}
                                    {withdrawInfo?.coinName}</span></p>
                        </li>
                        <li className={`${styles.title_color} font-14 font-w-400 flex-x align-center justify-between mb-5`}>
                            <p className={`${styles.tip_color}`}>
                                {/* 提现账户 */}
                                {t('withdrawMoneyCheck.withdrawAccount')}
                            </p>
                            <p >
                                {/* 现货账户 */}
                                {t('withdrawMoneyCheck.spotAccount')}
                            </p>
                        </li>
                    </ul>
                    <p className={`${styles.warning_box} font-12 font-w-400 flex align-start mb-2_5 mt-4 `}>
                        <Iconify icon="ep:warning-filled" className="warning_color mr-1" size={16} />
                        <span>
                            {/* 请确保您输入了正确的提现地址并且您选择的转账网络与地址相匹配 */}
                            {t('withdrawMoneyCheck.warning')}
                        </span>
                    </p>
                </div>
                {/* <ErrModal open={errOpen} message={'99USDT'} type={'loading'} onCancel={() => setErrOpen(false)}/> */}

            </Modal>
            <WithdrawMoneySafe open={safeModalOpen}
                onCancel={() => setSafeModalOpen(false)}
                // type={'email'} 
                acountInfo={userInfo}
                onOk={safeModalOk} />
            <TotastModal open={totastOpen} message={totastMessage} type={totastType} onCancel={() => setTotastOpen(false)}/>
        </ConfigProvider>
    );
}

export default WithdrawMoneyCheck;
