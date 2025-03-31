import { Input, Form, ConfigProvider, DatePicker, Select, Calendar } from 'antd';
// import type { AutoCompleteProps } from 'antd';
import { useState, useEffect } from "react";
import { toast } from "sonner";
// import store from "@/store";
import { useRouter } from 'next/router';
import styles from "../../styles/identityAuth.module.css"
import ResetSuccessModal from "@/components/myModal/ressetSuccessModal"
import { encryptData } from "@/utils/encrypt";
import { getResetPassword } from "@/services/resetPassword"
import { Iconify } from "@/components/icon/index";
import dayjs from 'dayjs';
import { getCountryCode } from "@/services/open";
import type { CalendarProps } from 'antd';
import type { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';

interface IDVProps {
    onNext: (event: eventType) => void;
}
interface ICountryData {
    id: number;
    areaCode: string;
    iconUrl: string;
    countryName: string;
    status: number;
}
interface eventType {
    surname: string;
    firstName: string;
    countryId: string;
    cardType: string;
    cardCode: string;
    birthday: string;
}


function ResetPassword({ onNext }: IDVProps) {
    const [countryData, setCountryData] = useState<ICountryData[]>([]);
    const [isNext, setIsNext] = useState(false);
    const router = useRouter();
    const [form] = Form.useForm();
    const { t } = useTranslation(['userCenter']);
    const cardTypeSeelect: { label: string, value: string }[] = [
        {
            label: t('identity.certified.idTypes.idCard'), // 居民身份证
            value: '1'
        },
        {
            label: t('identity.certified.idTypes.passport'), // 普通护照
            value: '2'
        },
        {
            label: t('identity.certified.idTypes.hkMacauPass'), // 港澳通行证
            value: '3'
        },
        {
            label: t('identity.certified.idTypes.taiwanPass'), // 台湾通行证
            value: '4'
        },
        {
            label: t('identity.certified.idTypes.taiwanId'), // 台湾身份证
            value: '5'
        },
        {
            label: t('identity.certified.idTypes.foreignerId'), // 外国人永久居住身份证
            value: '6'
        }
    ]


    // const goNext = () => {
    //     router.push('/login');
    // }
   // 保存表单数据到localStorage
   const saveFormData = (values: any) => {
    sessionStorage.setItem('idvFormData', JSON.stringify(values));
};

    const onSubmit = () => {
        form
            .validateFields()
            .then(async (values) => {
                console.log(values);
                const param = {
                    ...values,
                    birthday: dayjs(values.birthday).format('YYYY-MM-DD')
                }
                saveFormData(param)
                onNext(param)
            })
            .catch((info) => {
                console.log("Validate Failed:", info);
            });
    }
      // 从localStorage加载表单数据
      const loadFormData = () => {
        const savedData = sessionStorage.getItem('idvFormData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            // 如果有生日字段，需要转换为dayjs对象
            if (parsedData.birthday) {
                parsedData.birthday = dayjs(parsedData.birthday);
            }
            form.setFieldsValue(parsedData);
            // 检查表单是否完整，更新下一步按钮状态
            setIsNext(checkFormComplete(parsedData));
        }
    };
    const onValuesChange = (changedValues: any, allValues: any) => {
        // console.log(changedValues);
        const isFormComplete = checkFormComplete(allValues);
        setIsNext(isFormComplete)
    };
    const checkFormComplete = (values: any) => {
        const requiredFields = ['areaCode', 'cardType', 'cardCode', 'surname', 'firstName', 'birthday'];
        return requiredFields.every(field => {
            const value = values[field];
            return value !== undefined && value !== null && value !== '';
        });
    }
    const getCountryCodeData = async () => {
        const res = await getCountryCode();
        if (res.code === '0') {
            const info = res.data.map((item: ICountryData) => {
                return {
                    label: item.countryName,
                    value: item.areaCode
                }
            })
            setCountryData(info);
        }
    }

    useEffect(() => {
        getCountryCodeData();
        loadFormData();
    }, [])

    return (
        <div className="flex-col " style={{ width: "60%", marginTop: 50 }}>
            <div className="mb-2 font-w-500 flex-y-cc font-24" >
                {/* 证件验证 */}
                {t('identity.idv.title')}
                <p className={`${styles.tip_color} font-14 font-w-400 mt-2_5`}>
                    {/* 请务必确保输入信息与证件信息一致 */}
                    {t('identity.idv.inputTip')}
                </p>
            </div>
            <div className='mt-7'>
                <ConfigProvider
                    theme={{
                        components: {
                            Select: {
                                clearBg: "#ffffff",
                                selectorBg: 'var(--background)',
                                singleItemHeightLG: 50,
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
                        onValuesChange={onValuesChange}
                    >
                        <div className={`mb-2 font-16 font-w-400 ${styles.title_color}`}>
                            {/* 国家名称 */}
                            {t('identity.idv.country.title')}
                        </div>
                        <Form.Item name="areaCode">
                            <Select allowClear
                                placeholder={t('identity.idv.country.placeholder')}
                                options={countryData}
                                className={`custom-select`}
                            />
                        </Form.Item>
                        <div className={`mb-2 font-16 font-w-400 ${styles.title_color}`}>
                            {/* 证件类型 */}
                            {t('identity.idv.idType.title')}
                        </div>
                        <Form.Item name="cardType">
                            <Select allowClear
                                placeholder={t('identity.idv.idType.placeholder')}
                                options={cardTypeSeelect}
                                className={`custom-select`}
                            />
                        </Form.Item>
                        <div className={`mb-2 font-16 font-w-400 ${styles.title_color}`}>
                            {/* 证件号码 */}
                            {t('identity.idv.idNumber.title')}
                        </div>
                        <Form.Item name="cardCode" >
                            <Input
                                className={`custom-input ${styles.input_box} modal-input2`}
                                placeholder={t('identity.idv.idNumber.placeholder')}
                                allowClear
                            />
                        </Form.Item>
                        <div className="flex">
                            <div className='flex-1 mr-2_5'>
                                <div className={`mb-2 font-16 font-w-400 ${styles.title_color}`}>
                                    {/* 姓 */}
                                    {t('identity.idv.name.surname')}
                                </div>
                                <Form.Item
                                    name="surname"
                                >
                                    <Input
                                        className={`custom-input ${styles.input_box} modal-input2`}
                                        placeholder={t('identity.idv.name.placeholder')}
                                        allowClear
                                    />
                                </Form.Item>
                            </div>
                            <div className='flex-1'>
                                <div className={`mb-2 font-16 font-w-400 ${styles.title_color}`}>
                                    {/* 名 */}
                                    {t('identity.idv.name.firstName')}
                                </div>
                                <Form.Item
                                    name="firstName"
                                >
                                    <Input
                                        className={`custom-input ${styles.input_box} modal-input2`}
                                        placeholder={t('identity.idv.name.placeholder')}
                                        allowClear
                                    />

                                </Form.Item>
                            </div>
                        </div>
                        <div className="mb-2 font-16 font-w-400">
                            {/* 出生日期 */}
                            {t('identity.idv.birthday.title')}
                        </div>
                        <Form.Item name="birthday"
                        // rules={[{ validator: validatePassword }]}
                        >
                            {/* <Input placeholder="年/月/日"
                                className={`${styles.input_box} modal-input2`}
                                maxLength={13}
                                suffix={
                                    <Iconify icon="cuida:calendar-outline" className={`${styles.suffix_icon} mr-1`} />
                                }
                            /> */}
                            <DatePicker
                                className={`custom-input ${styles.input_box} modal-input2`}
                                style={{ width: '100%', height: '50px' }}
                                placeholder={t('identity.idv.birthday.placeholder')}
                                allowClear
                                suffixIcon={
                                    <Iconify icon="cuida:calendar-outline"
                                        className={`${styles.suffix_icon} mr-1`}
                                        size={20} />
                                }
                            />
                        </Form.Item>
                    </Form>

                </ConfigProvider>
                <div className='mt-10'>
                    
                    {!isNext ? (
                        <button
                            className={`${styles.btn_style} disabled_btn cursor-not-allowed`}
                            disabled
                        >
                            {/* 下一步 */}
                            {t('identity.idv.button.next')}
                        </button>
                    ) : (
                        <button
                            type='submit'
                            className={`default_btn ${styles.btn_style} flex-1 cursor-pointer`}
                            onClick={onSubmit}
                        >
                            {/* 下一步 */}
                            {t('identity.idv.button.next')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
