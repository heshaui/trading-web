/* eslint-disable react-hooks/exhaustive-deps */
// import { Button, Form, Input,Tabs } from "antd";
import { Input, Form } from 'antd';
// import type { AutoCompleteProps } from 'antd';
import { useState, useEffect } from "react";
import { useResetStateContext, ResetStateEnum } from "@/config/reset-providers/ResetStateProvider";
import { toast } from "sonner";
// import store from "@/store";
import styles from "../style/reset.module.css"
import { encryptString } from "@/utils/encrypt"
import QuestionModal from "@/components/myModal/questionModal";
import { getResetMailCode, getResetSmsCode, getResetPasswordCheck } from "@/services/resetPassword"
import { encryptData } from "@/utils/encrypt";
function ResetPassword() {
    const [form] = Form.useForm();
    const { resetState, setResetState, acount } = useResetStateContext();
    // const [authCode, setAuthCode] = useState('');
    const [pointout, setPointout] = useState(false);
    // const [options, setOptions] = useState<AutoCompleteProps['options']>([]);
    const [countdown, setCountdown] = useState(0);
    const [isCounting, setIsCounting] = useState(false);
    const [isLoding, setIsLoding] = useState(false);
    const [isCodeLoding, setIsCodeLoding] = useState(false);



    const goNext = () => {
        form
            .validateFields()
            .then(async (values) => {
                setIsLoding(true)
                try {
                    const dataInfo = {
                        type: acount.type,
                        account: acount.acount,
                        code: values.code
                    }
                    const dataEncrypt = await encryptData(dataInfo)
                    const res = await getResetPasswordCheck(dataEncrypt)
                    if (res.code === '0') {
                        setResetState(ResetStateEnum.RESET)
                    } else {
                        toast.error(res.message)
                    }
                    setIsLoding(false)
                } catch (error) {
                    setIsLoding(false)
                    toast.error(String(error))
                }
            })

            .catch((info) => {
                console.log("Validate Failed:", info);
            });
    }
    const goLast = () => {
        setResetState(ResetStateEnum.INPUT)
    }
    const getResetCode = async () => {
        if (isCounting || isLoding||isCodeLoding) return
        setIsCodeLoding(true)
        try {
            if (acount.type == 'm' || acount.type == 'email') {
                const dataInfo = {
                    number: acount.acount,
                    deviceType: 'web'
                }
                const dataEncrypt = await encryptData(dataInfo)
                const res = await getResetMailCode(dataEncrypt)
                if (res.code === "0") {
                    toast.success(res.message)
                    startCountdown();
                } else if (res.code === "10044") {
                    toast.error(res.message)
                }
                setIsCodeLoding(false)

            } else if (acount.type == 'p' || acount.type == 'phone') {
                const dataInfo = {
                    number: acount.acount,
                    code: acount.areaCode?.replace("+", ""),
                    deviceType: 'web'
                }
                const dataEncrypt = await encryptData(dataInfo)
                const res = await getResetSmsCode(dataEncrypt)
                if (res.code === "0") {
                    toast.success(res.message)
                    startCountdown();
                } else if (res.code === "10044") {
                    toast.error(res.message)
                }
                setIsCodeLoding(false)
            }
        } catch (error) {
            setIsCodeLoding(false)
            toast.error(String(error))
        }
    };
    // const getCode = async () => {
    //     await getResetCode()
    // }

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
    useEffect(() => {
        // if (resetState == ResetStateEnum.SENTCODE&&!isLoding&&!isCounting) {
        if (resetState == ResetStateEnum.SENTCODE) {
             getResetCode() 
        }
    }, [resetState])
    // 当状态不为 INPUT 时不渲染组件
    if (resetState !== ResetStateEnum.SENTCODE) return null;


    return (
        <div className="flex-col" style={{ height: "70vh", width: "100%" }}>
            <div className="mb-2 font-w-500 flex-col" style={{ width: "300px" }}>已发送验证码至
                <span className={`${styles.text_color} font-w-400 mt-2`}>{encryptString(acount.acount.toString()) || '-'}</span>
            </div>
            <div className='mt-1'>
                <Form
                    name="aount"
                    form={form}
                >
                    <Form.Item noStyle name="code" rules={[{ required: true, message: "验证码不能为空！" }]}>
                        <Input
                            placeholder="请输入"
                            style={{ borderRadius: "8px", height: "50px" }}
                            // value={authCode}
                            allowClear
                            size='large'
                            suffix={
                                <button type='button' className={isCounting ? `${styles.text_color}` : 'text-color'} onClick={getResetCode}>
                                    {isCounting ? `${countdown}s 重发` : "重新发送"}
                                </button>
                            }
                            className='custom-input'
                        />
                    </Form.Item>
                </Form>
                <div className='flex mt-10'>
                    <button
                        className={`${styles.goBack_btn} mr-4`}
                        onClick={() => goLast()}>返回</button>
                    <button type='submit' className={`btn-color ${styles.next_btn} flex-1`} onClick={() => goNext()}>下一步</button>
                </div>
                <div>
                    <button
                        type="button"
                        className={`text-color mt-5`}
                        onClick={() => setPointout(true)}
                    >
                        收不到验证码？
                    </button>
                </div>
            </div>
            <QuestionModal open={pointout} onOk={() => setPointout(false)} type={"email"} acount={acount.acount} onCancel={() => setPointout(false)} />
        </div>
    );
}

export default ResetPassword;
