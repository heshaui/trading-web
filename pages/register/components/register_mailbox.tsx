import { Form, Input, Checkbox, AutoComplete, ConfigProvider } from "antd";
import { type CSSProperties, useState, useEffect} from "react";
import { LoginStateEnum, useLoginStateContext, RegisterTypeEnum, useRegisterTypeContext } from "@/config/register-providers/LoginStateProvider";
import { toast } from "sonner";
import type { AutoCompleteProps } from 'antd';
import { useTranslation } from 'next-i18next';
import store from "@/store";
import { emailSuffixes } from "@/utils/enum";
import { useRouter } from 'next/router';
import styles from '../styles/login.module.css'
import { Iconify } from "@/components/icon"

const fromStyle: CSSProperties = {
    borderRadius: "5px",
    // boxShadow: "0px 0px 6px 0px rgba(235, 236, 241, 1)",
    // padding: "25px",
    width: "25vw",
    maxWidth: "400px",
    minWidth: "350px",
};


export default function RegisterMail() {
    const { t } = useTranslation(['login']);
    const router = useRouter();
    const { inviteCode } = router.query; 
    const [preCheck, setpreCheck] = useState(false); //是否需要二次验证
    const [isOpen, setIsOpen] = useState(true); //是否展开
    const { setLoginState } = useLoginStateContext();
    // const { registerType, setRegisterType } = useRegisterTypeContext();
    const { registerType } = useRegisterTypeContext();
    // const signIn = useSignIn();
    const [form] = Form.useForm();
    const [options, setOptions] = useState<AutoCompleteProps['options']>([]);

    // 密码校验状态
    const [lengthValid, setLengthValid] = useState(false);
    const [charValid, setCharValid] = useState(false)
    const [showLengthCheck, setShowLengthCheck] = useState(false);
    const [showCharCheck, setShowCharCheck] = useState(false);
   

    useEffect(() => {
        // 确保路由已准备好
        if (router.isReady) {
            const { inviteCode } = router.query;
            // 如果 URL 中有 inviteCode，设置到表单的 referee 字段
            if (inviteCode) {
                form.setFieldValue('referee', inviteCode);
            }
        }
    }, [router.isReady, form]);
    // 当注册状态不为 EMAIL 时不渲染组件

    const handleFinish = async () => {
        form
            .validateFields()
            .then(async (values) => {
                // form.resetFields(); // 重置表单
                console.log(values, 111);

                if (!values.agree) return toast.error("请先同意用户协议和隐私政策")
                const data = {
                    type: "m",
                    email: values.email,
                    password: values.password,
                    parentInviteCode: isOpen?values.referee:"",
                }
                store.updateRegisterInfo(data)

                goAuthCode();

            })
            .catch((info) => {
                console.log("Validate Failed:", info);
            });
        // form.resetFields(); //重置表单
        // setLoading(true);

    }
    // 跳转规则
    const goAuthCode = () => {
        store.setAuthcodeState(LoginStateEnum.REGISTER, RegisterTypeEnum.EMAIL); //存储跳转前状态
        setLoginState(LoginStateEnum.Authcode) //设置跳转状态
    }

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
    const goLogin = () => {
        // setLoginState(LoginStateEnum.LOGIN)
        router.push("/login")
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



    if (registerType !== RegisterTypeEnum.EMAIL) return null;
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
                            // hoverBorderColor: 'var(--theme-color)',
                            hoverBorderColor: 'var(--theme-color)',
                            
                            activeBg: 'var(--background11)',
                            hoverBg: 'var(--background11)',
                        },
                        Select: {
                            selectorBg: 'var(--background11)',
                        }
                    },
                    token: {
                        colorBgContainer: 'transparent',
                      }
                }}
            >
                <Form
                    style={fromStyle}
                    name="login"
                    size="large"
                    form={form}
                    initialValues={{
                        // remember: true,
                        // referee:inviteCode||''
                    }}
                    // onFinish={handleFinish}
                    onValuesChange={usernameChange}
                >
                    <div className={`${styles.title_color} mb-5 font-16 font-w-500`}>
                        {/* 邮箱 */}
                        {t('registerForm.emailTitle')}
                    </div>

                    <Form.Item 
                        name="email" 
                        rules={[
                            { required: true, message: t('emailNull') }, 
                            { type: "email", message: t('emailErr') }
                        ]}
                    >
                        <AutoComplete
                            onSearch={handleSearch}
                            placeholder={t('registerForm.emailPlaceholder')}
                            options={options}
                            allowClear={true}
                            backfill={true}
                            style={{ height: "50px" }}
                            className={`${styles.auto_complete_input} auto-complete-input custom-sleect`}
                        />
                    </Form.Item>
                    <div className={`${styles.title_color} mb-5 font-16 font-w-500 mt-5`}>
                        {/* 密码 */}
                        {t('registerForm.passwordTitle')}
                    </div>
                    <Form.Item name="password" rules={[{ validator: validatePassword }]}>
                        <Input.Password 
                            type="password" 
                            placeholder={t('registerForm.passwordPlaceholder')}
                            maxLength={30} 
                            allowClear={true} 
                            size="large" 
                            className={`${styles.mail_input} modal-input`}
                            onChange={handlePasswordChange} 
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
                                {/* 8-30个字符 */}
                                {t('registerForm.passwordRule1')}
                            </div>
                        )}

                        {showCharCheck && (
                            <div className={`font-12 font-w-400 ${styles.ruleItem} ${charValid ? styles.tip_title : styles.tip_color}`}>
                                <Iconify
                                    icon="iconoir:check-circle-solid"
                                    size={16}
                                    className={`mr-1 ${charValid ? styles.tip_title : styles.tip_color}`}
                                />
                                {/* 必须包含字母和数字 */}
                                {t('registerForm.passwordRule2')}
                            </div>
                        )}
                    </div>
                    <div 
                        className={`${styles.title_color} mb-5 mt-5 font-16 font-w-500 flex-x algin-center cursor-pointer`}
                        
                    >
                        {/* 推荐人的邀请码(选填) */}
                        {t('registerForm.refereeTitle')}
                        <Iconify 
                            icon={isOpen ? "cuida:caret-up-outline" : "cuida:caret-down-outline"}
                            className={`${styles.tip_icon} ml-1 `} 
                            size={20} 
                            onClick={() => { setIsOpen(!isOpen) }}
                        />
                    </div>
                    {isOpen && (
                        <Form.Item name="referee">
                            <Input 
                                type="referee" 
                                placeholder={t('registerForm.refereePlaceholder')}
                                allowClear={true} 
                                size="large" 
                                className={`${styles.mail_input} modal-input`}
                                maxLength={8}
                            />
                        </Form.Item>
                    )}

                    <Form.Item noStyle name="agree" valuePropName="checked">
                        <Checkbox className="custom-checkbox text-color-default mt-5" >
                            <p className={`${styles.title_color}`}>
                                {/* 我已阅读并同意 */}
                                {t('agree')} <span className="text-color">{t('protocol')}</span> {t('and')} <span className="text-color">{t('policy')}</span>
                            </p>
                        </Checkbox>
                    </Form.Item>
                </Form>
                <button 
                    type="submit" 
                    className={`${styles.login_button} w-full button-color mt-8`}
                    onClick={handleFinish}
                >
                    {/* 注册 */}
                    {t('registerForm.registerButton')}
                </button>
                {/* <p className="tip-color2 mt-5">或者</p>
            <Button className="w-full google-btn mt-5"
                onClick={() => goAuthCode()}
                icon={<Iconify icon="fa6-brands:google" className="icon-color1" />}
            >
                使用Google继续
            </Button> */}
                <div className="flex-cc mt-4">
                    <p>
                        {/* 已有账号？ */}
                        {t('registerForm.hasAccount')}
                        <button
                            type="button"
                            className="text-color"
                            onClick={goLogin}
                        >
                            {/* 登录 */}
                            {t('login')}
                        </button>
                    </p>
                </div>
            </ConfigProvider>
        </div>
    );
}


