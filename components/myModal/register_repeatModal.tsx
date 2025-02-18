import { Modal, Form, Input } from "antd";
import { type CSSProperties, useState, useEffect } from "react";;
import type { ModalProps } from "antd/es/modal/interface";
import { Iconify } from "@/components/icon/index";
import store from "@/store"
import { useRouter } from 'next/router';
import styles from "./style/repeatModal.module.css";
import { encryptEmail ,encryptPhoneNumber} from "@/utils/encrypt";
import {registerLogic} from "@/store/registerEnum"

type Props = {
    open: boolean;
    acount: string;
    onOk: (event: any) => void;
    onCancel: () => void;
};

function RepeatModal({ open, onOk, acount,onCancel }: Props) {
    const router = useRouter();
    const [form] = Form.useForm();
    const [countdown, setCountdown] = useState(0);
    const [isCounting, setIsCounting] = useState(false);
    const [pointout, setPointout] = useState(false);
    const handCancel = () => {
        onCancel()
    };

    const handOk = async () => {
        form.validateFields()
            .then((values) => {
                onOk(values)
            });
        // 这里可以添加点击验证码弹窗确认按钮后的处理逻辑
    };
    const startCountdown = () => {
        setCountdown(60);
        setIsCounting(true);
        const timer = setInterval(() => {
            setCountdown((prevCountdown) => {
                if (prevCountdown === 1) {
                    clearInterval(timer);
                    setIsCounting(false);
                    return 0;
                }
                return prevCountdown - 1;
            });
        }, 1000);
    };
    const ModalFooter: ModalProps["footer"] = (_) => {

        return (
            <div className="flex-y-cc mt-10 mb-3">
                <button
                    type="button"
                    className={`${styles.modal_btn} btn-color`}
                    onClick={handOk}
                >
                    去登录
                </button>
                <button
                    type="button"
                    className={`${styles.modal_btn2} mt-5`}
                    onClick={handCancel}
                >
                    取消
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
            <p className={`${styles.title} `}>
            {acount} 账号已存在，
            是否登录该账号？
            </p>
        </div>
    </Modal>
    );
}

export default RepeatModal;
