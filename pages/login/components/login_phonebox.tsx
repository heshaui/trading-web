"use client";
import { Button, Form, Input, ConfigProvider } from "antd";
import { type CSSProperties, useState } from "react";
import { LoginStateEnum, useLoginStateContext, LoginTypeEnum, useLoginTypeContext } from "@/config/login-providers/LoginStateProvider";
import PhoneCodeSelector from "@/components/PhoneCodeSelector"
import SafeModal from "@/components/myModal/login_safeModal"
import { useRouter } from 'next/router';
import styles from '../styles/login.module.css'

const fromStyle: CSSProperties = {
	borderRadius: "5px",
	// boxShadow: "0px 0px 6px 0px rgba(235, 236, 241, 1)",
	// padding: "25px",
	width: "25vw",
	maxWidth: "400px",
	minWidth: "350px",
};
interface useInfoType {
	type: string;
	phone: string;
	password: string;
	deviceType: string;
	authCodePhone: string;
}

function Phonebox() {
	const router = useRouter();
	// const [loading, setLoading] = useState(false);
	const [codeModelOpen, setCodeModelOpen] = useState(false); //验证码弹窗
	// const { loginState,setLoginState } = useLoginStateContext(); // 
	const { loginType } = useLoginTypeContext(); //, setLoginType
	const [loginInfo, setLoginInfo] = useState<useInfoType>({
		type: "",
		phone: "",
		password: "",
		deviceType: "",
		authCodePhone: "",
	});
	// const signIn = useSignIn();
	const [form] = Form.useForm();
	const phoneNumber = Form.useWatch('phoneNumber', form);
	const areaCode = Form.useWatch('areaCode', form);
	// 当登录类型不为 PHONE 时不渲染组件
	// if (loginState !== LoginStateEnum.LOGIN) return null;
	const handCodeCancel = () => {
		setCodeModelOpen(false)
	}

	const onFinish = async () => {
		form
			.validateFields()
			.then(async (values) => {
				// form.resetFields(); // 重置表单
				// console.log(values, 111);
				// goAuthCode()
				const data = {
					type: "p",
					phone: values.phoneNumber,
					deviceType: "web",
					password: values.password,
					authCodePhone: "",
					countryCode: values.areaCode
				}
				setLoginInfo(data)
				setCodeModelOpen(true)
			})
			.catch((info) => {
				console.log("Validate Failed:", info);
			});
		// form.resetFields(); //重置表单
		// setLoading(true);

	};

	// const usernameChange = (changedValues: any) => {
	// 	Object.keys(changedValues).forEach((key) => {
	// 		if (key === "username" && preCheck) {
	// 			setpreCheck(false);
	// 		}
	// 	});

	// }
	// const goAuthCode = () => {
	// 	store.setAuthcodeState(LoginStateEnum.LOGIN, LoginTypeEnum.PHONE);
	// 	setLoginState(LoginStateEnum.Googlecode)
	// }
	// const goAuthCode = () => {
	//     store.setAuthcodeState(LoginStateEnum.LOGIN, LoginTypeEnum.PHONE);
	//     setLoginState(LoginStateEnum.Authcode)
	// }
	const goResetPassword = () => {

		router.push('/resetPassword?acount=' + phoneNumber + '&type=p' + '&areaCode=' + areaCode);
	}
	const goRegister = () => {

		// setLoginState(LoginStateEnum.REGISTER)
		router.push("/register")
	}
	if (loginType !== LoginTypeEnum.PHONE) return null;

	return (
		<div className="flex-y-cc mt-7" >
			<ConfigProvider
				theme={{
					components: {
						Form: {
							itemMarginBottom: 20, // 去除表单项之间的间距
						},
						Input: {
							controlHeightLG: 50,
							activeBorderColor: '#FF5F1F',
							hoverBorderColor: '#FF5F1F',
							activeBg: 'var(--background11)',
							hoverBg: 'var(--background11)',
						},
						Select: {
							selectorBg: 'var(--background11)',
						}
					},
					token: {
						// colorBgContainerDisabled: '#fff',
					}
				}}
			>
				<Form
					style={fromStyle}
					name="login"
					size="large"
					form={form}
					// onFinish={onFinish}
					initialValues={{ areaCode: "+1" }}
				// onValuesChange={usernameChange}
				>
					<div className={`${styles.title_color} mb-5 font-16 font-w-500`}>手机号</div>
					<Form.Item >
						<div className="flex">
							{/* <Form.Item name="areaCode" noStyle> */}
							{/* <Select
								defaultValue="1"
								style={{ width: 115 }}
								options={areaCodeSelectList}
								prefix={
									<Iconify icon="zondicons:network" className="icon-color" />
								}
								// optionRender={(option) => (
								// 	<Space style={{ width: "360px" }}>
								// 		<span aria-label={option.data.value}>
								// 			{option.data.cnName}
								// 		</span>
								// 		{option.data.showName}
								// 	</Space>
								// )}
								// showSearch
								// filterOption={(inputValue, option) => {
                                //     return (
                                //         (option?.showName ?? '').toLowerCase().includes(inputValue.toLowerCase())
                                //     );
                                // }}
							/> */}

							<PhoneCodeSelector />
							{/* </Form.Item> */}
							<Form.Item name="phoneNumber" noStyle rules={[{ required: true, message: "手机号不能为空！" }]}>
								<Input placeholder="请输入手机号" allowClear={true} className={`${styles.mail_input} ml-2 modal-input`} />
							</Form.Item>
						</div>
					</Form.Item>
					<div className={`${styles.title_color} mb-5 font-16 font-w-500`}>密码</div>
					<Form.Item name="password" rules={[{ required: true, message: "密码不能为空！" }]}>
						<Input.Password type="password" placeholder="请输入8-30位密码" maxLength={30} allowClear={true} size="large" 
						className={`${styles.mail_input} modal-input`}
						// prefix={
						// 	<Iconify icon="solar:lock-password-linear" className="icon-color" />
						// }
						/>
					</Form.Item>
					<Form.Item noStyle>
						<button type="button" className={`${styles.forget_password_button}`} onClick={() => goResetPassword()}>
							{"忘记密码"}
						</button>
					</Form.Item>
				</Form>
				<button type="submit" className={`${styles.login_button} w-full button-color mt-8`}
					onClick={onFinish}>
					{"登录"}
				</button>
				<div className="flex-cc mt-4">
					<p>
						{"没有账号？"}
						<button
							type="button"
							className="text-color"
							onClick={() => goRegister()}
						>
							{"注册"}
						</button>
					</p>
				</div>
				<SafeModal open={codeModelOpen}
					acountInfo={loginInfo}
					onCancel={handCodeCancel}
				/>
			</ConfigProvider>
		</div>
	);
}

export default Phonebox;
