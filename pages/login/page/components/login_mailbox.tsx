import {  Form, Input, AutoComplete } from "antd";
import { type CSSProperties, useState, useEffect } from "react";
import {   LoginTypeEnum, useLoginTypeContext } from "@/config/login-providers/LoginStateProvider"; //LoginStateEnum,useLoginStateContext,
import type { TabsProps, AutoCompleteProps } from 'antd';
// import { Iconify } from "@/components/icon/index";
// import store from "@/store";
import { emailSuffixes } from "@/utils/enum";
import { useRouter } from 'next/router';
import SafeModal from "@/components/myModal/login_safeModal"
import styles from '../styles/login.module.css'
// import { encryptWithPublicKey } from "@/utils/jsENcrypy"; //登录加密

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
    email: string ;
    password: string ;
    deviceType: string ;
    authCodeMail: string ;
}

function Mailbox() {
    const router = useRouter();

    // const [loading, setLoading] = useState(false);
    const [preCheck, setpreCheck] = useState(false); //是否需要二次验证
    // const [checkType, setCheckType] = useState<string>(""); //二次验证的类型
    const [codeModelOpen, setCodeModelOpen] = useState(false); //验证码弹窗
    // const [errModelOpen, setErrModelOpen] = useState(false); //错误提示弹窗
    // const [errMsg, setErrMsg] = useState('请检查网络!');
    // const { loginState, setLoginState } = useLoginStateContext();
    const { loginType } = useLoginTypeContext();
    // const signIn = useSignIn();
    const [form] = Form.useForm();
    const [historyEmails, setHistoryEmails] = useState<string[]>([]);
    const [options, setOptions] = useState<AutoCompleteProps['options']>([]);
    const [loginInfo, setLoginInfo] = useState<useInfoType>({
        type: "",
        email: "",
        password: "",
        deviceType: "",
        authCodeMail: "",
    });

    useEffect(() => {
        const storedEmails = localStorage.getItem('emailHistory');
        if (storedEmails) {
            setHistoryEmails(JSON.parse(storedEmails));
        }
    }, []);

    const saveEmailToHistory = (email: string) => {
        if (email && !historyEmails.includes(email)) {
            const newHistory = [email, ...historyEmails].slice(0, 5); // 最多保存 5 条历史记录
            setHistoryEmails(newHistory);
            localStorage.setItem('emailHistory', JSON.stringify(newHistory));
        }
    };


    // 获取浏览器指纹
    // const getFingerprint = async () => {
    // 	const result = await FingerprintJS.load();
    // 	const visitorId = await result.get();
    // 	console.log(visitorId.components.vendor);
    // 	return visitorId.visitorId;
    // };

    // const handCancel = () => {
    //     setErrModelOpen(false);
    // };

    // const handOk = async () => {
    //     setErrModelOpen(true)
    //     // 这里可以添加点击验证码弹窗确认按钮后的处理逻辑
    // };
    const handCodeCancel = () => {
        setCodeModelOpen(false)
    }
    // const handCodeOk = (event: any) => {
    //     // setCodeModelOpen(false)
    // }

    const handleFinish = async () => {
        form
            .validateFields()
            .then(async (values) => {
                // form.resetFields(); // 重置表单
                saveEmailToHistory(values.email)
                console.log(values);
                const data = {
                    type: "m",
                    email: values.email,
                    deviceType: "web",
                    password: values.password,
                    authCodeMail: "",
                }
                // encryptWithPublicKey
                // loginLogic()
                setLoginInfo(data)
                setCodeModelOpen(true)
                // goAuthCode(data)

            })
            .catch((info) => {
                console.log("Validate Failed:", info);
            });
        // form.resetFields(); //重置表单
        // setLoading(true);

    }
    // const goAuthCode = () => {
    //     store.setAuthcodeState(LoginStateEnum.LOGIN, LoginTypeEnum.EMAIL);
    //     setLoginState(LoginStateEnum.Googlecode)
    // }

    const usernameChange = (changedValues: any) => {
        Object.keys(changedValues).forEach((key) => {
            if (key === "username" && preCheck) {
                setpreCheck(false);
            }
        });

    }
    const handleSearch = (value: string) => {
        setOptions(() => {
            if (!value || value.includes('@')) {
                return [];
            }
            return emailSuffixes.map((domain) => ({
                label: `${value}@${domain}`,
                value: `${value}@${domain}`,
            }));
        });
    };
    const setHistoryOptions = () => {
        const fromValue = form.getFieldsValue()
        if (fromValue.email) return;
        setOptions(() => {
            if (!historyEmails || historyEmails.length === 0) return [];

            return historyEmails.map((history) => ({
                label: history,
                value: history,
            }))
        });
    }
    const goResetPassword = () => {
        router.push('/resetPassword');
    }
    const goRegister = () => {
	
		// setLoginState(LoginStateEnum.REGISTER)
		router.push("/register")
	}
    // 当登录状态不为 LOGIN 时不渲染组件;
    if (loginType !== LoginTypeEnum.EMAIL) return null;
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

            <Form.Item name="email" rules={[{ required: true, message: "邮箱号不能为空！" }, { type: "email", message: "邮箱格式不正确！" }]}>
                <AutoComplete
                    // style={{ width: 200 }}
                    onSearch={handleSearch}
                    placeholder="请输入邮箱号"
                    options={options}
                    allowClear={true}
                    backfill={true}
                    className={`${styles.auto_complete_input} auto-complete-input`}
                    onFocus={setHistoryOptions}
                />
            </Form.Item>
            <div className="mb-5 font-16 font-w-500">密码</div>
            <Form.Item name="password" rules={[{ required: true, message: "密码不能为空！" }]}>
                <Input.Password type="password" placeholder="请输入密码" allowClear={true} size="large" className={`${styles.mail_input}`}
                // prefix={<Iconify icon="solar:lock-password-linear" className="icon-color" />}
                />
            </Form.Item>
            <Form.Item noStyle>
                <button type="button" className={`${styles.forget_password_button}`} onClick={() => goResetPassword()} >
                    {"忘记密码"}
                </button>
            </Form.Item>
        </Form>
        <button type="submit" className={`${styles.login_button} w-full button-color mt-8`}
            onClick={handleFinish}>
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
        {/* <ErrModal open={errModelOpen} errMsg={errMsg} onCancel={handCancel} /> */}
        <SafeModal open={codeModelOpen}
            acountInfo={loginInfo}
            onCancel={handCodeCancel}
        />

    </div>
    );
}

export default Mailbox;
