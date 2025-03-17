import { Form, ConfigProvider, Upload, message } from 'antd';
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from 'next/router';
import styles from "../../styles/identityAuth.module.css";
import { encryptData } from "@/utils/encrypt";
import { Iconify } from "@/components/icon/index";
import type { UploadFile, UploadProps } from 'antd';
import Image from 'next/image';
import type { CSSProperties } from "react";
import { fileImg } from "@/services/open";

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
    backgroundColor: "#ffffff",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: 'center',
    height: "235px",
    width: "360px"
};

function ResetPassword({ onNext, onPrev, userInfo }: IDVProps) {
    const router = useRouter();
    const [form] = Form.useForm();
    const [frontFile, setFrontFile] = useState<UploadFile | null>(null);
    const [backFile, setBackFile] = useState<UploadFile | null>(null);
    const [selfieFile, setSelfieFile] = useState<UploadFile | null>(null);
    const [isNext, setIsNext] = useState(false);

    // Check if all required files are uploaded
    const checkFilesComplete = () => {
        return !!frontFile && !!backFile && !!selfieFile;
    };

    // Update isNext state whenever files change
    const updateNextState = () => {
        setIsNext(checkFilesComplete());
    };

    const beforeUpload = (file: File) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            toast.error('只能上传JPG/PNG格式的图片!');
            return false;
        }
        const isLt8M = file.size / 1024 / 1024 < 8;
        if (!isLt8M) {
            toast.error('图片必须小于8MB!');
            return false;
        }
        return isJpgOrPng && isLt8M;
    };

    const handleFrontChange: UploadProps['onChange'] = ({ fileList }) => {
        if (fileList.length > 0) {
            setFrontFile(fileList[0]);
        } else {
            setFrontFile(null);
        }
        updateNextState();
    };

    const handleBackChange: UploadProps['onChange'] = ({ fileList }) => {
        if (fileList.length > 0) {
            setBackFile(fileList[0]);
        } else {
            setBackFile(null);
        }
        updateNextState();
    };

    const handleSelfieChange: UploadProps['onChange'] = ({ fileList }) => {
        if (fileList.length > 0) {
            setSelfieFile(fileList[0]);
        } else {
            setSelfieFile(null);
        }
        updateNextState();
    };

    const onSubmit = () => {
        if (checkFilesComplete()) {
            // Combine user info with file URLs
            const updatedUserInfo = {
                ...userInfo,
                frontUrl: frontFile?.response?.url || '',
                backUrl: backFile?.response?.url || '',
                selfieUrl: selfieFile?.response?.url || '',
            };
            console.log(updatedUserInfo);
            onNext();
        } else {
            toast.error('请上传所有必要的证件照片');
        }
    };
    // const handFrontFile=async ({ file, onSuccess })=>{
    //     const uploadResult = await uploadHandler(file as File);

    // }
    const uploadHandler = async (file: File) => {
        try {
          const formData = new FormData();
          formData.append('file', file);
          const res = await fileImg(file);
          if(res.code==='0'){
            
          }else{
            toast.error(res.message);

          }
          
        } catch (error) {
            toast.error(String(error));
        }
      };
    return (
        <div className="flex-col" style={{ width: "67%" }}>

            <div className={`flex-y align-center mt-6`}>
                {/* 证件正面 */}
                <div className={`${styles.upload_content} flex-y-cc`}
                    style={{
                        ...uploadBgcStyle,
                        backgroundImage: `url(${'/images/userCenter/identity/frontage_day1.png'})`,
                    }}>
                        <Upload
                        name="frontImage"
                        // listType="picture-card"
                        className={styles.upload_box}
                        showUploadList={false}
                        beforeUpload={beforeUpload}
                        // onChange={handleFrontChange}
                        // customRequest={handFrontFile}
                        maxCount={1}
                        style={{width:'100%',height:'100%'}}
                    >
                    {!frontFile && (
                        <div className={`flex-y-cc`}
                        >
                            <div className={`${styles.upload_icon} flex-x algin-center`}>
                                <Iconify icon="solar:upload-linear" size={20} />
                                <p className={`font-14 font-w-400 ml-1`}>上传文件</p>

                            </div>
                            <div className={`font-16 font-w-500 ${styles.title_color}`}>证件正面</div>
                        </div>
                    )}
                    </Upload>
                </div>
                {/* </Upload> */}
                {/* </div> */}

                {/* 证件反面 */}
                <div className={`${styles.upload_content} flex-y-cc mt-2_5`}
                    style={{
                        ...uploadBgcStyle,
                        backgroundImage: `url(${'/images/userCenter/identity/back_day2.png'})`,
                    }}>
                    <Upload
                        // listType="picture-card"
                        className={styles.upload_box}
                        showUploadList={false}
                        beforeUpload={beforeUpload}
                        // onChange={handleBackChange}
                        maxCount={1}
                    >
                        {!backFile && (
                            <div className={` flex-y-cc`}>
                                 <div className={`${styles.upload_icon} flex-x algin-center`}>
                                <Iconify icon="solar:upload-linear" size={20} />
                                <p className={`font-14 font-w-400 ml-1`}>上传文件</p>

                            </div>
                                <div className={`font-16 font-w-500 ${styles.title_color}`}>证件反面</div>
                            </div>
                        )}
                    </Upload>

                </div>


                {/* 手持证件照 */}
                <div className={`${styles.upload_content} flex-y-cc mt-2_5`}
                    style={{
                        ...uploadBgcStyle,
                        backgroundImage: `url(${'/images/userCenter/identity/handcard_day3.png'})`,
                    }}>
                         <Upload
                        name="selfieImage"
                        // listType="picture-card"
                        className={styles.upload_box}
                        showUploadList={false}
                        beforeUpload={beforeUpload}
                        // onChange={handleSelfieChange}
                        maxCount={1}
                    >
                    {!selfieFile && (
                        <div className={` flex-y-cc`}>
                            <div className={`${styles.upload_icon} flex-x algin-center`}>
                                <Iconify icon="solar:upload-linear" size={20} />
                                <p className={`font-14 font-w-400 ml-1`}>上传文件</p>

                            </div>
                            <div className={`font-16 font-w-500 ${styles.title_color}`}>证件反面</div>
                        </div>
                    )}
                    </Upload>
                </div>
            </div>

            <ul className={`font-14 font-w-400 mt-5 ${styles.tip_color}`}>
                <li className="flex items-center mb-1">
                    <Iconify icon="emojione-monotone:small-blue-diamond" className={`${styles.error_icon} mr-2`} size={15} />
                    支持小于8M的JPG、JPEG或PNG格式图片。
                </li>
                <li className="flex items-center mb-1">
                    <Iconify icon="emojione-monotone:small-blue-diamond" className={`${styles.error_icon} mr-2`} size={15} />
                    证件照片要求清晰，不允许任何修改和遮挡，必须能看清人像、证件号和姓名。
                </li>
                <li className="flex items-center">
                    <Iconify icon="emojione-monotone:small-blue-diamond" className={`${styles.error_icon} mr-2`} size={15} />
                    照片需免冠，建议未化妆，手持证件人的五官清晰可鉴，完整漏出手臂。
                </li>
            </ul>

            <div className='mt-10 flex justify-between'>
                <button
                    className={`${styles.btn_style_prev} cancel_btn3`}
                    onClick={onPrev}
                >上一步</button>
                {!isNext ? (
                    <button
                        className={`${styles.btn_style_next} disabled_btn`}
                        disabled
                    >下一步</button>
                ) : (
                    <button
                        type='submit'
                        className={`default_btn ${styles.btn_style_next}`}
                        onClick={onSubmit}
                    >下一步</button>
                )}
            </div>
        </div>
    );
}

export default ResetPassword;