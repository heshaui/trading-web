// import { Button, Form, Input,Tabs } from "antd";
import { Input,Button } from 'antd';
import { type CSSProperties, useState } from "react";
import { LoginTypeEnum, useLoginTypeContext,RegisterTypeEnum, useRegisterTypeContext,LoginStateEnum,useLoginStateContext} from "../providers/LoginStateProvider";
import { toast } from "sonner";
import store from "@/store";
const fromStyle: CSSProperties = {
	borderRadius: "5px",
	// boxShadow: "0px 0px 6px 0px rgba(235, 236, 241, 1)",
	padding: "25px",
	width: "25vw",
	maxWidth: "400px",
	minWidth: "350px",
};


function AuthCode() {

	// const [tabsProps, setTabsProps] = useState('email');
	// const signIn = useSignIn();
	const { loginType, setLoginType } = useLoginTypeContext();
    const { registerType,setRegisterType } = useRegisterTypeContext();
    const { loginState, backToLogin,setLoginState } = useLoginStateContext();
	// 当状态不为 Authcode 时不渲染组件
	// if (loginType !== LoginTypeEnum.Authcode || registerType !== RegisterTypeEnum.Authcode) return null;
	if ( loginState !== LoginStateEnum.Authcode) return null;



	const goBackPage=()=>{
        const authcodeState=store.authcodeState
        if(authcodeState.state===LoginStateEnum.LOGIN){
            setLoginState(authcodeState.state)
            if(authcodeState.type===LoginTypeEnum.EMAIL||authcodeState.type===LoginTypeEnum.PHONE){
                setLoginType(authcodeState.type)
            }
        }else if(authcodeState.state===LoginStateEnum.REGISTER){
            setLoginState(authcodeState.state)
            if(authcodeState.type===RegisterTypeEnum.EMAIL||authcodeState.type===RegisterTypeEnum.PHONE){
                setRegisterType(authcodeState.type)
            }
        }
    }

	return (
		<div className="flex-col" style={{ height: "70vh",width: "100%" }}>
			<div className="mb-6" style={{ width: "300px" }}>邮箱/手机号验证</div>
            <div>
                <Input 
                placeholder="Enter your username"
                // prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                suffix={
                    <button className='text-color'>发送</button>
                }/>
                <div className='flex mt-6'>
                <Button onClick={()=>goBackPage()}>返回</Button>
                <Button>提交</Button>
                </div>
            </div>
		</div>
	);
}

export default AuthCode;
