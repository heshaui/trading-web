import { Modal, ConfigProvider, Form, Input,DatePicker } from "antd";
// import { type CSSProperties, useState, useEffect } from "react";;
import type { ModalProps } from "antd/es/modal/interface";
// import { Iconify } from "@/components/icon/index";
// import store from "@/store"
// import { useRouter } from 'next/router';
import styles from "./styles/nickname.module.css";
import Image from 'next/image'
import { Iconify } from "@/components/icon/index";
import { updateUserCenter } from '@/services/userCenter';
import dayjs from 'dayjs';
import { toast } from "sonner";
// import {encryptData} from '@/utils/encrypt'
import { useTranslation } from 'next-i18next';
import {encryptData} from '@/hooks/user-encrypt'
type Props = {
    open: boolean;
    userId: number;
    // onOk?: (event: boolean) => void;
    onOk: (bool: boolean) => void;
    onCancel: () => void;
};

function BirthdayModal({ open, onCancel, userId, onOk }: Props) {
    // const router = useRouter();
    const [form] = Form.useForm();
    const { t } = useTranslation(['common']);
    const handCancel = () => {
        // form.resetFields();
        onCancel()
    };

    const handOk = async () => {
        // 这里可以添加点击验证码弹窗确认按钮后的处理逻辑
        form.validateFields()
            .then(async (values) => {
                console.log(values,dayjs(values.birthday).valueOf(),111);
                const params = {
                    userId: userId,
                    birthday: dayjs(values.birthday).valueOf() + '' 
                }
                try {
                    const encrypt = await encryptData(params)
                    const res = await updateUserCenter(encrypt);
                    if(res.code === '0'){
                        toast.success(t('usersetting.birthday.modifySuccess'));
                        onOk(true)
                        onCancel()
                    }else{
                        toast.error(res.message);
                    }

                } catch (error) {
                    toast.error(String(error));
                }

            });
    };
    const ModalFooter: ModalProps["footer"] = () => {

        return (
            <div className="flex-x align-center justify-end" >
                <button
                    type="button"
                    className={`${styles.modal_footerBtn} cancel_btn2 mr-5 font-14 font-w-500`}
                    onClick={handCancel}
                >
                    {t('cancel')}
                </button>
                <button
                    type="submit"
                    className={`${styles.modal_footerBtn} default_btn`}
                    onClick={handOk}
                >
                    {t('save')}
                </button>
            </div>
        );
    };
    // 自定义验证规则
    const validatePassword = (_: any, value: string) => {
        if (typeof value === 'string') {
            value = value.trim();
        }
        if (!value) {
            return Promise.reject(new Error(t('usersetting.birthday.required')));
        }
        const validFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY/MM/DD']
        let isValid = false;

        validFormats.forEach((format) => {
            if (dayjs(value, format, true).isValid()) {
                isValid = true;
            }
        });

        if (!isValid) {
            return Promise.reject(new Error(t('usersetting.birthday.invalidFormat')));
        }

        return Promise.resolve();
    };

    return (
        <ConfigProvider
            theme={{
                components: {
                    Form: {
                        itemMarginBottom: 0, // 去除表单项之间的间距
                    },
                    Input: {
                        // color: '#FF5F1F',
                        activeBorderColor: 'var(--theme-color)',
                        hoverBorderColor: 'var(--theme-color)',
                        controlHeightLG: 50,
                        activeBg: 'var(--background5)',
                        hoverBg: 'var(--background5)',
                    },
                    Button: {
                        controlHeightLG: 50,
                        defaultActiveBorderColor: 'var(--theme-color)', //默认按钮激活态边框颜色
                        defaultActiveColor: 'var(--theme-color)', //默认按钮激活态文本颜色
                        defaultBg: 'var(--theme-color)', //默认按钮背景颜色
                        defaultHoverBorderColor: 'var(--theme-color)', //默认按钮悬浮态边框颜色
                        defaultHoverColor: 'var(--theme-color)', //默认按钮悬浮态文本颜色
                        defaultColor: '#fff', //默认按钮文本颜色
                    },
                    Modal:{
                        contentBg: "var(--background5)",
                        footerBg: "var(--background5)",
                        headerBg: "var(--background5)",
                    },
                    DatePicker:{
                        activeBg: 'var(--background5)', // 激活态背景颜色
                        hoverBg: 'var(--background5)', // hover状态背景颜色
                    }
                },
                token: {
                    // colorBgContainerDisabled: '#fff',
                }
            }}
        >
            <Modal
                open={open}
                title={<p className={`${styles.title}`} >
                    {t('usersetting.birthday.title')}
                </p>}
                centered
                onCancel={handCancel}
                footer={ModalFooter}
                width={440}
                className={`modal_box`}
                classNames={{
                    content: styles.modal_content,
                    body: styles.modal_body,
                    footer: styles.modal_footer,
                }}
                maskClosable={false}
            >
                <div className="flex-col flex-ai-center" style={{ width: "100%" }}>
                    {/* t() */}
                    <Form
                        name="nickname"
                        form={form}
                        size="large"
                        style={{ width: "100%" }}
                    // initialValues={{ nickname: nickname||'' }}
                    >
                        <Form.Item name="birthday" rules={[
                            { validator: validatePassword }
                        ]}>
                            {/* <Input placeholder="年/月/日"
                                className={`${styles.input_box} modal-input`}
                                maxLength={13}
                                suffix={
                                    <Iconify icon="cuida:calendar-outline" className={`${styles.suffix_icon} mr-1`} />
                                }
                            /> */}
                            <DatePicker
                                className={`custom-input ${styles.input_box} modal-input2`}
                                style={{ width: '100%', height: '50px' }}
                                placeholder={t('usersetting.birthday.placeholder')}
                                allowClear
                                disabledDate={(current) => {
                                    // 使用dayjs禁用当前日期以后的日期
                                    return  current > dayjs().endOf('day');
                                }}
                                suffixIcon={
                                    <Iconify icon="cuida:calendar-outline"
                                        className={`${styles.suffix_icon} mr-1`}
                                        size={20} />
                                }
                            />
                        </Form.Item>
                        <ul className={`${styles.msg_color} mt-2_5 font-12 font-w-400`}>
                            <li className="flex align-base ">
                                {t('usersetting.birthday.tip')}
                            </li>
                        </ul>
                    </Form>

                </div>
            </Modal>
        </ConfigProvider>
    );
}

export default BirthdayModal;
