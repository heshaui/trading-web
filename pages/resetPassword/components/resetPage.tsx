// import { Button, Form, Input,Tabs } from "antd";
import { Input, Form } from 'antd';
// import type { AutoCompleteProps } from 'antd';
import { useState } from "react";
import { useResetStateContext, ResetStateEnum } from "@/config/reset-providers/ResetStateProvider";
import { toast } from "sonner";
// import store from "@/store";
import { useRouter } from 'next/router';
import styles from "../style/reset.module.css"
import ResetSuccessModal from "@/components/myModal/ressetSuccessModal"
import { encryptData } from "@/utils/encrypt";
import { getResetPassword } from "@/services/resetPassword"
import { Iconify } from "@/components/icon/index";
import { useTranslation } from 'next-i18next';
function ResetPassword() {
    const router = useRouter();
    const [form] = Form.useForm();
    const { resetState, setResetState, acount } = useResetStateContext();
    const { t } = useTranslation('resetPassword');
    // const [authCode, setAuthCode] = useState('');
    // const [options, setOptions] = useState<AutoCompleteProps['options']>([]);
    const [passwordVisible, setPasswordVisible] = useState(false);
    // const [oldPasswordVisible, setOldPasswordVisible] = useState(false);
    const [verifyPasswordVisible, setverifyPasswordVisible] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);

    // 密码校验状态
    const [lengthValid, setLengthValid] = useState(false);
    const [charValid, setCharValid] = useState(false)
    const [showLengthCheck, setShowLengthCheck] = useState(false);
    const [showCharCheck, setShowCharCheck] = useState(false);
    // 当状态不为 INPUT 时不渲染组件



    const goNext = () => {
        router.push('/login');
    }
    const goLast = () => {
        setResetState(ResetStateEnum.SENTCODE)
    }
    const handCancel = () => {
        setResetSuccess(false)
        setResetState(ResetStateEnum.INPUT)
    }
    const onSubmit = () => {
        form
            .validateFields()
            .then(async (values) => {
                try {
                    const dataInfo = {
                        type: acount.type,
                        account: acount.acount,
                        password: values.newPassword,
                        passwordConfirm: values.checkPassword,
                        platformType:'Web'
                    }
                    const dataEncrypt = await encryptData(dataInfo)
                    const res = await getResetPassword(dataEncrypt)
                    if (res.code === '0') {
                        setResetSuccess(true)

                    } else {
                        toast.error(res.message)
                    }

                } catch (error) {
                    toast.error(String(error))
                }
            })
            .catch((info) => {
                console.log("Validate Failed:", info);
            });
    }
    // 自定义密码验证规则
    const validatePassword = (_: any, value: string) => {
        if (typeof value === 'string') {
            value = value.trim();
        }
        if (!value) {
            return Promise.reject(new Error(t('passwordNull')));
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




    if (resetState !== ResetStateEnum.RESET) return null;

    return (
        <div className="flex-col" style={{ height: "70vh", width: "100%" }}>
            {/* <div className="mb-2 font-w-500 flex-col" style={{ width: "300px" }}>新密码
            </div> */}
            <div>
                <Form
                    // style={fromStyle}
                    name="login"
                    size="large"
                    form={form}
                    initialValues={{
                        remember: true,
                    }}
                // onFinish={handleFinish}
                // onValuesChange={usernameChange}
                >
                    <div className={`${styles.title_color} mb-5 font-16 font-w-500 mt-5`}>
                        {/* 新密码 */}
                        {t('newPassword')}
                    </div>
                    <Form.Item name="newPassword" rules={[{ validator: validatePassword }]}>
                        <Input.Password
                            className={`custom-input ${styles.acount_input} ${styles.mail_input} modal-input`}
                            placeholder={t('newPasswordInput')}
                            allowClear
                            visibilityToggle={{ visible: passwordVisible, onVisibleChange: setPasswordVisible }}
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
                                {t('passwordLength')}
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
                                {t('passwordChar')}
                            </div>
                        )}
                    </div>

                    <div className={`${styles.title_color} mb-5 font-16 font-w-500 mt-5`}>
                        {/* 确认密码 */}
                        {t('passwordConfirm')}
                    </div>
                    <Form.Item
                        name="checkPassword"
                        rules={[
                            { required: true, message: t('passwordNull') },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("newPassword") === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error(t('passwordConfirmError')));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            className={`custom-input ${styles.acount_input} ${styles.mail_input} modal-input`}
                            placeholder={t('passwordConfirm')}
                            allowClear
                            visibilityToggle={{ visible: verifyPasswordVisible, onVisibleChange: setverifyPasswordVisible }}
                        />
                    </Form.Item>
                </Form>


                <div className='flex mt-10'>
                    <button
                        className={`${styles.goBack_btn} mr-4`}
                        onClick={() => goLast()}>
                            {/* 上一步 */}
                            {t('goBack')}
                            </button>
                    <button type='submit' className={`btn-color ${styles.next_btn} flex-1`} onClick={onSubmit}>
                        {/* 确认 */}
                        {t('confirm')}
                    </button>
                </div>
            </div>
            <ResetSuccessModal open={resetSuccess} onOk={() => goNext()} onCancel={() => handCancel()} />
        </div>
    );
}

export default ResetPassword;
