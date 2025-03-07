
import { Input, Form, ConfigProvider,Select } from 'antd';
// import type { AutoCompleteProps } from 'antd';
import { useState } from "react";
import { toast } from "sonner";
// import store from "@/store";
import { useRouter } from 'next/router';
import styles from "../../styles/identityAuth.module.css"
import ResetSuccessModal from "@/components/myModal/ressetSuccessModal"
import { encryptData } from "@/utils/encrypt";
import { getResetPassword } from "@/services/resetPassword"
import { Iconify } from "@/components/icon/index";
import dayjs from 'dayjs';

interface IDVProps {
    onNext: () => void;
}

function ResetPassword({ onNext }: IDVProps) {
    const router = useRouter();
    const [form] = Form.useForm();
    const cardTypeSeelect:{ label: string, value: string }[] = [
        {
            label: '居民身份证',
            value: '1'
        },
        {
            label: '普通护照',
            value: '2'
        },
        {
            label: '港澳通行证',
            value: '3'
        },
        {
            label: '台湾通行证',
            value: '4'
        },
        {
            label: '台湾身份证',
            value: '5'
        },
        {
            label: '外国人永久居住身份证',
            value: '6'
        }
    ]


    // const goNext = () => {
    //     router.push('/login');
    // }

    const onSubmit = () => {
        form
            .validateFields()
            .then(async (values) => {
                console.log(values);
            })
            .catch((info) => {
                console.log("Validate Failed:", info);
            });
    }
    // 自定义验证规则
    const validatePassword = (_: any, value: string) => {
        if (typeof value === 'string') {
            value = value.trim();
        }
        if (!value) {
            return Promise.reject(new Error("请输入生日!"));
        }
        const validFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY/MM/DD']
        let isValid = false;

        validFormats.forEach((format) => {
            if (dayjs(value, format, true).isValid()) {
                isValid = true;
            }
        });

        if (!isValid) {
            return Promise.reject(new Error("请输入有效的日期格式（年/月/日）！"));
        }

        return Promise.resolve();
    };

    return (
        <div className="flex-col " style={{ width: "60%",marginTop:50 }}>
            <div className="mb-2 font-w-500 flex-y-cc font-24" >
                新密码
                <p className={`${styles.tip_color} font-14 font-w-400 mt-2_5`}>请务必确保输入信息与证件信息一致</p>
            </div>
            <div className='mt-7'>
                <ConfigProvider
                    theme={{
                        components:{
                            Select:{
                                clearBg:"#ffffff",
                                selectorBg:'var(--background)',
                                singleItemHeightLG:50,
                            },
                            Form: {
                                itemMarginBottom: 20, // 去除表单项之间的间距
                            },
                            Input: {
                                // color: '#FF5F1F',
                                activeBorderColor: '#FF5F1F',
                                hoverBorderColor: '#FF5F1F',
                                controlHeightLG: 50,
                                activeBg: 'var(--background)',
                                hoverBg: 'var(--background)',
                            },
                            Button: {
                                controlHeightLG: 50,
                                defaultActiveBorderColor: '#FF5F1F', //默认按钮激活态边框颜色
                                defaultActiveColor: '#FF5F1F', //默认按钮激活态文本颜色
                                defaultBg: '#FF5F1F', //默认按钮背景颜色
                                defaultHoverBorderColor: '#FF5F1F', //默认按钮悬浮态边框颜色
                                defaultHoverColor: '#FF5F1F', //默认按钮悬浮态文本颜色
                                defaultColor: '#fff', //默认按钮文本颜色
                            },

                        }
                    }}
                >
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
                         <div className={`mb-2 font-16 font-w-400 ${styles.title_color}`}>国家名称</div>
                        <Form.Item name="countryId">
                            <Select allowClear
                             placeholder="请选择"
                                options={cardTypeSeelect}
                                className={`custom-sleect`}
                            />
                        </Form.Item>
                        <div className={`mb-2 font-16 font-w-400 ${styles.title_color}`}>证件类型</div>
                        <Form.Item name="cardType">
                            <Select allowClear
                             placeholder="请选择"
                                options={cardTypeSeelect}
                                className={`custom-sleect`}
                            />
                        </Form.Item>
                        <div className={`mb-2 font-16 font-w-400 ${styles.title_color}`}>证件号码</div>
                        <Form.Item name="cardCode" >
                            <Input
                                className={`custom-input ${styles.input_box} modal-input2`}
                                placeholder="请输入"
                                allowClear
                            />
                        </Form.Item>
                        <div className="flex">
                            <div className='flex-1 mr-2_5'>
                                <Form.Item
                                    name="surname"
                            >
                                <div className={`mb-2 font-16 font-w-400 ${styles.title_color}`}>姓</div>
                                <Input
                                    className={`custom-input ${styles.input_box} modal-input2`}
                                    placeholder="请输入"
                                    allowClear
                                    />
                                </Form.Item>
                            </div>
                            <div className='flex-1'>
                                <Form.Item
                                    name="firstName"
                            >
                                <div className={`mb-2 font-16 font-w-400 ${styles.title_color}`}>名</div>
                                <Input
                                    className={`custom-input ${styles.input_box} modal-input2`}
                                    placeholder="请输入"
                                    allowClear
                                />

                                </Form.Item>
                            </div>
                        </div>
                        <div className="mb-2 font-16 font-w-400">出生日期</div>
                        <Form.Item name="birthday" 
                        // rules={[{ validator: validatePassword }]}
                        >
                            <Input placeholder="年/月/日"
                                className={`${styles.input_box} modal-input2`}
                                maxLength={13}
                                suffix={
                                    <Iconify icon="cuida:calendar-outline" className={`${styles.suffix_icon} mr-1`} />
                                }
                            />
                        </Form.Item>
                    </Form>

                </ConfigProvider>
                <div className='mt-10'>
                    <button
                        className={`${styles.btn_style} disabled_btn`}
                    >下一步</button>
                    <button type='submit' className={`default_btn ${styles.btn_style} flex-1`} onClick={onNext}>下一步</button>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
