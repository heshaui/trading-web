import { Button, Form, Input, Checkbox, message } from "antd";
import { type CSSProperties, useState } from "react";
import { useTranslation } from "react-i18next";
// import type { SignInReq } from "@/api/services/userService";
// import { useSignIn } from "@/store/userStore";
import { LoginStateEnum, useLoginStateContext, LoginTypeEnum, useLoginTypeContext } from "../providers/LoginStateProvider";
// import FingerprintJS from "@fingerprintjs/fingerprintjs";
// import loginApi from "@/api/login/login";
// import { getEmailCode, getSmsCode } from "@/api/login/register";
// import CodeModel from "./components/codebutton";
import { toast ,Toaster} from "sonner";
// import "@/styles/components/login/login.css"
import type { TabsProps } from 'antd';
import { Iconify } from "@/components/icon/index";
import { log } from "console";

const fromStyle: CSSProperties = {
    borderRadius: "5px",
    // boxShadow: "0px 0px 6px 0px rgba(235, 236, 241, 1)",
    // padding: "25px",
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
    const { loginType, setLoginType } = useLoginTypeContext();
    // const signIn = useSignIn();
    const [form] = Form.useForm();
    // 当登录状态不为 LOGIN 时不渲染组件
    // if (loginState !== LoginStateEnum.LOGIN) return null;
    // if (loginType !== LoginTypeEnum.EMAIL) return null;

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

    const handleFinish = async () => {
        form
            .validateFields()
            .then(async (values) => {
                // form.resetFields(); // 重置表单
                if(!values.agree) return toast.error("请先同意用户协议和隐私政策") 
                
 
            })
            .catch((info) => {
                console.log("Validate Failed:", info);
            });
        // form.resetFields(); //重置表单
        // setLoading(true);

    }

    const usernameChange = (changedValues: any) => {
        Object.keys(changedValues).forEach((key) => {
            if (key === "username" && preCheck) {
                setpreCheck(false);
            }
        });

    }
    // 自定义密码验证规则
    const validatePassword = (_: any, value: any) => {
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
                initialValues={{
                    remember: true,
                }}
                // onFinish={handleFinish}
                onValuesChange={usernameChange}
            >
                <div className="mb-5 font-16 font-w-500">邮箱</div>

                <Form.Item name="email" rules={[{ required: true, message: "邮箱号不能为空！" },{type:"email",message:"邮箱格式不正确！"}]}>
                    <Input placeholder="请输入邮箱号" allowClear={true} size="large"
                        prefix={<Iconify icon="clarity:email-line" className="icon-color" />}
                    />
                </Form.Item>
                <div className="mb-5 font-16 font-w-500">密码</div>
                <Form.Item name="password" rules={[{ validator: validatePassword }]}>
                    <Input.Password type="password" placeholder="请输入密码" allowClear={true} size="large"
                        prefix={
                            <Iconify icon="solar:lock-password-linear" className="icon-color" />
                        }
                    />
                </Form.Item>
                <div className="mb-5 font-16 font-w-500">推荐人的邀请码(选填)</div>
                <Form.Item name="referee" rules={[{ required: false }]}>
                    <Input.Password type="referee" placeholder="不区分大小写" allowClear={true} size="large"
                        prefix={
                            // <Iconify icon="solar:lock-password-linear" className="icon-color" />
                            <img src="/images/login/icon-inviter.png" alt="" style={{ width: "14px", height: "14px" }} />
                        }
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
                <Form.Item noStyle name="agree" valuePropName="checked" rules={[{ required: false }]}>
					<Checkbox className="custom-checkbox">我已阅读并同意 <span className="text-color">用户协议</span> 和 <span className="text-color">隐私政策</span></Checkbox>
				</Form.Item>
                {/* <Form.Item>
                    <Button type="primary" htmlType="submit" className="w-full button-color login-button" loading={loading}>
                        {"登录"}
                    </Button>
                </Form.Item> */}
            </Form>
            <Button type="primary" htmlType="submit" className="w-full button-color login-button mt-8" loading={loading}
                onClick={handleFinish}>
                {"注册"}
            </Button>
            <p className="tip-color2 mt-5">或者</p>
            <Button className="w-full google-btn mt-5" 
            onClick={()=>toast.error("请先同意用户协议和隐私政策")}
            icon={<Iconify icon="fa6-brands:google" className="icon-color1" />}
             >
                使用Google继续
            </Button>
            <div className="flex-cc mt-4">
                <p>
                    {"已有账号？"}
                    <button
                        type="button"
                        className="text-color"
                        onClick={() => setLoginState(LoginStateEnum.LOGIN)}
                    >
                        {"登录"}
                    </button>
                </p>
            </div>
           
        </div>
        
    );
}

export default LoginForm;
