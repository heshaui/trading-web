// import { Button, Form, Input,Tabs } from "antd";
import { Segmented } from "antd";
import { type CSSProperties, useState } from "react";
import { useTranslation } from "react-i18next";
// import type { SignInReq } from "@/api/services/userService";
// import { useSignIn } from "@/store/userStore";
import { LoginStateEnum, useLoginStateContext } from "./providers/LoginStateProvider";
// import FingerprintJS from "@fingerprintjs/fingerprintjs";
// import loginApi from "@/api/login/login";
// import { getEmailCode, getSmsCode } from "@/api/login/register";
// import CodeModel from "./components/codebutton";
import { toast } from "sonner";
import type { TabsProps } from 'antd';
import Mailbox from "./components/login_mailbox"
import Phonebox from "./components/login_phonebox"
import QRCodebox from "./components/login_QRcode"
import { LoginTypeProvider, LoginTypeEnum, useLoginTypeContext } from "./providers/LoginStateProvider";
import { log } from "console";
const fromStyle: CSSProperties = {
	borderRadius: "5px",
	// boxShadow: "0px 0px 6px 0px rgba(235, 236, 241, 1)",
	padding: "25px",
	width: "25vw",
	maxWidth: "400px",
	minWidth: "350px",
};


function LoginForm() {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);
	const [preCheck, setpreCheck] = useState(false); //是否需要二次验证
	const [checkType, setCheckType] = useState<string>(""); //二次验证的类型
	const [codeModelOpen, setCodeModelOpen] = useState(false); //验证码弹窗

	const [tabsProps, setTabsProps] = useState('email');
	const { loginState, setLoginState } = useLoginStateContext();
	// const signIn = useSignIn();
	const { loginType, setLoginType, backToLoginType } = useLoginTypeContext();
	// 当登录状态不为 LOGIN 时不渲染组件
	if (loginState !== LoginStateEnum.LOGIN) return null;

	// 获取浏览器指纹
	// const getFingerprint = async () => {
	// 	const result = await FingerprintJS.load();
	// 	const visitorId = await result.get();
	// 	console.log(visitorId.components.vendor);
	// 	return visitorId.visitorId;
	// };

	const handCancel = () => {
		setCodeModelOpen(false);
	};

	// const handOk = async (type: string) => {
	// 	console.log(type);
	// 	// 这里可以添加点击验证码弹窗确认按钮后的处理逻辑
	// };

	// const handleFinish = async (values: any) => {
	// 	setLoading(true);
	// };

	const usernameChange = (changedValues: any) => {
		Object.keys(changedValues).forEach((key) => {
			if (key === "username" && preCheck) {
				setpreCheck(false);
			}
		});

	}
	const tabsChange = (value: string) => {
		console.log(value);
		setTabsProps(value)
		if (value === "email") {
			setLoginType(LoginTypeEnum.EMAIL)
		} else if (value === "phone") {
			setLoginType(LoginTypeEnum.PHONE)
		} else if (value === "QRcode") {
			backToLoginType()
			setLoginType(LoginTypeEnum.QRcode)
		}

	};
	return (
		<div className="flex-col" style={{ height: "70vh" }}>
			<div className="w-full mb-6"><p className="title-box">登录</p> </div>
			<Segmented
				className="custom-segmented"
				options={[
					{
						label: (
							//  button-color
							<div className="tabs-label" >
								<div>邮箱</div>
							</div>

						),
						value: 'email',
					},
					{
						label: (
							<div className="tabs-label" >
								<div>手机</div>
							</div>

						),
						value: 'phone',
					},
					{
						label: (
							<div className="tabs-label" >
								<div>QRcode</div>
							</div>
						),
						value: 'QRcode',
					},
				]}
				onChange={tabsChange}
				value={tabsProps}
			/>
			{/* <LoginTypeProvider>
				<Mailbox />
				<Phonebox />
			</LoginTypeProvider> */}
			{tabsProps === "email" && (<Mailbox />)}
			{tabsProps === "phone" && (<Phonebox />)}
			{tabsProps === "QRcode" && (<QRCodebox />)}
		</div>
	);
}

export default LoginForm;
