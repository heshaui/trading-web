
import { Form, ConfigProvider, Upload } from 'antd';
// import type { AutoCompleteProps } from 'antd';
// import { useState } from "react";
// import { toast } from "sonner";
// import store from "@/store";
import { useRouter } from 'next/router';
import styles from "../../styles/identityAuth.module.css"
// import ResetSuccessModal from "@/components/myModal/ressetSuccessModal"
// import { encryptData } from "@/utils/encrypt";
// import { getResetPassword } from "@/services/resetPassword"
// import { Iconify } from "@/components/icon/index";
// import dayjs from 'dayjs';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
interface IDVProps {
    onNext: () => void;
    onPrev: () => void;
}


function SumbitPage() {
    const router = useRouter();
    const { t } = useTranslation(['userCenter']);
    // const [form] = Form.useForm();
    // const onSubmit = () => {
    //     form
    //         .validateFields()
    //         .then(async (values) => {
    //             console.log(values);
    //         })
    //         .catch((info) => {
    //             console.log("Validate Failed:", info);
    //         });
    // }
    const onNext = () => {
        router.push('/userCenter')
    }

    return (
        <div className="flex-col" style={{ width: "100%" }}>

            <div className='mt-10 flex-y-cc text-center'>
                <Image src="/images/userCenter/identity/icon_checking.png" alt='' width={120} height={120} className='mr-2' />
                <p className={`${styles.tip_title}  font-20 font-w-500`}>
                    {/* 审核中 */}
                    {t('sumbit.title')}
                </p>
                <p className={`${styles.tip_color} font-14 font-w-400 mt-4`}>
                    {/* 我们正在审核您的申请。通过审核之后，我们会发送邮件通知您。 等候期间，欢迎浏览我们的网页/App */}
                    {t('sumbit.content')}
                </p>

                <div className='mt-10 flex justify-between' style={{width:'60%'}}>
                    <button type='submit' className={`default_btn ${styles.btn_style}`} onClick={onNext}>
                        {/* 下一步 */}
                        {t('sumbit.next')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SumbitPage;
