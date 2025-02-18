"use client";
import { Input, Button, Form } from 'antd';
import { type CSSProperties, useEffect, useState } from "react";
import { LoginTypeEnum, useLoginTypeContext, RegisterTypeEnum, useRegisterTypeContext, LoginStateEnum, useLoginStateContext } from "../providers/LoginStateProvider";
import { toast } from "sonner";
import store from "@/store";
import { encryptWithPublicKey } from "@/utils/jsENcrypy"; //登录加密
import QuestionModal from "@/components/myModal/questionModal";
import { encryptEmail, encryptPhoneNumber } from "@/utils/encrypt";
import { registerLogic } from "@/store/registerEnum";
import { getRegister, getRegisterMailCode, getRegisterSmsCode } from "@/services/login";
interface ApiResponse {
    code: number;
    message?: string;
}
function AuthCode() {
    const [pointout, setPointout] = useState(false);

    const { loginType, setLoginType } = useLoginTypeContext();
    const { registerType, setRegisterType } = useRegisterTypeContext();
    const { loginState, backToLogin, setLoginState } = useLoginStateContext();
    const [countdown, setCountdown] = useState(0);
    const [isCounting, setIsCounting] = useState(false);
    const registerInfo = store.registerInfo;

    const [form] = Form.useForm();




    useEffect(() => {
        if (loginState == LoginStateEnum.Authcode && !isCounting) {
            getRegisterCode();
        }
    }, [loginState]);



    const goBackPage = () => {
        const authcodeState = store.authcodeState;
        if (authcodeState.state === LoginStateEnum.LOGIN) {
            setLoginState(authcodeState.state);
            if (authcodeState.type === LoginTypeEnum.EMAIL || authcodeState.type === LoginTypeEnum.PHONE) {
                setLoginType(authcodeState.type);
            }
        } else if (authcodeState.state === LoginStateEnum.REGISTER) {
            setLoginState(authcodeState.state);
            if (authcodeState.type === RegisterTypeEnum.EMAIL || authcodeState.type === RegisterTypeEnum.PHONE) {
                setRegisterType(authcodeState.type);
            }
        }
    };

    const onSubmit = () => {
        form
            .validateFields()
            .then(async (values) => {
                // form.resetFields(); // 重置表单
                console.log(values, 111);
                let dataInfo = {};
                if (registerInfo.type === 'm') {
                    dataInfo = {
                        type: registerInfo.type,
                        email: registerInfo.email,
                        password: registerInfo.password,
                        parentInviteCode: registerInfo.parentInviteCode || "",
                        code: values.code
                    };
                    
                } else if (registerInfo.type === 'p') {
                    dataInfo = {
                        type: registerInfo.type,
                        phone: registerInfo.phone,
                        password: registerInfo.password,
                        parentInviteCode: registerInfo.parentInviteCode || "",
                        countryCode: registerInfo.countryCode?.replace("+", ""),
                        code: values.code
                    };
                }
                console.log(dataInfo, 123);

                // const dataEncrypt = encryptWithPublicKey(JSON.stringify(dataInfo))
                //  const res=await getRegister({data:dataEncrypt});
                // await registerLogic(dataEncrypt)
            })
            .catch((info) => {
                console.log("Validate Failed:", info);
            });
    };

    const getRegisterCode = async () => {
        if (isCounting) return
        try {
            if (registerInfo.type === 'm') {
                const dataInfo = {
                    number: registerInfo.email||'',
                    // code: "",
                    deviceType: "web"
                };
                // const dataEncrypt = encryptWithPublicKey(JSON.stringify(dataInfo))
                const res = await getRegisterMailCode(dataInfo);
                if(res.code === 600){
                    toast.success("验证码发送成功")
                    startCountdown();
                }
            } else if (registerInfo.type === 'p') {
                const dataInfo = {
                    number: registerInfo.phone,
                    code: registerInfo.countryCode?.replace("+", "") ,
                    deviceType: "web"
                };
                // const dataEncrypt = encryptWithPublicKey(JSON.stringify(dataInfo))
                const res = await getRegisterSmsCode(dataInfo);
                if(res.code === 600){
                    toast.success("验证码发送成功")
                    startCountdown();
                }
            }
        } catch (error) {
            console.error('获取验证码出错:', error);
        }
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
        // 清理定时器
        return () => clearInterval(timer);
    };

    // 当状态不为 Authcode 时不渲染组件
    if (loginState !== LoginStateEnum.Authcode) return null;

    return (
        <div className="flex-col" style={{ height: "70vh", width: "100%" }}>
            {/* <div className="mb-6 authcode-header font-w-500" style={{ width: "300px" }}>邮箱/手机号验证</div> */}
            <div className='mb-2'>
                <p className='font-16 font-w-500 mb-1'>已发送验证码至</p>
                <p className='tip-color1'>
                    <span>{registerInfo.countryCode}&nbsp;&nbsp;</span>
                    {registerInfo.type === 'm' ? encryptEmail(registerInfo.email) : encryptPhoneNumber(registerInfo.phone)}
                </p>
            </div>
            <Form
                name="login"
                size="large"
                form={form}
            // initialValues={{
            //     remember: true,
            // }}
            >
                <Form.Item name="code" rules={[{ required: true, message: "验证码不能为空！" }]}>
                    <Input
                        placeholder="邮箱/手机号验证"
                        // prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                        suffix={
                            <button type='button' className={isCounting ? 'tip-color1' : 'text-color'} onClick={getRegisterCode}>
                                {isCounting ? `${countdown}s 重发` : "重新发送"}
                            </button>
                        }
                        className='authcode-input mail-input'
                        style={{ borderRadius: "8px" }}
                    />
                    {/* <button className='text-color mt-1'>粘贴</button> */}
                </Form.Item>
            </Form>
            <div className='flex mt-6'>
                <button
                    type='button'
                    className='goback-btn'
                    onClick={() => goBackPage()}
                >返回</button>
                <button type='submit' className='btn-color submit-btn' onClick={onSubmit}>提交</button>
            </div>
            <div>
                <button
                    type="button"
                    className="text-color mt-5"
                    onClick={() => setPointout(true)}
                >
                    收不到验证码？
                </button>
            </div>

            <QuestionModal open={pointout} onOk={() => setPointout(false)} type={"email"} acount={"acount"} onCancel={() => setPointout(false)} />
        </div>
    );
}

export default AuthCode;