import { Form, Input, AutoComplete, ConfigProvider } from "antd";
import { type CSSProperties, useState, useEffect } from "react";
import { LoginTypeEnum, useLoginTypeContext } from "@/config/login-providers/LoginStateProvider"; //LoginStateEnum,useLoginStateContext,
import type { TabsProps, AutoCompleteProps } from 'antd';
// import { Iconify } from "@/components/icon/index";
// import store from "@/store";
import { emailSuffixes } from "@/utils/enum";
import { useRouter } from 'next/router';
import styles from '../styles/login.module.css'
// import { encryptWithPublicKey } from "@/utils/jsENcrypy"; //登录加密
import { useTranslation } from 'next-i18next';
// import SafeModal from "@/components/myModal/login_safeModal"
import SafeModal from "@/components/myModal/login_safeModal2"
import { encryptData } from "@/hooks/user-encrypt";
import { getLoginCheck } from "@/services/login";
import { toast } from "sonner";

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
    email: string;
    password: string;
    deviceType: string;
    authCodeMail: string;
}

function Mailbox() {
    const router = useRouter();
    const { t } = useTranslation(['login']);
    const [preCheck, setpreCheck] = useState(false); //是否需要二次验证
    const [codeModelOpen, setCodeModelOpen] = useState(false); //验证码弹窗
    const { loginType } = useLoginTypeContext();
    // const signIn = useSignIn();
    const [form] = Form.useForm();
    const email = Form.useWatch('email', form);
    const [historyEmails, setHistoryEmails] = useState<string[]>([]);
    const [options, setOptions] = useState<AutoCompleteProps['options']>([]);
    const [loginInfo, setLoginInfo] = useState<useInfoType>({} as useInfoType);
    const [loading, setLoading] = useState(false);

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
                // console.log(values);

                // const data = {
                //     type: "m",
                //     email: values.email,
                //     deviceType: "web",
                //     password: values.password,
                //     authCodeMail: "",
                // }
                // setLoginInfo(data)
                // setCodeModelOpen(true)
                const param = {
                    type: "m",
                    account: values.email
                }
                const dataEncrypt = await encryptData(param)
                setLoading(true)
                try {
                    const res = await getLoginCheck(dataEncrypt)
                    if (res.code === "0") {
                        const data = {
                            type: "m",
                            email: values.email,
                            deviceType: "web",
                            password: values.password,
                            authCodeMail: "",
                            ...res.data
                        }
                        setLoginInfo(data)
                        setCodeModelOpen(true)
                        if(!((res.data.openAll === 1 && res.data.isGoogleAuth === 1&&(res.data.isEmailAuth === 0 && res.data.isPhoneAuth === 0)) || 
                        (res.data.openAll === 0 && res.data.isGoogleAuth === 1))){
                            toast.success(res.message)
                        }
                    } else if (res.code === "10044") {
                        // const data = {
                        //     ...res.data,
                        //     type: "m",
                        //     email: values.email,
                        //     deviceType: "web",
                        //     password: values.password,
                        //     authCodeMail: "",
                           
                        // }
                        // setLoginInfo(data)
                        setCodeModelOpen(true)
                        toast.error(t('safeModal.codeValid'))
                    } else {
                        toast.error(res.message)
                    }
                } catch (error) {
                    toast.error(String(error))
                } finally {
                    setLoading(false)
                }

            })
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
        router.push('/resetPassword?acount=' + email + '&type=m');
    }
    const goRegister = () => {

        // setLoginState(LoginStateEnum.REGISTER)
        router.push("/register")
    }
    // 当登录状态不为 LOGIN 时不渲染组件;
    if (loginType !== LoginTypeEnum.EMAIL) return null;
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
                            activeBorderColor: 'var(--theme-color)',
                            hoverBorderColor: 'var(--theme-color)',
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
                    initialValues={{
                        remember: true,
                    }}
                    // onFinish={handleFinish}
                    onValuesChange={usernameChange}
                >
                    <div className={`${styles.title_color} mb-3 font-16 font-w-500`}>
                        {/* 邮箱 */}
                        {t('emailTitle')}
                    </div>

                    <Form.Item name="email" rules={[
                        { required: true, message: t('emailNull') },
                        { type: "email", message: t('emailErr') }
                    ]}>
                        <AutoComplete
                            onSearch={handleSearch}
                            placeholder={t('emailPlaceholder')}
                            options={options}
                            allowClear={true}
                            backfill={true}
                            className={`${styles.auto_complete_input} auto-complete-input custom-sleect`}
                            onFocus={setHistoryOptions}
                            style={{ height: "50px" }}
                        />
                    </Form.Item>
                    <div className={`${styles.title_color} mb-3 font-16 font-w-500`}>
                        {/* 密码 */}
                        {t('passwordTitle')}
                    </div>
                    <Form.Item name="password" rules={[
                        { required: true, message: t('passwordNull') }
                    ]}>
                        <Input.Password
                            type="password"
                            placeholder={t('passwordPlaceholder')}
                            maxLength={30}
                            allowClear={true}
                            size="large"
                            className={`${styles.mail_input} modal-input`}
                        />
                    </Form.Item>
                    <Form.Item noStyle>
                        <div className="w-full flex-x align-center justify-end">
                            <button type="button" className={`${styles.forget_password_button}`} onClick={() => goResetPassword()} >
                                {/* 忘记密码 */}
                                {t('forgetPassword')}
                            </button>
                        </div>

                    </Form.Item>
                </Form>
                {!loading ? <button type="submit" className={`${styles.login_button} w-full button-color mt-5`}
                    onClick={handleFinish}>
                    {/* 登录 */}
                    {t('loginButton')}
                </button> :
                    <button type="button" className={`${styles.login_loading} w-full button-color mt-5`}>
                        {/* 登录 */}
                        {t('loginButton')}
                    </button>}
                <div className="flex-cc mt-4">
                    <p>
                        {/* 没有账号？ */}
                        {t('noAcount')}
                        <button
                            type="button"
                            className="text-color"
                            onClick={() => goRegister()}
                        >
                            {/* 注册 */}
                            {t('register')}
                        </button>
                    </p>
                </div>
                {/* <ErrModal open={errModelOpen} errMsg={errMsg} onCancel={handCancel} /> */}
                <SafeModal open={codeModelOpen}
                    acountInfo={loginInfo}
                    onCancel={handCodeCancel}
                />
            </ConfigProvider>
        </div>
    );
}

export default Mailbox;
