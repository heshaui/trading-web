// import { Button, Form, Input,Tabs } from "antd";
import { ConfigProvider, Tabs } from "antd";
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
import "@/styles/components/login/login.css"
import type { TabsProps } from 'antd';
import Mailbox from "./common/login_mailbox"
import Phonebox from "./common/login_phonebox"

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
	const { loginState, setLoginState } = useLoginStateContext();
	// const signIn = useSignIn();

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

	const handOk = async (type: string) => {
		console.log(type);
		// 这里可以添加点击验证码弹窗确认按钮后的处理逻辑
	};

	const handleFinish = async (values: any) => {
		setLoading(true);
		// try {
		// 	const fingerprintCode = await getFingerprint(); // 获取浏览器指纹
		// 	const param = {
		// 		username: values.username,
		// 		passward: values.password,
		// 		code: values.code || "",
		// 		deviceId: fingerprintCode,
		// 		deviceType: "",
		// 		deviceName: "",
		// 	};
		// 	// console.log(param);

		// 	const data = encryptWithPublicKey(JSON.stringify(param));
		// 	if (typeof data !== "string") {
		// 		throw new Error("加密失败");
		// 	}
		// 	if (!preCheck) {
		// 		await getPreCheck(values.username, fingerprintCode, data);
		// 	} else {
		// 		await signIn(data);
		// 	}
		// } catch (error) {
		// 	console.error(t("sys.api.apiRequestFailed"));
		// } finally {
		// 	setLoading(false);
		// }
	};

	// const getPreCheck = async (username: string, deviceId: string, dataInfo: any) => {
	// 	try {
	// 		const param = {
	// 			username,
	// 			deviceId,
	// 		};
	// 		const data = encryptWithPublicKey(JSON.stringify(param));
	// 		const res = await loginApi.preCheck({ data });
	// 		if (res.code === 0) {

	// 			if (!res.data.type) {
	// 				setCodeModelOpen(false);
	// 				await signIn(dataInfo);
	// 			} else {
	// 				setpreCheck(true);
	// 				if (res.data.type === 0) {
	// 					setCheckType("phone");
	// 				} else if (res.data.type === 1) {
	// 					setCheckType("email");
	// 				}
	// 			}
	// 		} else {
	// 			toast.error(res.message);
	// 		}
	// 	} catch (error) {
	// 		console.error(t("sys.api.apiRequestFailed"));
	// 	}
	// };

	const usernameChange = (changedValues: any) => {
		Object.keys(changedValues).forEach((key) => {
			if (key === "username" && preCheck) {
				setpreCheck(false);
			}
		});

	}
	const items: TabsProps['items'] = [
		{
			key: '1',
			label: '邮箱',
			children: <Mailbox />,
		},
		{
			key: '2',
			label: '手机',
			children: <Phonebox />,
		},
		{
			key: '3',
			label: 'QRcode',
			children: 'Content of Tab Pane 3',
		},
	];
	const onChange = (key: string) => {
		console.log(key);
	};
	return (
		<div className="flex-y-cc" style={fromStyle}>
			<div className="w-full mb-6"><p className="title-box">登录</p> </div>
			<ConfigProvider
				theme={{
					components: {
						Tabs: {
							borderRadius: 32,
							itemActiveColor: "#fff",
							itemSelectedColor: "#fff",
							colorBgContainer:"linear-gradient(90deg, #00EEFF 0%, #1F40FF 100%)",
							algorithm: true, // 启用算法
						},
					},
					token: {
						// borderRadius: 32,
						// borderRadiusLG:32,
						// colorBgContainer:"linear-gradient(90deg, #00EEFF 0%, #1F40FF 100%)"
					}
				}}>
				<Tabs type="card" defaultActiveKey="1" items={items} onChange={onChange} />

			</ConfigProvider>
			{/* <Form
				style={fromStyle}
				name="login"
				size="large"
				initialValues={{
					remember: true,
				}}
				onFinish={handleFinish}
				onValuesChange={usernameChange}
			>
				<Form.Item name="username" rules={[{ required: true, message: "手机号不能为空！" }]}>
					<Input placeholder="请输入手机号" allowClear={true} />
				</Form.Item>
				<Form.Item name="password" rules={[{ required: true, message: "密码不能为空！" }]}>
					<Input.Password type="password" placeholder="请输入密码" allowClear={true} />
				</Form.Item> */}
			{/* {preCheck && (
					<Form.Item name="code" rules={[{ required: true, message: t("sys.codeErr") }]} style={{ marginBottom: 33 }}>
						<div className="flex">
							<Input placeholder={t("sys.code")} allowClear={true} />
							<Button
								type="default"
								className="w-full"
								style={{
									marginLeft: 18,
									width: "75%",
								}}
								onClick={() => setCodeModelOpen(true)}
							>
								{t("sys.getcode")}
							</Button>
						</div>
					</Form.Item>
				)} */}
			{/* <Form.Item >
					<button type="button" className="forgetPassword-button" >
						{"忘记密码"}
					</button>
				</Form.Item>
				<Form.Item>
					<Button type="primary" htmlType="submit" className="w-full button-color login-button" loading={loading}>
						{"登录"}
					</Button>
				</Form.Item>
			</Form> */}
			{/* <CodeModel open={codeModelOpen} onCancel={handCancel} onOk={handOk} type={checkType} /> */}
			{/* <div className="flex-cc mt-4">
				<p>
					{"没有账号？"}
					<button
						type="button"
						style={{ color: "#1F40FF" }}
						onClick={() => setLoginState(LoginStateEnum.REGISTER)}
					>
						{"注册"}
					</button>
				</p>
			</div> */}
		</div>
	);
}

export default LoginForm;
