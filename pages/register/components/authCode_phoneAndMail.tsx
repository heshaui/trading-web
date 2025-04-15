/* eslint-disable react-hooks/exhaustive-deps */
import { Input, Form, ConfigProvider } from 'antd';
import { useEffect, useState, useCallback } from "react";
import {
    LoginTypeEnum,
    useLoginTypeContext,
    RegisterTypeEnum,
    useRegisterTypeContext,
    LoginStateEnum,
    useLoginStateContext
} from "@/config/register-providers/LoginStateProvider";
import { toast } from "sonner";
import store from "@/store";
// import dayjs from 'dayjs';
// import { encryptWithPublicKey } from "@/utils/jsENcrypy"; //登录加密
import QuestionModal from "@/components/myModal/questionModal";
import { encryptEmail, encryptPhoneNumber } from "@/utils/encrypt";
// import { registerLogic } from "@/store/registerEnum";
import { getRegister, getRegisterMailCode, getRegisterSmsCode, } from "@/services/login";
import RepeatModal from "@/components/myModal/register_repeatModal";
// import { v4 as uuidv4 } from 'uuid';
import { encryptData } from "@/utils/encrypt";
import { useRouter } from 'next/router';
import styles from '../styles/login.module.css'
import { useTranslation } from 'next-i18next';
// interface ApiResponse {
//     code: number;
//     message?: string;
// }
function AuthCode() {
    const { t } = useTranslation('login');
    const [pointout, setPointout] = useState(false);

    const { setLoginType } = useLoginTypeContext();
    const { setRegisterType } = useRegisterTypeContext();
    const { loginState, setLoginState } = useLoginStateContext();
    const [countdown, setCountdown] = useState(0);
    const [isCounting, setIsCounting] = useState(false);
    const [sentCodeFlag, setSentCodeFlag] = useState(false);
    const [repeatModalOPen, setRepeatModalOPen] = useState(false); //重复账号弹窗
    const [loading, setLoading] = useState(false);
    const [codeInputValue, setCodeInputValue] = useState('');
    const [requestMsg, setRequestMsg] = useState(t('authCodeForm.registerSuccess')); //'success' 
    const [toastType, setToastType] = useState('success');
    const registerInfo = store.registerInfo;

    const [form] = Form.useForm();
    const router = useRouter()

    const goBackPage = () => {
        const authcodeState = store.authcodeState;
        if (authcodeState.state === LoginStateEnum.LOGIN) {
            setLoginState(authcodeState.state);
            if (authcodeState.type === LoginTypeEnum.EMAIL || authcodeState.type === LoginTypeEnum.PHONE) {
                setLoginType(authcodeState.type);
            }
        } else if (authcodeState.state === LoginStateEnum.REGISTER) {
            setLoginState(authcodeState.state);
            if (authcodeState.type === RegisterTypeEnum.EMAIL || authcodeState.type === RegisterTypeEnum.PHONE) {
                setRegisterType(authcodeState.type);
            }
        }
    };

    const onSubmit = () => {
        form
            .validateFields()
            .then(async (values) => {
                // form.resetFields(); // 重置表单
                console.log(values, 111);
                setLoading(true);
                try {

                    let dataInfo = {};
                    if (registerInfo.type === 'm') {
                        dataInfo = {
                            type: registerInfo.type,
                            email: registerInfo.email,
                            password: registerInfo.password,
                            parentInviteCode: registerInfo.parentInviteCode || "",
                            code: values.code
                        };

                    } else if (registerInfo.type === 'p') {
                        dataInfo = {
                            type: registerInfo.type,
                            phone: registerInfo.phone,
                            password: registerInfo.password,
                            parentInviteCode: registerInfo.parentInviteCode || "",
                            countryCode: registerInfo.countryCode?.replace("+", ""),
                            code: values.code
                        };
                    }
                    // console.log(dataInfo, 123);
                    // const data = await encryptWithPublicKey(JSON.stringify(dataInfo)) || ""
                    // const dataEncrypt = {
                    //     data: data,
                    //     time: dayjs(new Date().getTime()).valueOf(),
                    //     reqNo: uuidv4()
                    // }
                    const dataEncrypt = await encryptData(dataInfo)
                    // const dataEncrypt = encryptWithPublicKey(JSON.stringify(dataInfo))
                    const res = await getRegister(dataEncrypt);
                    if (res.code === '0') {
                        setRequestMsg(res.message)
                        setToastType('success')
                        setRepeatModalOPen(true)

                        // toast.success("注册成功")
                    } else if (res.code === '10043') {
                        setRequestMsg(res.message)
                        setToastType('error')
                        setRepeatModalOPen(true)
                    }
                    else {
                        toast.error(res.message)
                    }
                    setLoading(false);

                } catch (error) {
                    setLoading(false);
                    toast.error(String(error))
                }
            })
            .catch((info) => {
                console.log("Validate Failed:", info);
            });
    };

    // const getCode = useCallback(async () => {
    //     await getRegisterCode()
    // }, [])
    const getRegisterCode = async () => {
        if (isCounting || loading || sentCodeFlag) return
        try {
            setSentCodeFlag(true)
            if (registerInfo.type === 'm') {
                const dataInfo = {
                    number: registerInfo.email || '',
                    // code: "",
                    deviceType: "web"
                };
                const dataEncrypt = await encryptData(dataInfo)
                const res = await getRegisterMailCode(dataEncrypt);
                if (res.code === "0") {
                    toast.success(res.message)
                    startCountdown(res.data);
                } else if (res.code === "10044") {
                    toast.error(res.message)
                }
                setSentCodeFlag(false)
            } else if (registerInfo.type === 'p') {
                const dataInfo = {
                    number: registerInfo.phone || '',
                    code: registerInfo.countryCode?.replace("+", ""),
                    deviceType: "web"
                };
                const dataEncrypt = await encryptData(dataInfo)
                const res = await getRegisterSmsCode(dataEncrypt);
                if (res.code === "0") {
                    toast.success(res.message)
                    startCountdown(res.data);
                } else if (res.code === "10044") {
                    toast.error(res.message)
                }
                setSentCodeFlag(false)
            }
        } catch (error) {
            setSentCodeFlag(false)
            console.error('获取验证码出错:', error);
        }
    }
    const handCancel = () => {
        setRepeatModalOPen(false)
        setLoginState(LoginStateEnum.REGISTER);
        setRegisterType(RegisterTypeEnum.EMAIL);
    }
    const startCountdown = (count: number) => {
        setCountdown(count);
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
        // 清理定时器
        return () => clearInterval(timer);
    };
    const handCodeOk = async () => {
        setPointout(false)
        await getRegisterCode()
    }
    const goLoginPage = () => {
        // setLoginState(LoginStateEnum.LOGIN)
        store.clearUserToken()
        router.push('/login')
    }
    // 过滤输入，只允许数字和字母
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        // 只保留数字和字母
        const filteredValue = value.replace(/[^0-9]/g, '');
        setCodeInputValue(filteredValue);
        form.setFieldsValue({ code: filteredValue });
        // setEmailCodeInputValue(filteredValue);
        // form.setFieldsValue({ code: filteredValue });
        // if (type === 'email') {
        //     setEmailCodeInputValue(filteredValue);
        //     form.setFieldsValue({ code: filteredValue });
        // } else if (type === 'phone') {
        //     setPhoneCodeInputValue(filteredValue);
        //     form.setFieldsValue({ phoneCode: filteredValue });
        // } else if (type === 'google') {
        //     setGoogleCodeInputValue(filteredValue);
        //     form.setFieldsValue({ googleCode: filteredValue });
        // }
    };
    useEffect(() => {
        // if (loginState == LoginStateEnum.Authcode && !loading&&!isCounting) {
        if (loginState == LoginStateEnum.Authcode) {
            getRegisterCode();
        }
    }, [loginState]);
    // 当状态不为 Authcode 时不渲染组件
    if (loginState !== LoginStateEnum.Authcode) return null;

    return (
        <div className="flex-col" style={{ height: "70vh", width: "100%" }}>
            {/* <div className="mb-6 authcode-header font-w-500" style={{ width: "300px" }}>邮箱/手机号验证</div> */}
            <div className='mb-2'>
                <p className='font-16 font-w-500 mb-1'>
                    {/* 已发送验证码至 */}
                    {t('authCodeForm.title')}
                </p>
                <p className={`${styles.tip_color1}`}>
                    {registerInfo.type === 'm' && encryptEmail(registerInfo.email)}
                    {registerInfo.type === 'p' && (<>
                        <span>{registerInfo.countryCode}&nbsp;&nbsp;</span>
                        {encryptPhoneNumber(registerInfo.phone)}
                    </>)}
                </p>
            </div>
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
                    name="login"
                    size="large"
                    form={form}
                // initialValues={{
                //     remember: true,
                // }}
                >
                    <Form.Item
                        name="code"
                        rules={[{ required: true, message: t('authCodeForm.codeNull') }]}
                    >
                        <Input
                            allowClear
                            placeholder={t('authCodeForm.placeholder')}
                            // prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                            suffix={
                                <button
                                    type='button'
                                    className={isCounting ? `${styles.tip_color1_input}` : `${styles.text_color}`}
                                    onClick={getRegisterCode}
                                >
                                    {/* 重新发送/60s 重发 */}
                                    {isCounting
                                        ? `${countdown}${t('authCodeForm.resendCountdown')}`
                                        : t('authCodeForm.resend')
                                    }
                                </button>
                            }
                            className={`${styles.authcode_input} ${styles.mail_input} modal-input`}
                            style={{ borderRadius: "8px" }}
                            onChange={handleInputChange}
                            value={codeInputValue}
                            maxLength={6}
                        />
                        {/* <button className='text-color mt-1'>粘贴</button> */}
                    </Form.Item>
                </Form>
            </ConfigProvider>
            <div className='flex mt-6'>
                <button
                    type='button'
                    className={`${styles.goback_btn}`}
                    onClick={() => goBackPage()}
                >
                    {/* 上一步 */}
                    {t('authCodeForm.prevStep')}
                </button>
                <button
                    type='submit'
                    className={`btn-color ${styles.submit_btn}`}
                    onClick={onSubmit}
                >
                    {/* 提交 */}
                    {t('authCodeForm.submit')}
                </button>
            </div>
            <div>
                <button
                    type="button"
                    className={`text-color  mt-5`}
                    onClick={() => setPointout(true)}
                >
                    {/* 收不到验证码？ */}
                    {t('authCodeForm.cantReceive')}
                </button>
            </div>

            <QuestionModal
                open={pointout}
                type={registerInfo.type}
                acount={
                    registerInfo.type === "m" ? (registerInfo.email || "") :
                        registerInfo.type === "p" ? (registerInfo.phone || "") : ""
                }
                onOk={() => setPointout(false)}
                onCancel={handCodeOk}
            />
            <RepeatModal
                open={repeatModalOPen}
                type={toastType}
                message={requestMsg}
                acount={
                    registerInfo.type === "m" ? (registerInfo.email || "") :
                        registerInfo.type === "p" ? (registerInfo.phone || "") : ""
                }
                onCancel={handCancel}
                onOk={() => goLoginPage()}
            />
        </div>
    );
}

export default AuthCode;