import { Modal, ConfigProvider, Form, Input, InputNumber } from "antd";

import type { ModalProps } from "antd/es/modal/interface";
// import { Iconify } from "@/components/icon/index";
// import store from "@/store"
// import { useRouter } from 'next/router';
import styles from "../styles/spotModal.module.css";
// import Image from 'next/image'
import { Iconify } from "@/components/icon/index";
import { updateOrder } from '@/services/spot'
import { toast } from "sonner";
import { useState, useEffect } from "react";
// import {encryptData} from '@/utils/encrypt'
import dayjs from "dayjs";
import { useTranslation } from 'next-i18next';
import { encryptData } from '@/hooks/user-encrypt'
import { NowDataType } from '@/type/spot/table';
interface UserCenterData {
    userId: number,
    nickname?: string,
    avatarUrl?: string,
    birthday?: string,
    isNicknameUpdate?: boolean,
    nicknameUpdateTime?: number,
}
type Props = {
    open: boolean;
    orderInfo: NowDataType;
    // onOk?: (event: boolean) => void;
    onOk: () => void;
    onCancel: () => void;
};

function UpdateOrder({ open, onCancel, orderInfo, onOk }: Props) {
    const { t } = useTranslation('spot');
    // const router = useRouter();
    const [form] = Form.useForm();
    // const [inputValue, setInputValue] = useState(orderInfo.amount || '');

    useEffect(() => {
        // setInputValue(orderInfo.amount || '');
        form.setFieldsValue({
            amount: orderInfo.amount || '',
            price: orderInfo.type === 1 ? orderInfo.price : ''

        });
    }, [orderInfo, form]);
    const handCancel = () => {
        form.resetFields();
        onCancel()
    };

    const handOk = async () => {
        // 这里可以添加点击验证码弹窗确认按钮后的处理逻辑
        form.validateFields()
            .then(async (values) => {
                let info
                if (orderInfo.type === 1) {
                    info = {
                        orderId: orderInfo.orderId,
                        amount: values.amount || 0,
                        price: values.price || 0,
                        symbol: orderInfo.symbol,
                        coinSymbol: orderInfo.coinSymbol,
                        baseSymbol: orderInfo.baseSymbol,
                        direction: orderInfo.direction,
                        type: orderInfo.type,
                    }
                } else {
                    info = {
                        orderId: orderInfo.orderId,
                        amount: values.amount || 0,
                        symbol: orderInfo.symbol,
                        coinSymbol: orderInfo.coinSymbol,
                        baseSymbol: orderInfo.baseSymbol,
                        direction: orderInfo.direction,
                        type: orderInfo.type,
                    }
                }
                console.log(info, 999)
                const encrypt = await encryptData(info)
                const res = await updateOrder(encrypt)
                if (res.code === '0') {
                    toast.success(res.message)
                    handCancel()
                } else {
                    toast.error(res.message)
                }
            });
    };
    // 过滤输入，只允许数字和字母
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        // 只保留数字和字母
        const filteredValue = value.replace(/[^a-zA-Z0-9]/g, '');
        // setInputValue(filteredValue);
        // form.setFieldsValue({ nickname: filteredValue });
    };

    const ModalFooter: ModalProps["footer"] = () => {

        return (
            <div className="flex-x align-center justify-end" >
                <button
                    type="button"
                    className={`${styles.modal_footerBtn} cancel_btn2 mr-5 font-14 font-w-500`}
                    onClick={handCancel}
                >
                    {/* 取消 */}
                    {t('spot.modal.cancel')}
                </button>
                <button
                    type="submit"
                    className={`${styles.modal_footerBtn} default_btn`}
                    onClick={handOk}
                >
                    {/* 确认 */}
                    {t('spot.modal.confirm')}
                </button>
            </div>
        );
    };

    return (
        <ConfigProvider
            theme={{
                components: {
                    Form: {
                        itemMarginBottom: 20, // 去除表单项之间的间距
                    },
                    // Input: {
                    //     // color: '#FF5F1F',
                    //     activeBorderColor: 'var(--theme-color)',
                    //     hoverBorderColor: 'var(--theme-color)',
                    //     controlHeightLG: 50,
                    //     activeBg: 'var(--background5)',
                    //     hoverBg: 'var(--background5)',
                    // },
                    InputNumber: {
                        controlHeightLG: 50,
                        activeBorderColor: 'var(--theme-color)',
                        hoverBorderColor: 'var(--theme-color)',
                        activeBg: 'var(--background7)',
                        hoverBg: 'var(--background7)',
                        handleBg: 'transparent', //操作按钮背景色
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
                    Modal: {
                        contentBg: "var(--background5)",
                        footerBg: "var(--background5)",
                        headerBg: "var(--background5)",
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
                    {/* 修改昵称
                    {t('usersetting.modifyNickname')} */}
                </p>}
                centered
                onCancel={handCancel}
                footer={ModalFooter}
                width={500}
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
                    // initialValues={{ amount: orderInfo.amount || '', price: orderInfo.type === 1 ? orderInfo.price: '' }}
                    >
                        <Form.Item name="amount" rules={[{ required: true, message: t('spot.modal.price') }]}>
                            <InputNumber className={`${styles.mail_input} spot_number_input`}
                                prefix={<span className={`${styles.tip_color2}`}>{t('spot.modal.amount')}</span>}
                                suffix={<div>
                                    {orderInfo?.symbol ? orderInfo?.symbol.split('/')[1] : '--'}
                                </div>}
                                // placeholder={t('spot.modal.amount')}
                                parser={(value) => {
                                    if (value === '' || value === null || value === undefined) return '';
                                    // 只保留数字和第一个小数点
                                    const parsed = value.toString().replace(/[^\d.]/g, '')
                                        .replace(/\.(?=.*\.)/g, '');
                                    return parsed as unknown as number;
                                }}

                            />
                        </Form.Item>
                        <Form.Item name="price" rules={[{ required: orderInfo.type === 1 ? true : false, message: t('spot.modal.errmax', { max: 112 }) }]}>
                            <InputNumber className={`${styles.mail_input} spot_number_input`}
                                // onChange={handleInputChange}
                                // value={inputValue}
                                // placeholder={t('spot.modal.price')}
                                prefix={<span className={`${styles.tip_color2}`}>{t('spot.modal.price')}</span>}
                                suffix={orderInfo.type === 1 ? <div>
                                    {orderInfo?.symbol ? orderInfo?.symbol.split('/')[0] : '--'}
                                </div> : t('spot.select.market')}
                                parser={(value) => {
                                    if (value === '' || value === null || value === undefined) return '';
                                    // 只保留数字和第一个小数点
                                    const parsed = value.toString().replace(/[^\d.]/g, '')
                                        .replace(/\.(?=.*\.)/g, '');
                                    return parsed as unknown as number;
                                }}
                                disabled={orderInfo.type !== 1}
                                controls={orderInfo.type === 1}
                            />
                        </Form.Item>
                    </Form>

                </div>
            </Modal>
        </ConfigProvider>
    );
}

export default UpdateOrder;
