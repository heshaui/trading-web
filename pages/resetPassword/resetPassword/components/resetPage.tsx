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
    if (resetState !== ResetStateEnum.RESET) return null;



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
                    <Form.Item name="newPassword" rules={[{ required: true, message: "密码不能为空！" }]}>
                        <Input.Password
                            style={{ width: "100%" }}
                            className='custom-input'
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
                        className='custom-input'
                            placeholder="请确认密码"
                            allowClear
                            visibilityToggle={{ visible: verifyPasswordVisible, onVisibleChange: setverifyPasswordVisible }}
                        />
                    </Form.Item>
                </Form>


                <div className='flex mt-10'>
                    <button
                        className={`${styles.goBack_btn} mr-4`}
                        onClick={() => goLast()}>返回</button>
                    <button type='submit' className={`btn-color ${styles.next_btn} flex-1`} onClick={onSubmit}>确认</button>
                </div>
            </div>
            <ResetSuccessModal open={resetSuccess} onOk={() => goNext()}  onCancel={()=>handCancel()}/>
        </div>
    );
}

export default ResetPassword;
