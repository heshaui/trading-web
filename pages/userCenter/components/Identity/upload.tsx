
import {  Form, ConfigProvider,Upload } from 'antd';
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
    onPrev: () => void;
}


function ResetPassword({ onNext, onPrev }: IDVProps) {
    const router = useRouter();
    const [form] = Form.useForm();
    

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
        <div className="flex-col" style={{ width: "67%" }}>
            
            <div className='mt-10'>
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
                    <ul className={`font-14 font-w-400 mt-3 ${styles.tip_color}`} >
                        <li>
                            <Iconify icon="emojione-monotone:small-blue-diamond" className={`${styles.error_icon}`} size={15} />
                            支持小于8M的JPG、JPEG或PNG格式图片。
                        </li>
                        <li>
                            <Iconify icon="emojione-monotone:small-blue-diamond" className={`${styles.error_icon}`} size={15} />
                            证件照片要求清晰，不允许任何修改和遮挡，必须能看清人像、证件号和姓名。
                        </li>
                        <li>
                            <Iconify icon="emojione-monotone:small-blue-diamond" className={`${styles.error_icon}`} size={15} />
                            照片需免冠，建议未化妆，手持证件人的五官清晰可鉴，完整漏出手臂。
                        </li>
                    </ul>

                </ConfigProvider>
                <div className='mt-10 flex justify-between'>
                    <button
                        className={`${styles.btn_style_prev} cancel_btn3`}
                        onClick={onPrev}
                    >上一步</button>
                    <button type='submit' className={`default_btn ${styles.btn_style_next}`} onClick={onNext}>下一步</button>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
