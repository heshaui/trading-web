"use client";
import { Form, Input, Checkbox, ConfigProvider } from "antd";
import { type CSSProperties, useState } from "react";
import { LoginStateEnum, useLoginStateContext, RegisterTypeEnum, useRegisterTypeContext } from "@/config/register-providers/LoginStateProvider";
import { toast } from "sonner";
// import "@/styles/components/login/login.css"
// import type { TabsProps } from 'antd';
import { Iconify } from "@/components/icon/index";
// import { areaCodeOptionList } from "@/utils/enum";;
import store from "@/store";
import PhoneCodeSelector from "@/components/PhoneCodeSelector"
import { useRouter } from 'next/router';
import styles from '../styles/login.module.css'
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
    const [isOpen, setIsOpen] = useState(true); //是否展开

	  // 密码校验状态
	  const [lengthValid, setLengthValid] = useState(false);
	  const [charValid, setCharValid] = useState(false)
	  const [showLengthCheck, setShowLengthCheck] = useState(false);
	  const [showCharCheck, setShowCharCheck] = useState(false);
	const router = useRouter();
	const { setLoginState } = useLoginStateContext();
	const { registerType } = useRegisterTypeContext();
	// const signIn = useSignIn();
	const [form] = Form.useForm();
	// 当注册类型不为 PHONE 时不渲染组件

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
					countryCode: values.areaCode
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
	const validatePassword = (_: any, value: string) => {
		if (typeof value === 'string') {
			value = value.trim();
		}
		if (!value) {
			return Promise.reject(new Error("密码不能为空！"));
		}
		// 检查长度是否在 8 - 30 位之间
		if (value.length < 8 || value.length > 30) {
			return Promise.reject();
		}
		// 检查是否包含字母和数字
		// const hasLetter = /[a-zA-Z]/.test(value);
		// const hasNumber = /\d/.test(value);
		const hasRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,30}$/;
		// console.log('密码是否通过正则校验:',value,1, hasRegex.test(value),111); // 新增调试信息
		if (!hasRegex.test(value)) {
			return Promise.reject();
		}

		return Promise.resolve();
	};
    // 监听密码输入变化
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // 检查长度
        const isLengthValid = value.length >= 8 && value.length <= 30;

        // 检查是否包含字母和数字
        const hasUpperLetter = /[a-zA-Z]/.test(value);
        const hasNumber = /\d/.test(value);
        const isCharValid = hasUpperLetter && hasNumber;

        // 更新状态
        setLengthValid(isLengthValid);
        setCharValid(isCharValid);

        // 显示长度校验，隐藏字符校验
        setShowLengthCheck(true);
        setShowCharCheck(false);

        // 如果长度校验通过，1秒后切换到字符校验
        if (isLengthValid) {
            setTimeout(() => {
                setShowLengthCheck(false);
                setShowCharCheck(true);

                // 如果字符校验也通过，1秒后隐藏
                if (isCharValid) {
                    setTimeout(() => {
                        setShowCharCheck(false);
                    }, 1000);
                }
            }, 1000);
        }
    };





	if (registerType !== RegisterTypeEnum.PHONE) return null;

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
							<PhoneCodeSelector />
							<Form.Item noStyle name="phoneNumber" rules={[{ required: true, message: "手机号不能为空！" }]}>
								<Input placeholder="请输入手机号" allowClear={true} className={`${styles.mail_input} ml-2 modal-input`} />
							</Form.Item>
						</div>
					</Form.Item>
					<div className={`${styles.title_color} mb-5 mt-5 font-16 font-w-500`}>密码</div>
					<Form.Item name="password"
						rules={[{ validator: validatePassword }]}
					>
						<Input.Password type="password" 
						placeholder="请输入8-30位密码"
						 maxLength={30} allowClear={true} 
						 size="large" className={`${styles.mail_input} modal-input`}
						 onChange={handlePasswordChange} 
						// prefix={
						// 	<Iconify icon="solar:lock-password-linear" className="icon-color" />
						// }
						/>
					</Form.Item>
					<div className={`mt-1`}>
                            {showLengthCheck && (
                                <div className={`font-12 font-w-400 ${styles.ruleItem} ${lengthValid ? styles.tip_title : styles.tip_color}`}>
                                    <Iconify
                                        icon="iconoir:check-circle-solid"
                                        size={16}
                                        className={`mr-1 ${lengthValid ? styles.tip_title : styles.tip_color}`}
                                    />
                                    8-30个字符
                                </div>
                            )}

                            {showCharCheck && (
                                <div className={`font-12 font-w-400 ${styles.ruleItem} ${charValid ? styles.tip_title : styles.tip_color}`}>
                                    <Iconify
                                        icon="iconoir:check-circle-solid"
                                        size={16}
                                        className={`mr-1 ${charValid ? styles.tip_title : styles.tip_color}`}
                                    />
                                    必须包含字母和数字
                                </div>
                            )}
                        </div>

					<div className={`${styles.title_color} mb-5 mt-5 font-16 font-w-500 flex-x algin-center  cursor-pointer`}
					onClick={()=>{setIsOpen(!isOpen)}}>推荐人的邀请码(选填)
                        <Iconify icon={isOpen ? "cuida:caret-up-outline" : "cuida:caret-down-outline"} 
						className={`${styles.tip_icon} ml-1`} size={20} />

                    </div>
					{isOpen && (
                        <Form.Item name="referee" rules={[{ required: false }]}>
                            <Input type="referee" placeholder="不区分大小写" allowClear={true} size="large" className={`${styles.mail_input} modal-input`}
                        />
                        </Form.Item>
                    )}
					<ConfigProvider
						theme={{
							token: {
								colorPrimary: "#FF5F1F"
							},
						}}
					>
						<Form.Item noStyle name="agree" valuePropName="checked" rules={[{ required: false }]}>
							<Checkbox className="custom-checkbox  text-color-default mt-5">
							<p className={`${styles.title_color}`}>
								我已阅读并同意 <span className="text-color">用户协议</span> 和 <span className="text-color">隐私政策</span>
								</p>
								</Checkbox>
						</Form.Item>
					</ConfigProvider>
				</Form>
				{/* <Button type="primary" htmlType="submit" className="w-full button-color login-button mt-8" loading={loading}
				onClick={onFinish}>
				{"注册"}
			</Button> */}
				<button type="submit" className={`${styles.login_button} w-full button-color mt-8`}
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
			</ConfigProvider>
		</div>
	);
}

export default RegisterPhone;
