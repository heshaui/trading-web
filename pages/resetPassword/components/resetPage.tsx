// import { Button, Form, Input,Tabs } from "antd";
import { Input,  Form } from 'antd';
// import type { AutoCompleteProps } from 'antd';
import {  useState } from "react";
import { useResetStateContext, ResetStateEnum } from "@/config/reset-providers/ResetStateProvider";
import { toast } from "sonner";
// import store from "@/store";
import { useRouter } from 'next/router';
import styles from "../style/reset.module.css"
import ResetSuccessModal from "@/components/myModal/ressetSuccessModal"
import { encryptData } from "@/utils/encrypt";
import { getResetPassword } from "@/services/resetPassword"
function ResetPassword() {
    const router = useRouter();
    const [form] = Form.useForm();
    const { resetState, setResetState,acount } = useResetStateContext();
    // const [authCode, setAuthCode] = useState('');
    // const [options, setOptions] = useState<AutoCompleteProps['options']>([]);
    const [passwordVisible, setPasswordVisible] = useState(false);
	// const [oldPasswordVisible, setOldPasswordVisible] = useState(false);
	const [verifyPasswordVisible, setverifyPasswordVisible] = useState(false);
	const [resetSuccess, setResetSuccess] = useState(false);
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
    const  onSubmit=()=>{
        form
        .validateFields()
        .then(async (values) => {
            try {
                const dataInfo = {
                    type: acount.type,
                    account: acount.acount,
                    password: values.newPassword,
                    passwordConfirm: values.checkPassword
                }
                const dataEncrypt = await encryptData(dataInfo)
                const res=await getResetPassword(dataEncrypt)
                if (res.code === '0') {
                setResetSuccess(true)
                    
                }else{
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
	const validatePassword = (_:any,value: string) => {
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
                    <div className="mb-5 font-16 font-w-500">新密码</div>
                    <Form.Item name="newPassword" rules={[{ validator: validatePassword }]}>
                        <Input.Password
                            className={`custom-input ${styles.acount_input}`}
                            placeholder="请输入新密码"
                            allowClear
                            visibilityToggle={{ visible: passwordVisible, onVisibleChange: setPasswordVisible }}
                        />
                    </Form.Item>
                    <div className="mb-5 font-16 font-w-500">确认密码</div>
                    <Form.Item
                        name="checkPassword"
                        rules={[
                            { required: true, message: "密码不能为空！" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("newPassword") === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error("两次输入的密码不匹配!"));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                        className={`custom-input ${styles.acount_input}`}
                            placeholder="请确认密码"
                            allowClear
                            visibilityToggle={{ visible: verifyPasswordVisible, onVisibleChange: setverifyPasswordVisible }}
                        />
                    </Form.Item>
                </Form>


                <div className='flex mt-10'>
                    <button
                        className={`${styles.goBack_btn} mr-4`}
                        onClick={() => goLast()}>上一步</button>
                    <button type='submit' className={`btn-color ${styles.next_btn} flex-1`} onClick={onSubmit}>确认</button>
                </div>
            </div>
            <ResetSuccessModal open={resetSuccess} onOk={() => goNext()}  onCancel={()=>handCancel()}/>
        </div>
    );
}

export default ResetPassword;
