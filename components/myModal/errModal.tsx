import { Modal } from "antd";
import { type CSSProperties, useState, useEffect } from "react";;
import type { ModalProps } from "antd/es/modal/interface";
import { Iconify } from "@/components/icon/index";
import store from "@/store"
import { useRouter } from 'next/router';
import styles from "./style/errModal.module.css";

type Props = {
    open: boolean;
    errMsg: string;
    onOk?: (event: boolean) => void;
    onCancel: () => void;
};

function ErrModal({ open,errMsg, onOk, onCancel }: Props) {
    const router = useRouter();

    useEffect(() => {

    }, []);

    const handCancel = () => {
        onCancel()
    };

    const handOk = async (type: string) => {
        console.log(type);
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
                    onClick={handCancel}
                >
                    我知道了
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
                <img src="/images/login/icon_faild.png" alt="" className={`${styles.icon_box}`}/>
                <p className={`${styles.title} `}>操作失败</p>
                <p className={`${styles.msg_color} mt-4`}>{errMsg}</p>
            </div>
        </Modal>
    );
}

export default ErrModal;
