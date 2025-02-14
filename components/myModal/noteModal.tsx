import { Modal } from "antd";
import { type CSSProperties, useState, useEffect } from "react";;
import type { ModalProps } from "antd/es/modal/interface";
import { Iconify } from "@/components/icon/index";
import store from "@/store"
import { useRouter } from 'next/router';
import styles from "./style/noteModal.module.css";

type Props = {
    open: boolean;
    onOk?: (event: boolean) => void;
    onCancel: () => void;
};

function NoteModal({ open, onOk, onCancel }: Props) {
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
            className={`${styles.modal_box} modal_box`}
        >
            <div className="flex-col flex-ai-center">
                <img src="/images/login/icon_note.png" alt="" className={`${styles.icon_box}`}/>
                {/* t() */}
                <p className={`${styles.title} `}>重要提示</p> 
                <p className={`${styles.msg_color} mt-4`}>
                检测到您当前IP所在地区来自服务受限区域，因相关法律及政策要求，
                您所在的国家地区无法注册及使用我们的服务，抱歉为您带来不便。如您并非服务受限区域
                ，请在非服务受限区域使用我们的平台。
                感谢您的理解与配置，如有任何问题，请及时与我们沟通！
                </p>
            </div>
        </Modal>
    );
}

export default NoteModal;
