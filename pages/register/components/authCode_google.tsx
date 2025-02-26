// import { Button, Form, Input,Tabs } from "antd";
import { Input, Button } from 'antd';
// import {  useState, useRef } from "react";
import { LoginTypeEnum,
     useLoginTypeContext, 
    RegisterTypeEnum, 
    useRegisterTypeContext, 
    LoginStateEnum,
    useLoginStateContext } from "@/config/register-providers/LoginStateProvider";
// import { toast } from "sonner";
import store from "@/store";




function AuthCodeGoogle() {

    // const [tabsProps, setTabsProps] = useState('email');
    // const signIn = useSignIn();
    // const { loginType, setLoginType } = useLoginTypeContext();
    // const { registerType, setRegisterType } = useRegisterTypeContext();
    // const { loginState, backToLogin, setLoginState } = useLoginStateContext();
    const {  setLoginType } = useLoginTypeContext();
    const {  setRegisterType } = useRegisterTypeContext();
    const { loginState, setLoginState } = useLoginStateContext();
    // const [authCode, setAuthCode] = useState('');
    // 当状态不为 Authcode 时不渲染组件
    // if (loginType !== LoginTypeEnum.Authcode || registerType !== RegisterTypeEnum.Authcode) return null;
    if (loginState !== LoginStateEnum.Googlecode) return null;

    // 定义粘贴功能的处理函数
    // const handlePaste = async () => {
    //     try {
    //         // 使用 Clipboard API 读取剪贴板内容
    //         const clipboardData = await navigator.clipboard.readText();
    //         // 如果输入框引用存在，将剪贴板内容赋值给输入框的值
    //         // if (inputRef.current) {
    //         //     inputRef.current.input.value = clipboardData;
    //         // }
    //         if(clipboardData){
    //             setAuthCode(clipboardData)
    //         }
    //     } catch (error) {
    //         // 捕获并打印可能出现的错误
    //         console.error('Err:', error);
    //     }
    // };

    const goBackPage = () => {
        const authcodeState = store.authcodeState
        if (authcodeState.state === LoginStateEnum.LOGIN) {
            setLoginState(authcodeState.state)
            if (authcodeState.type === LoginTypeEnum.EMAIL || authcodeState.type === LoginTypeEnum.PHONE) {
                setLoginType(authcodeState.type)
            }
        } else if (authcodeState.state === LoginStateEnum.REGISTER) {
            setLoginState(authcodeState.state)
            if (authcodeState.type === RegisterTypeEnum.EMAIL || authcodeState.type === RegisterTypeEnum.PHONE) {
                setRegisterType(authcodeState.type)
            }
        }
    }

    return (
        <div className="flex-col" style={{ height: "70vh", width: "100%" }}>
            <div className="mb-6 authcode-header font-w-500" style={{ width: "300px" }}>Google验证</div>
            <div>
                <Input
                    placeholder="Google验证码"
                    // prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                    suffix={
                        <button className='text-color'>发送</button>
                    }
                    className='authcode-input'
                    style={{ borderRadius: "8px" }}
                    // value={authCode}
                    allowClear
                />
                {/* <button className='text-color mt-1' onClick={handlePaste}>粘贴</button> */}
                <div className='flex mt-10'>
                    <Button
                        className='goback-btn'
                        onClick={() => goBackPage()}>返回</Button>
                    <Button className='btn-color submit-btn'>提交</Button>
                </div>
            </div>
        </div>
    );
}

export default AuthCodeGoogle;
