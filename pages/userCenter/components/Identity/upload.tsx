import { Form, ConfigProvider, Upload, message } from 'antd';
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from 'next/router';
import styles from "../../styles/identityAuth.module.css";
// import { encryptData } from "@/utils/encrypt";
import { Iconify } from "@/components/icon/index";
import type { UploadFile, UploadProps } from 'antd';
import Image from 'next/image';
import type { CSSProperties } from "react";
import { fileImg } from "@/services/open";
import { postSaveIdentity } from "@/services/userCenter";
import dayjs from 'dayjs';
import { encryptData } from '@/hooks/user-encrypt'
import { useThemeMode } from '@/hooks/useThemeMode';
import { useTranslation } from 'next-i18next';

interface eventType {
    surname: string;
    firstName: string;
    countryId: string;
    cardType: string;
    cardCode: string;
    birthday: string;
    frontUrl?: string;
    backUrl?: string;
    selfieUrl?: string;
}

interface IDVProps {
    onNext: () => void;
    onPrev: () => void;
    userInfo: eventType;
}
const uploadBgcStyle: CSSProperties = {
    backgroundColor: "var(--background)",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: 'center',
    height: "235px",
    width: "360px"
};

function ResetPassword({ onNext, onPrev, userInfo }: IDVProps) {
    const router = useRouter();
    const [form] = Form.useForm();
    const { t } = useTranslation(['userCenter']);
    const [frontFileLoading, setFrontFileLoading] = useState<boolean>(false);
    const [frontFileUrl, setFrontFileUrl] = useState<string>('');
    const [backFileLoading, setBackFileLoading] = useState<boolean>(false);
    const [backFileUrl, setBackFileUrl] = useState<string>('');
    const [selfieFileLoading, setSelfieFileLoading] = useState<boolean>(false);
    const [selfieFileUrl, setSelfieFileUrl] = useState<string>('');
    // const [isNext, setIsNext] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // 提交loading
    const { isDayMode } = useThemeMode(); // 使用 hook

    // Check if all required files are uploaded
    const checkFilesComplete = () => {
        return !!frontFileUrl && !!backFileUrl && !!selfieFileUrl;
    };


    const beforeUpload = (file: File) => {
        const allowedTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif']
        const isPNG = allowedTypes.includes(file.type);
        if (!isPNG) {
            toast.error(`${file.name} ${t('identity.upload.error1')}`);
        }
        const isLt8M = file.size / 1024 / 1024 < 8;
        if (!isLt8M) {
            toast.error(t('identity.upload.error2'));
            return false;
        }
        return isPNG && isLt8M;
    };

    const onSubmit = async () => {
        if (isLoading) return
        if (checkFilesComplete()) {
            const isNext = checkFilesComplete()
            if (!isNext) return toast.error(t('identity.upload.error3'));
            try {
                const params = {
                    ...userInfo,
                    birthday: dayjs(userInfo.birthday).valueOf() + '',
                    frontUrl: frontFileUrl,
                    backUrl: backFileUrl,
                    selfieUrl: selfieFileUrl,
                    platformType: 'Web'
                }

                const encrypt = await encryptData(params)
                // console.log(params,111,encrypt,222);

                const res = await postSaveIdentity(encrypt)
                setIsLoading(true)
                if (res.code === '0') {
                    toast.success(t('identity.upload.success'));
                    sessionStorage.removeItem('idvFormData');
                    onNext();
                    localStorage.setItem('identity_authStatus', '3')

                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                toast.error(String(error));
            } finally {
                setIsLoading(false)
            }

        } else {
            toast.error(t('identity.upload.error3'));
        }
    };
    // const uploadHandler = async (file: File) => {
    //     try {
    //       const formData = new FormData();
    //       formData.append('file', file);
    //       const res = await fileImg(file);
    //       if(res.code==='0'){

    //       }else{
    //         toast.error(res.message);

    //       }

    //     } catch (error) {
    //         toast.error(String(error));
    //     }
    //   };
    const propsFront: UploadProps = {
        // 自定义上传
        customRequest: async ({ file, onSuccess, onError }) => {
            // const uploadResult = await fileImg(file as File);
            // const uploadResult = await uploadHandler(file as File);
            setFrontFileLoading(true);
            try {
                const formData = new FormData();
                formData.append('file', file);
                // 检查文件类型
                if (!(file instanceof File)) {
                    toast.error(t('identity.upload.error4'));
                    return;
                }
                const res = await fileImg(file);
                if (res.code === '0') {
                    // onSuccess(res.data);
                    console.log(res.data);
                    setFrontFileUrl(res.data.data);
                } else {
                    toast.error(res.message);
                }

            } catch (error) {
                toast.error(String(error));
            } finally {
                setFrontFileLoading(false);
            }
        },
    };
    const propsBack: UploadProps = {
        // 自定义上传
        customRequest: async ({ file, onSuccess, onError }) => {
            // const uploadResult = await fileImg(file as File);
            // const uploadResult = await uploadHandler(file as File);
            setBackFileLoading(true);
            try {
                const formData = new FormData();
                formData.append('file', file);
                // 检查文件类型
                if (!(file instanceof File)) {
                    toast.error(t('identity.upload.error4'));
                    return;
                }
                const res = await fileImg(file);
                if (res.code === '0') {
                    // onSuccess(res.data);
                    // console.log(res.data);
                    setBackFileUrl(res.data.data);

                } else {
                    toast.error(res.message);
                }

            } catch (error) {
                toast.error(String(error));
            } finally {
                setBackFileLoading(false);
            }
        },
    };
    const propsSelfie: UploadProps = {
        // 自定义上传
        customRequest: async ({ file, onSuccess, onError }) => {
            // const uploadResult = await fileImg(file as File);
            // const uploadResult = await uploadHandler(file as File);
            setSelfieFileLoading(true);
            try {
                const formData = new FormData();
                formData.append('file', file);
                // 检查文件类型
                if (!(file instanceof File)) {
                    toast.error(t('identity.upload.error4'));
                    return;
                }
                const res = await fileImg(file);
                if (res.code === '0') {
                    // onSuccess(res.data);
                    console.log(res.data);
                    setSelfieFileUrl(res.data.data);

                } else {
                    toast.error(res.message);
                }

            } catch (error) {
                toast.error(String(error));
            } finally {
                setSelfieFileLoading(false);
            }
        },
    };
    return (
        <div className="flex-col" style={{ width: "67%" }}>

            <div className={`flex-y align-center mt-6`}>
                {/* 证件正面 */}
                <div className={`${styles.upload_content} flex-y-cc relative`}
                    style={{
                        ...uploadBgcStyle,
                        backgroundImage: `url(${isDayMode ? '/images/userCenter/identity/frontage_day1.png' : '/images/userCenter/identity/frontage_night1.png'})`,
                    }}>
                    {frontFileUrl && <div className={`flex-y-cc`} style={{ width: '100%', height: '100%' }}>
                        <Image src={frontFileUrl}
                            alt={t('upload.frontFile')}
                            width={350} height={225}
                            style={{ width: '99%', height: '99%', borderRadius: '10px' }}
                        />
                    </div>}
                    <Upload
                        name="frontImage"
                        // listType="picture-card"
                        showUploadList={false}
                        beforeUpload={beforeUpload}
                        {...propsFront}
                        maxCount={1}
                        style={{ width: '100%', height: '100%' }}
                        className={`${styles.upload_box} absolute-center`}
                        openFileDialogOnClick={!frontFileLoading}
                    >
                        {/* {!frontFileUrl && ( */}
                        <div className={`flex-y-cc`}
                        >
                            <div className={`${styles.upload_icon} flex-x algin-center`}>
                                <Iconify icon={frontFileLoading ? "eos-icons:bubble-loading" : "solar:upload-linear"} size={20} />
                                <p className={`font-14 font-w-400 ml-1`}>
                                    {/* 上传文件 */}
                                    {t('identity.upload.uploadFile')}
                                </p>

                            </div>
                            <div className={`font-16 font-w-500 ${styles.title_color}`}>
                                {/* 证件正面 */}
                                {t('identity.upload.frontFile')}
                            </div>
                        </div>
                        {/* )} */}
                    </Upload>

                </div>
                {/* </Upload> */}
                {/* </div> */}

                {/* 证件反面 */}
                <div className={`${styles.upload_content} flex-y-cc mt-10 relative`}
                    style={{
                        ...uploadBgcStyle,
                        backgroundImage: `url(${isDayMode ? '/images/userCenter/identity/back_day2.png' : '/images/userCenter/identity/back_night2.png'})`,
                    }}>
                    {backFileUrl && <div className={`flex-y-cc`} style={{ width: '100%', height: '100%' }}>
                        <Image src={backFileUrl}
                            alt={t('upload.backFile')}
                            width={350} height={225}
                            style={{ width: '99%', height: '99%', borderRadius: '10px' }}
                        />
                    </div>}
                    <Upload
                        // listType="picture-card"
                        className={`${styles.upload_box} absolute-center`}
                        showUploadList={false}
                        beforeUpload={beforeUpload}
                        // onChange={handleBackChange}
                        maxCount={1}
                        {...propsBack}
                        openFileDialogOnClick={!backFileLoading}
                    >
                        {/* {!backFileUrl && ( */}
                        <div className={` flex-y-cc`}>
                            <div className={`${styles.upload_icon} flex-x algin-center`}>
                                <Iconify icon={backFileLoading ? "eos-icons:bubble-loading" : "solar:upload-linear"} size={20} />
                                <p className={`font-14 font-w-400 ml-1`}>
                                    {/* 上传文件 */}
                                    {t('identity.upload.uploadFile')}
                                </p>

                            </div>
                            <div className={`font-16 font-w-500 ${styles.title_color}`}>
                                {/* 证件反面 */}
                                {t('identity.upload.backFile')}
                            </div>
                        </div>
                        {/* )} */}
                    </Upload>

                </div>


                {/* 手持证件照 */}
                <div className={`${styles.upload_content} flex-y-cc mt-10 relative`}
                    style={{
                        ...uploadBgcStyle,
                        backgroundImage: `url(${isDayMode ? '/images/userCenter/identity/handcard_day3.png' : '/images/userCenter/identity/handcard_night3.png'})`,
                    }}>
                    {selfieFileUrl && <div className={`flex-y-cc`} style={{ width: '100%', height: '100%' }}>
                        <Image src={selfieFileUrl}
                            alt={t('identity.upload.selfieFile')}
                            width={350} height={225}
                            style={{ width: '99%', height: '99%', borderRadius: '10px' }}
                        />
                    </div>}
                    <Upload
                        name="selfieImage"
                        // listType="picture-card"
                        className={`${styles.upload_box} absolute-center`}
                        showUploadList={false}
                        beforeUpload={beforeUpload}
                        // onChange={handleSelfieChange}
                        maxCount={1}
                        {...propsSelfie}
                        openFileDialogOnClick={!selfieFileLoading}
                    >
                        {/* {!selfieFileUrl && ( */}
                        <div className={` flex-y-cc`}>
                            <div className={`${styles.upload_icon} flex-x algin-center`}>
                                <Iconify icon={selfieFileLoading ? "eos-icons:bubble-loading" : "solar:upload-linear"} size={20} />
                                <p className={`font-14 font-w-400 ml-1`}>
                                    {/* 上传文件 */}
                                    {t('identity.upload.uploadFile')}
                                </p>

                            </div>
                            <div className={`font-16 font-w-500 ${styles.title_color}`}>
                                {/* 手持证件照 */}
                                {t('identity.upload.selfieFile')}
                            </div>
                        </div>
                        {/* )} */}
                    </Upload>
                </div>
            </div>

            <ul className={`font-14 font-w-400 mt-7 ${styles.tip_color}`}>
                <li className="flex items-center mb-1">
                    <Iconify icon="emojione-monotone:small-blue-diamond" className={`${styles.error_icon} mr-2`} size={15} />
                    {/* 支持小于8M的JPG、JPEG或PNG格式图片。 */}
                    {t('identity.upload.tip1')}
                </li>
                <li className="flex items-center mb-1">
                    <Iconify icon="emojione-monotone:small-blue-diamond" className={`${styles.error_icon} mr-2`} size={15} />
                    {/* 证件照片要求清晰，不允许任何修改和遮挡，必须能看清人像、证件号和姓名。 */}
                    {t('identity.upload.tip2')}
                </li>
                <li className="flex items-center">
                    <Iconify icon="emojione-monotone:small-blue-diamond" className={`${styles.error_icon} mr-2`} size={15} />
                    {/* 照片需免冠，建议未化妆，手持证件人的五官清晰可鉴，完整漏出手臂。 */}
                    {t('identity.upload.tip3')}
                </li>
            </ul>

            <div className='mt-10 flex justify-between'>
                <button
                    className={`${styles.btn_style_prev} cancel_btn3`}
                    onClick={onPrev}
                >
                    {/* 上一步 */}
                    {t('identity.upload.prev')}
                </button>
                {!checkFilesComplete() ? (
                    <button
                        className={`${styles.btn_style_next} disabled_btn2 cursor-not-allowed`}
                        disabled

                    >
                        {/* 下一步 */}
                        {t('identity.upload.next')}
                    </button>
                ) : (
                    <button
                        type='submit'
                        className={`default_btn ${styles.btn_style_next} flex-x-cc`}
                        onClick={onSubmit}
                    >
                        {isLoading && <Iconify icon="eos-icons:bubble-loading" size={20} />}
                        {/* 下一步 */}
                        {t('identity.upload.next')}
                    </button>
                )}
            </div>
        </div>
    );
}

export default ResetPassword;