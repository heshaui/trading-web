import { Form, Input, Checkbox, AutoComplete, ConfigProvider } from "antd";
import { type CSSProperties, useState, } from "react";
import { LoginStateEnum, useLoginStateContext, RegisterTypeEnum, useRegisterTypeContext } from "@/config/register-providers/LoginStateProvider";
import { toast } from "sonner";
import type { AutoCompleteProps } from 'antd';;
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
    const router = useRouter();
    // const [loading, setLoading] = useState(false);
    const [preCheck, setpreCheck] = useState(false); //是否需要二次验证
    const [isOpen, setIsOpen] = useState(true); //是否展开
    // const [checkType, setCheckType] = useState<string>(""); //二次验证的类型
    const { setLoginState } = useLoginStateContext();
    // const { registerType, setRegisterType } = useRegisterTypeContext();
    const { registerType } = useRegisterTypeContext();
    // const signIn = useSignIn();
    const [form] = Form.useForm();
    const [options, setOptions] = useState<AutoCompleteProps['options']>([]);

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
                    parentInviteCode: values.referee,
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
            return Promise.reject(new Error("密码长度必须在 8 - 30 位之间！"));
        }
        // 检查是否包含字母和数字
        // const hasLetter = /[a-zA-Z]/.test(value);
        // const hasNumber = /\d/.test(value);
        const hasRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,30}$/;
        // console.log('密码是否通过正则校验:',value,1, hasRegex.test(value),111); // 新增调试信息
        if (!hasRegex.test(value)) {
            return Promise.reject(new Error("密码必须包含字母和数字，且长度在 8 - 30 位之间！"));
        }

        return Promise.resolve();
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
                    initialValues={{
                        remember: true,
                    }}
                    // onFinish={handleFinish}
                    onValuesChange={usernameChange}
                >
                    <div className={`${styles.title_color} mb-5 font-16 font-w-500`}>邮箱</div>

                    <Form.Item name="email" rules={[{ required: true, message: "邮箱号不能为空！" }, { type: "email", message: "邮箱格式不正确！" }]}>
                        <AutoComplete
                            onSearch={handleSearch}
                            placeholder="请输入邮箱号"
                            options={options}
                            allowClear={true}
                            backfill={true}
                            style={{ height: "50px" }}
                            className={`${styles.auto_complete_input} auto-complete-input custom-sleect`}
                        />
                    </Form.Item>
                    <div className={`${styles.title_color} mb-5 font-16 font-w-500`}>密码</div>
                    <Form.Item name="password" rules={[{ validator: validatePassword }]}>
                        <Input.Password type="password" placeholder="请输入8-30位密码" maxLength={30} allowClear={true} size="large" className={`${styles.mail_input} modal-input`}

                        />
                    </Form.Item>
                    <div className={`${styles.title_color} mb-5 font-16 font-w-500 flex-x algin-center cursor-pointer`}
                        onClick={() => { setIsOpen(!isOpen) }}>推荐人的邀请码(选填)
                        <Iconify icon={isOpen ? "cuida:caret-up-outline" : "cuida:caret-down-outline"}
                            className={`${styles.tip_icon} ml-1 `} size={20} />
                        {/* icon-park:down */}

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
                            <Checkbox className="custom-checkbox text-color-default" >
                                <p className={`${styles.title_color}`}> 我已阅读并同意 <span className="text-color">用户协议</span> 和 <span className="text-color">隐私政策</span></p>
                            </Checkbox>
                        </Form.Item>

                    </ConfigProvider>
                </Form>
                <button type="submit" className={`${styles.login_button} w-full button-color mt-8`}
                    onClick={handleFinish}>
                    {"注册"}
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


