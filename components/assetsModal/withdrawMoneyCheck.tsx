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
import ErrModal from "./totastModal";
import { creatWithdraw } from '@/services/assets'
import { encryptData } from "@/utils/encrypt";


interface withdrawType {
    coinId: number;
    protocolId: number;
    amount: string;
    toAddress: string;
    smsCode: string;
    emailCode: string;
    googleCode: string;
}
type Props = {
    open: boolean;
    withdrawInfo?: withdrawType;
    onOk: (event: boolean) => void;
    onCancel: () => void;
};

function WithdrawMoneyCheck({ open, onCancel, withdrawInfo, onOk }: Props) {
    // const router = useRouter();
    // const [inputValue, setInputValue] = useState(nicknameInfo.nickname || '');
    const handCancel = () => {
        onCancel()
    };
    const [errOpen, setErrOpen] = useState(false)

    const handOk = async () => {
        setErrOpen(true)
    };
    const createWithdraw = async () => {
        const params = {
            ...withdrawInfo,
        }
        const encrypt = await encryptData(params)
        try {
            // const res=await creatWithdraw(encrypt)
            // console.log(res);

        } catch (error) {

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
                    确认
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
                    //     defaultActiveBorderColor: '#FF5F1F', //默认按钮激活态边框颜色
                    //     defaultActiveColor: '#FF5F1F', //默认按钮激活态文本颜色
                    //     defaultBg: '#FF5F1F', //默认按钮背景颜色
                    //     defaultHoverBorderColor: '#FF5F1F', //默认按钮悬浮态边框颜色
                    //     defaultHoverColor: '#FF5F1F', //默认按钮悬浮态文本颜色
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
                title={<p className={`${styles.title}`} >提现确认</p>}
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
            >
                <div className={`flex-col flex-ai-center  font-14 font-w-400`} style={{ width: "100%" }}>
                    <p className={`${styles.title_color} font-24 font-w-500`}>100.00 USDT</p>
                    <p className={`${styles.tip_color} mt-2`}>提现金额</p>
                    <ul className={`${styles.card_bgc3} mt-2`}>
                        <li className={`${styles.title_color} font-14 font-w-500 flex-x align-center justify-between mb-5`}>
                            <p className={`${styles.tip_color}`}>提现地址</p>
                            <p >这是一个提现地址XXXXXXXXXXXX</p>
                        </li>
                        <li className={`${styles.title_color} font-14 font-w-500 flex-x align-center justify-between mb-5`}>
                            <p className={`${styles.tip_color}`}>网络</p>
                            <p >{`TRX(TRC20)`}</p>
                        </li>
                        <li className={`${styles.title_color} font-14 font-w-500 flex-x align-center justify-between mb-5`}>
                            <p className={`${styles.tip_color}`}>数量</p>
                            <p className="flex-y">
                                <span>到账：99.00USDT</span>
                                <span>手续费：1.00USDT</span></p>
                        </li>
                        <li className={`${styles.title_color} font-14 font-w-500 flex-x align-center justify-between mb-5`}>
                            <p className={`${styles.tip_color}`}>提现账户</p>
                            <p >现货账户</p>
                        </li>
                    </ul>
                    <p className={`${styles.warning_box} font-12 font-w-400 flex align-start mb-2_5 mt-4 `}>
                        <Iconify icon="ep:warning-filled" className="warning_color mr-1" size={16} />
                        <span>请确保您输入了正确的提现地址并且您选择的转账网络与地址相匹配</span>
                    </p>
                </div>
                {/* <ErrModal open={errOpen} message={'99USDT'} type={'loading'} onCancel={() => setErrOpen(false)}/> */}

            </Modal>
        </ConfigProvider>
    );
}

export default WithdrawMoneyCheck;
