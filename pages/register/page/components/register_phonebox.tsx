import {  Form, Input,  Checkbox, ConfigProvider } from "antd";
import { type CSSProperties } from "react";
import { LoginStateEnum, useLoginStateContext, RegisterTypeEnum, useRegisterTypeContext } from "../providers/LoginStateProvider";
import { toast } from "sonner";
// import "@/styles/components/login/login.css"
// import type { TabsProps } from 'antd';
// import { Iconify } from "@/components/icon/index";
// import { areaCodeOptionList } from "@/utils/enum";;
import store from "@/store";
import PhoneCodeSelector from "@/components/PhoneCodeSelector"
import { useRouter } from 'next/router';
// import {goLogin} from "@/store/loginEnum"
const fromStyle: CSSProperties = {
	borderRadius: "5px",
	// boxShadow: "0px 0px 6px 0px rgba(235, 236, 241, 1)",
	// padding: "25px",
	width: "25vw",
	maxWidth: "400px",
	minWidth: "350px",
};


function RegisterPhone() {
	const router = useRouter();
	const {  setLoginState } = useLoginStateContext();
	const { registerType } = useRegisterTypeContext();
	// const signIn = useSignIn();
	const [form] = Form.useForm();
	// 当注册类型不为 PHONE 时不渲染组件
	if (registerType !== RegisterTypeEnum.PHONE) return null;

	// 获取浏览器指纹
	// const getFingerprint = async () => {
	// 	const result = await FingerprintJS.load();
	// 	const visitorId = await result.get();
	// 	console.log(visitorId.components.vendor);
	// 	return visitorId.visitorId;
	// };

	const goLogin = () => {
        // setLoginState(LoginStateEnum.LOGIN)
        router.push("/login")
    }

	const onFinish = async () => {

		form
			.validateFields()
			.then(async (values) => {
				// form.resetFields(); // 重置表单
				console.log(values, 111);
				if (!values.agree) return toast.error("请先同意用户协议和隐私政策")
				const data = {
					type: "p",
					phone: values.phoneNumber,
					password: values.password,
					parentInviteCode: values.referee,
					countryCode:values.areaCode
				}
				store.updateRegisterInfo(data)

				goAuthCode()
			})
			.catch((info) => {
				console.log("Validate Failed:", info);
			});
		// form.resetFields(); //重置表单
		// setLoading(true);

	};
	// 跳转规则
	const goAuthCode = () => {
        store.setAuthcodeState(LoginStateEnum.REGISTER, RegisterTypeEnum.PHONE); //存储跳转前状态
        setLoginState(LoginStateEnum.Authcode) //设置跳转状态
    }

	// 自定义密码验证规则
	const validatePassword = ( value:any) => {
		if (!value) {
			return Promise.reject(new Error("密码不能为空！"));
		}
		// 检查长度是否在 8 - 30 位之间
		if (value.length < 8 || value.length > 30) {
			return Promise.reject(new Error("密码长度必须在 8 - 30 位之间！"));
		}
		// 检查是否包含字母和数字
		const hasLetter = /[a-zA-Z]/.test(value);
		const hasNumber = /\d/.test(value);
		if (!hasLetter || !hasNumber) {
			return Promise.reject(new Error("密码必须包含字母和数字！"));
		}
		return Promise.resolve();
	};
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
						{/* <Form.Item name="areaCode" noStyle>
							<Select
								defaultValue="1"
								style={{ width: 115 }}
								options={areaCodeOptionList}
								prefix={
									<Iconify icon="zondicons:network" className="icon-color" />
								}
							/>
						</Form.Item> */}
						<PhoneCodeSelector />
						<Form.Item noStyle name="phoneNumber" rules={[{ required: true, message: "手机号不能为空！" }]}>
							<Input placeholder="请输入手机号" allowClear={true} className="ml-2 mail-input" />
						</Form.Item>
					</div>
				</Form.Item>
				<div className="mb-5 font-16 font-w-500">密码</div>
				<Form.Item name="password"
					rules={[{ validator: validatePassword }]}
				>
					<Input.Password type="password" placeholder="请输入密码" allowClear={true} size="large" className="mail-input"
					// prefix={
					// 	<Iconify icon="solar:lock-password-linear" className="icon-color" />
					// }
					/>
				</Form.Item>
				
				<div className="mb-5 font-16 font-w-500">推荐人的邀请码(选填)</div>
				<Form.Item name="referee" rules={[{ required: false, }]}>
					<Input.Password type="password" placeholder="不区分大小写" allowClear={true} size="large" className="mail-input"
					// prefix={
					// 	<Iconify icon="solar:lock-password-linear" className="icon-color" />
					// }
					/>
				</Form.Item>
				<ConfigProvider
					theme={{
						token: {
							colorPrimary: "#FF5F1F"
						},
					}}
				>
					<Form.Item noStyle name="agree" valuePropName="checked" rules={[{ required: false }]}>
						<Checkbox className="custom-checkbox  text-color-default">我已阅读并同意 <span className="text-color">用户协议</span> 和 <span className="text-color">隐私政策</span></Checkbox>
					</Form.Item>
				</ConfigProvider>
			</Form>
			{/* <Button type="primary" htmlType="submit" className="w-full button-color login-button mt-8" loading={loading}
				onClick={onFinish}>
				{"注册"}
			</Button> */}
			<button type="submit" className="w-full button-color login-button mt-8"
				onClick={onFinish}>
				{"注册"}
			</button>
			{/* <p className="tip-color2 mt-5">或者</p>
			<Button className="w-full google-btn mt-5" loading={loading}
				icon={<Iconify icon="fa6-brands:google" className="icon-color1" />}
				onClick={() => goAuthCode()}
			>
				使用Google继续
			</Button> */}
			<div className="flex-cc mt-4">
				<p>
					{"已有账号？"}
					<button
						type="button"
						className="text-color"
						onClick={goLogin}
					>
						{"登录"}
					</button>
				</p>
			</div>
		</div>
	);
}

export default RegisterPhone;
