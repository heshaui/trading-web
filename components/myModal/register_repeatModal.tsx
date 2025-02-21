import { Modal, Form } from "antd";
import type { ModalProps } from "antd/es/modal/interface";
// import { Iconify } from "@/components/icon/index";
import styles from "./style/repeatModal.module.css";
// import { encryptEmail, encryptPhoneNumber } from "@/utils/encrypt";
// import { registerLogic } from "@/store/registerEnum"
// import Image from 'next/image';
type Props = {
    open: boolean;
    acount?: string;
    message?: string;
    type?: string;
    onOk: (event: any) => void;
    onCancel: () => void;
};

function RepeatModal({ open, onOk, acount, onCancel, message, type = 'error' }: Props) {
    const [form] = Form.useForm();
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

    const ModalFooter: ModalProps["footer"] = () => {

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
                <img src="/images/login/icon_faild.png" alt="" className={`${styles.icon_box}`} />
                {type == 'error' && <p className={`${styles.title} `}>
                    {acount} 账号已存在，
                    是否登录该账号？
                </p>}
                {type == 'success' && <p className={`${styles.title} `}>
                    {message}
                </p>}
            </div>
        </Modal>
    );
}

export default RepeatModal;
