import { Modal, Form, Input } from "antd";
import { type CSSProperties, useState, useEffect } from "react";;
import type { ModalProps } from "antd/es/modal/interface";
import { Iconify } from "@/components/icon/index";
import store from "@/store"
import { useRouter } from 'next/router';
import styles from "./style/safeModal.module.css";
import { encryptEmail ,encryptPhoneNumber} from "@/utils/encrypt"; 
import QuestionModal from "@/components/myModal/questionModal";

type Props = {
    open: boolean;
    acount: string;
    type: string;
    onOk: (event: any) => void;
    onCancel: () => void;
};

function SafeModal({ open, onOk, acount,type, onCancel }: Props) {
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
            <div className="flex-col flex-ai-start mt-10 mb-3">
                <button
                    type="button"
                    className={`${styles.modal_btn} btn-color`}
                    onClick={handOk}
                >
                    确认
                </button>
                <button
                    type="button"
                    className={`${styles.text_color} mt-5`}
                    onClick={() => setPointout(true)}
                >
                    收不到验证码？
                </button>
            </div>

        );
    };

    return (
        <Modal
            open={open}
            title="安全验证"
            centered
            onCancel={handCancel}
            footer={ModalFooter}
            width={400}
        >
            <h4 className={`${styles.title_color} mt-7`}>{type=='email'?'邮箱验证码':"手机验证码"}</h4>
            <p className={`${styles.tip_color} mt-1`}>验证码已发送至 <span>{type=='email'?encryptEmail(acount):encryptPhoneNumber(acount)}</span></p>
            <Form form={form} style={{ margin: "10px 0" }} colon={false}>
                <Form.Item name="oldPassword" rules={[{ required: true, message: "不能为空！" }]} className="position-relative">
                    <Input
                        className="custom-input mb-2"
                        style={{ width: "100%", height: "40px" }}
                        placeholder="请输入"
                        allowClear
                        suffix={
                            <button type="button" onClick={startCountdown} className={`${styles.text_color} `} >
                                {isCounting ? `${countdown}s 重发` : "重新发送"}
                                {/* {isCounting ? t("sys.login.sendSmsText", { second: countdown }) : t("sys.getcode")} */}
                            </button>
                        }
                    />
                    <span className={`${styles.text_color} ${styles.code_err}`}>验证码错误</span>
                </Form.Item>
            </Form>
            <QuestionModal open={pointout} onOk={() => setPointout(false)} type={type} acount={acount} onCancel={() => setPointout(false)} />
        </Modal>
    );
}

export default SafeModal;
