// import { Button, Form, Input,Tabs } from "antd";
import { Segmented } from "antd";
import { type CSSProperties, useEffect, useState } from "react";
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
// import QRCodebox from "./components/login_QRcode"
import { LoginTypeEnum, useLoginTypeContext } from "./providers/LoginStateProvider";
import NoteModal from "@/components/myModal/noteModal"

function LoginForm() {
	const [loading, setLoading] = useState(false);
	const [preCheck, setpreCheck] = useState(false); //是否需要二次验证
	const [checkType, setCheckType] = useState<string>(""); //二次验证的类型
	const [codeModelOpen, setCodeModelOpen] = useState(false); //验证码弹窗
	const [noteModelOpen, setNoteModelOpen]=useState(false)

	const [tabsProps, setTabsProps] = useState('email');
	const { loginState, setLoginState } = useLoginStateContext();
	// const signIn = useSignIn();
	const { loginType, setLoginType } = useLoginTypeContext();
	// 当登录状态不为 LOGIN 时不渲染组件

	const handCancel = () => {
		setNoteModelOpen(false);
	};

	const handOk = () => {
		setNoteModelOpen(true);
		// 这里可以添加点击验证码弹窗确认按钮后的处理逻辑
	};

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
			setLoginType(LoginTypeEnum.QRcode)
		}

	};
	if (loginState !== LoginStateEnum.LOGIN) return null;

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
					// {
					// 	label: (
					// 		<div className="tabs-label" >
					// 			<div>QRcode</div>
					// 		</div>
					// 	),
					// 	value: 'QRcode',
					// },
				]}
				onChange={tabsChange}
				value={tabsProps}
			/>
			<Mailbox />
			<Phonebox />
			{/* <QRCodebox/> */}
			<NoteModal open={noteModelOpen}  onCancel={handCancel}/>
		</div>
	);
}

export default LoginForm;
