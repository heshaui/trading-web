import { Button, Form, Input } from "antd";
import { useTranslation } from "react-i18next";


import type { FormInstance } from "antd/es/form";
import type { CSSProperties } from "react";
import React, { useState } from "react";
import { toast } from "sonner";
// import { ReturnButton } from "./components/ReturnButton";
import { LoginStateEnum, useLoginStateContext } from "./providers/LoginStateProvider";

function RegisterForm() {
	const { t } = useTranslation();
	const { loginState, backToLogin } = useLoginStateContext();
	const formRef = React.useRef<FormInstance>(null); //  使用 ref 来存储 form 实例
	const [countdown, setCountdown] = useState(0);
	const [isCounting, setIsCounting] = useState(false);

	const fromStyle: CSSProperties = {
		borderRadius: "5px",
		boxShadow: "0px 0px 6px 0px rgba(235, 236, 241, 1)",
		padding: "25px",
	};
	// useEffect(() => { });
	if (loginState !== LoginStateEnum.REGISTER) return null;
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
	// 验证码获取
	const sentCode = async () => {
		// 获取表单数据
		const formData = formRef.current?.getFieldsValue();
		if (!formData.email) return toast.error(t("sys.register.emailNullErr"));
		const data = {
			email: formData.email,
		};
		
	};
	const getRegister = async (formData: any) => {
		// if (!codeStart) return toast.error(t("sys.register.codeNullErr"));
		const param = {
			accountName: formData.accountName,
			email: formData.email,
			verificationCode: formData.verificationCode,
			passward: formData.password,
			countryCode: "",
			phoneNumber: "",
		};

	};

	const onFinish = async (values: any) => {
		// console.log("Received values of form: ", values);
		await getRegister(values);
		// backToLogin();
	};

	// const handleCaptchaSuccess = () => {
	// 	console.log("验证码通过");
	// };

	// const handleCaptchaFailure = () => {
	// 	console.log("验证码未通过");
	// };
	// const showVerify = () => {
	// 	captchaRef.current?.verify()

	// }

	return (
		<>
			{/* <div className="mb-4 text-2xl font-bold xl:text-3xl">
				{t("sys.login.signUpFormTitle")}
			</div> */}
			{/* ref={formRef} */}

			<Form
				style={fromStyle}
				name="normal_login"
				size="large"
				initialValues={{ remember: true }}
				onFinish={onFinish}
				ref={formRef}
			>

				<Form.Item name="accountName" rules={[{ required: true, message: t("sys.enterpriseErr") }]}>
					<Input placeholder={t("sys.platform")} allowClear={true} />
				</Form.Item>

				<Form.Item name="email" rules={[{ required: true, message: t("sys.login.emaildPlaceholder") }]}>
					<Input placeholder={t("sys.login.email")} allowClear={true} />
				</Form.Item>
				<Form.Item name="verificationCode" rules={[{ required: true, message: t("sys.codeErr") }]}>
					<div className="flex">
						<Input placeholder={t("sys.code")} allowClear={true} />
						<Button
							type="default"
							className="w-full"
							style={{
								marginLeft: 18,
								width: "75%",
							}}
							onClick={sentCode}
							disabled={isCounting}
						>
							{isCounting ? t("sys.login.sendSmsText", { second: countdown }) : t("sys.getcode")}
						</Button>
						{/* <button type="button" onClick={showVerify} >
							启动验证码
						</button> */}
						{/* <Captcha ref={captchaRef} onSuccess={handleCaptchaSuccess} onFailure={handleCaptchaFailure} /> */}
					</div>
					{/* <Row gutter={18}>
						<Col span={14}>
							<Form.Item
								name="code"
								noStyle
								rules={[{ required: true, message: t("sys.codeErr") }]}
							>
								<Input placeholder={t("sys.code")} />
							</Form.Item>
						</Col>
						<Col span={10}>
							<Button>{t("sys.getcode")}</Button>
						</Col>
					</Row> */}
				</Form.Item>

				<Form.Item name="password" rules={[{ required: true, message: t("sys.login.passwordPlaceholder") }]}>
					<Input.Password type="password" placeholder={t("sys.login.password")} allowClear={true} />
				</Form.Item>
				<Form.Item
					name="confirmPassword"
					rules={[
						{
							required: true,
							message: t("sys.login.confirmPasswordPlaceholder"),
						},
						({ getFieldValue }) => ({
							validator(_, value) {
								if (!value || getFieldValue("password") === value) {
									return Promise.resolve();
								}
								return Promise.reject(new Error(t("sys.login.diffPwd")));
							},
						}),
					]}
				>
					<Input.Password type="password" allowClear={true} placeholder={t("sys.login.confirmPassword")} />
				</Form.Item>
				<Form.Item>
					<Button type="primary" htmlType="submit" className="w-full mt-2 button-color">
						{t("sys.login.registerButton")}
					</Button>
				</Form.Item>

				{/* <div className="mb-2 text-xs text-gray">
					<span>{t("sys.login.registerAndAgree")}</span>
					<a href="./" className="text-sm !underline">
						{t("sys.login.termsOfService")}
					</a>
					{" & "}
					<a href="./" className="text-sm !underline">
						{t("sys.login.privacyPolicy")}
					</a>
				</div> */}

				{/* <ReturnButton onClick={backToLogin} /> */}
			</Form>
			<div className="flex-cc mt-4">
				<p>
					{t("sys.login.isAcount")}
					<span
						className="cursor-pointer"
						style={{ color: "pink"}}
						onClick={backToLogin}
					>
						{t("sys.login.signInFormTitle")}
					</span>
				</p>
			</div>
		</>
	);
}

export default RegisterForm;
