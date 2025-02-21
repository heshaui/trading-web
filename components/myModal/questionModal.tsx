import { Modal } from "antd";
import type { ModalProps } from "antd/es/modal/interface";
import { Iconify } from "@/components/icon/index";
import styles from "./style/questionModal.module.css";
import { encryptEmail ,encryptPhoneNumber} from "@/utils/encrypt";

type Props = {
    open: boolean;
    acount: string|null;
    type:string|null;
    // onOk: (event: any) => void;
    onOk: () => void;
    onCancel: () => void;
};

function QuestionModal({ open, onOk, acount,type, onCancel }: Props) {
    const handCancel = () => {
        onCancel()
    };

    const handOk = async () => {
        onOk()
        // 这里可以添加点击验证码弹窗确认按钮后的处理逻辑
    };

    const ModalFooter: ModalProps["footer"] = () => {

        return (
            <div className="flex-col flex-ai-start mt-10 mb-3">
                <button
                    type="button"
                    className={`${styles.modal_btn} btn-color`}
                    onClick={handOk}
                >
                    我知道了
                </button>
                <button
                    type="button"
                    className={`${styles.modal_btn2} mt-5`}
                    onClick={handCancel}
                >
                    重新发送验证码
                </button>
            </div>

        );
    };

    return (
        <Modal
            open={open}
            title="无法收到验证码？"
            centered
            onCancel={handCancel}
            footer={ModalFooter}
            width={400}
        >
            <h4 className={`${styles.title_color} mt-7`}>若长时间没有收到验证码，请检查以下事项：</h4>
            <ul>
                <li className={`${styles.tip_color} font-w-400`}>
                    <Iconify icon="mingcute:diamond-square-fill" className={`${styles.text_color} mr-2`} size={10} />
                   {type==="m"&&(<>确保您的邮箱为<span>{acount?encryptEmail(acount):"-"}</span></>)} 
                   {type==="p"&&(<>确保您的手机为<span>{acount?encryptPhoneNumber(acount):"-"}</span></>)} 
                    </li>
                <li className={`${styles.tip_color} font-w-400`}>
                    <Iconify icon="mingcute:diamond-square-fill" className={`${styles.text_color} mr-2`} size={10} />
                    检查验证码是否位于邮箱垃圾箱中</li>
                <li className={`${styles.tip_color} font-w-400`}>
                    <Iconify icon="mingcute:diamond-square-fill" className={`${styles.text_color} mr-2`} size={10} />
                    验证码可能存在延迟，过了10分钟后再试</li>
            </ul>
        </Modal>
    );
}

export default QuestionModal;
