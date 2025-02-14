import { Modal } from "antd";
import { type CSSProperties, useState, useEffect } from "react";;
import type { ModalProps } from "antd/es/modal/interface";
import { Iconify } from "@/components/icon/index";
import store from "@/store"
import { useRouter } from 'next/router';
import styles from "./style/errModal.module.css";

type Props = {
    open: boolean;
    onOk: () => void;
    onCancel: () => void;
};

function ResetSuccessModal({ open, onOk, onCancel }: Props) {
    const router = useRouter();


    const handCancel = () => {
        onCancel()
    };

    const handOk =  () => {
        onOk()
        // 这里可以添加点击验证码弹窗确认按钮后的处理逻辑
    };
    const ModalFooter: ModalProps["footer"] = (_) => {
      
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
                    登录
                </button>
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
        >
            <div className="flex-col flex-ai-center">
                <img src="/images/login/icon_success.png" alt="" className={`${styles.icon_box}`}/>
                <p className={`${styles.title} `}>修改成功</p>
                <p className={`${styles.msg_color} mt-4`}>您的密码已修改成功，请使用新密码重新登录。</p>
            </div>
        </Modal>
    );
}

export default ResetSuccessModal;
