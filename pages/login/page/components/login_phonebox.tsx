import { Button, Form, Input, Select, Space } from "antd";

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
    type: string ;
    phone: string ;
    password: string ;
    deviceType: string ;
    authCodePhone: string ;
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
				console.log(values, 111);
				// goAuthCode()
				const data = {
                    type: "p",
                    phone: values.phoneNumber,
                    deviceType: "web",
                    password: values.password,
                    authCodePhone: "",
					countryCode:values.areaCode
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
        router.push('/resetPassword');
    }
	 const goRegister = () => {
	
		// setLoginState(LoginStateEnum.REGISTER)
		router.push("/register")
	}
	if (loginType !== LoginTypeEnum.PHONE) return null;

	return (
		<div className="flex-y-cc mt-7" >
			<Form
				style={fromStyle}
				name="login"
				size="large"
				form={form}
				// onFinish={onFinish}
				initialValues={{ areaCode: "+1" }}
			// onValuesChange={usernameChange}
			>
				<div className="mb-5 font-16 font-w-500">手机号</div>
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

							<PhoneCodeSelector/>
						{/* </Form.Item> */}
						<Form.Item name="phoneNumber" noStyle rules={[{ required: true, message: "手机号不能为空！" }]}>
							<Input placeholder="请输入手机号" allowClear={true} className={`${styles.mail_input} ml-2`} />
						</Form.Item>
					</div>
				</Form.Item>
				<div className="mb-5 font-16 font-w-500">密码</div>
				<Form.Item name="password" rules={[{ required: true, message: "密码不能为空！" }]}>
					<Input.Password type="password" placeholder="请输入密码" allowClear={true} size="large" className={`${styles.mail_input}`}
					// prefix={
					// 	<Iconify icon="solar:lock-password-linear" className="icon-color" />
					// }
					/>
				</Form.Item>
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
				<Form.Item noStyle>
					<button type="button" className={`${styles.forget_password_button}`} onClick={() => goResetPassword()}>
						{"忘记密码"}
					</button>
				</Form.Item>
				{/* <Form.Item>
					<Button type="primary" htmlType="submit" className="w-full button-color login-button" loading={loading}>
						{"登录"}
					</Button>
				</Form.Item> */}
			</Form>
			<button type="submit"  className={`${styles.login_button} w-full button-color mt-8`}
                onClick={onFinish}>
                {"登录"}
            </button>
			{/* {!loading ? (<button type="submit"  className="w-full button-color login-button mt-8"
                onClick={onFinish}>
                {"登录"}
            </button>) : (<button type="button" className="w-full  mt-8 login-loading"
				onClick={() => setLoading(false)} >
				{"登录"}
			</button>
			)} */}
			{/* <p className="tip-color2 mt-5">或者</p>
			<Button className="w-full google-btn mt-5"
				// onClick={()=>setLoginState(LoginStateEnum.Authcode)}
				icon={<Iconify icon="fa6-brands:google" className="icon-color1" />}
				onClick={() => goAuthCode()}
			>
				使用Google继续
			</Button> */}
			<div className="flex-cc mt-4">
				<p>
					{"没有账号？"}
					<button
						type="button"
						className="text-color"
						onClick={() =>goRegister()}
					>
						{"注册"}
					</button>
				</p>
			</div>
			<SafeModal open={codeModelOpen} 
            acountInfo={loginInfo} 
            onCancel={handCodeCancel} 
             />
		</div>
	);
}

export default Phonebox;
