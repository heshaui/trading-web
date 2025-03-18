import { Modal, ConfigProvider, Segmented, Upload, Button, Form } from "antd";
import type { ModalProps } from "antd/es/modal/interface";
import styles from "./styles/avatarUrl.module.css";
import Image from "next/image";
// import type { UploadFile, UploadProps } from 'antd';
import type { UploadProps } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
// import { API_MODULE_NAME } from '@/config/apiConfig';
// import { getToken } from '@/request/index';
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { fileImg } from "@/services/open";

import { updateUserCenter } from '@/services/userCenter';
import { Iconify } from "../icon";
import {encryptData} from '@/utils/encrypt'

type Props = {
    open: boolean;
    userId: number;
    onOk: (bool: boolean) => void;
    onCancel: () => void;
};

interface AvatarItem {
    id: number;
    src: string;
    alt: string;
    type: string;
}
const initAvatarList: AvatarItem[] = [
    {
        id: 1,
        src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar1.png',
        alt: 'avatar',
        type: 'male'
    },
    {
        id: 2,
        src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar2.png',
        alt: 'avatar',
        type: 'female'
    },
    {
        id: 3,
        src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar3.png',
        alt: 'avatar',
        type: 'male'
    },
    {
        id: 4,
        src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar4.png',
        alt: 'avatar',
        type: 'male'
    },
    {
        id: 5,
        src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar5.png',
        alt: 'avatar',
        type: 'female'
    },
    {
        id: 6,
        src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar6.png',
        alt: 'avatar',
        type: 'female'
    },
    {
        id: 7,
        src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar7.png',
        alt: 'avatar',
        type: 'male'
    },
    {
        id: 8,
        src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar8.png',
        alt: 'avatar',
        type: 'female'
    },
    {
        id: 9,
        src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar9.png',
        alt: 'avatar',
        type: 'male'
    },
    {
        id: 10,
        src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar10.png',
        alt: 'avatar',
        type: 'male'
    },
    {
        id: 11,
        src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar11.png',
        alt: 'avatar',
        type: 'female'
    },
    {
        id: 12,
        src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar12.png',
        alt: 'avatar',
        type: 'male'
    },
    {
        id: 13,
        src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar13.png',
        alt: 'avatar',
        type: 'female'
    },
    {
        id: 14,
        src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar14.png',
        alt: 'avatar',
        type: 'male'
    },
    {
        id: 15,
        src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar15.png',
        alt: 'avatar',
        type: 'male'
    }
]
function AvatarUrlModal({ open, onCancel, userId, onOk }: Props) {
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null); // 选中的头像
    const [selectedImages, setSelectedImages] = useState<string[]>([]); // 显示上传的图片内容
    const [imageItem, setImageItem] = useState(false); // 是否显示删除上传的图片
    const [selectedFile, setSelectedFile] = useState<File | null>(null); // 上传的图片文件
    const [fileUrl, setFileUrl] = useState<string>(''); // 上传的图片文件的URL
    const [siftAvatarList, setSiftAvatarList] = useState<AvatarItem[]>(initAvatarList); // 筛选后的头像列表
    const [form] = Form.useForm();
    // const BASE_URL = process.env.NEXT_PUBLIC_API_BASE;


    const handCancel = () => {
        onCancel();
    };

    const handOk = async () => {
        if ((!fileUrl) && (!selectedAvatar)) {
            toast.error('请选择或选择头像!');
            return;
        }
        
        try {
            let params = {};
            if (fileUrl) {
                // console.log(selectedFile);
                 params = {
                    userId: userId,
                    avatarUrl: fileUrl
                }
            } else if (selectedAvatar) {
                 params = {
                    userId: userId,
                    avatarUrl: selectedAvatar
                }
            }
        console.log(params,111);

            const encrypt=await encryptData(params)
            await updateUserCenterApi(encrypt)


        } catch (error) {
            toast.error(String(error));
        }
    };
    const updateUserCenterApi = async (params: any) => {
        try {
            const res = await updateUserCenter(params);
            if (res.code === '0') {
                toast.success('头像修改成功');
                onOk(true)
                onCancel()
            }
        } catch (error) {
            toast.error(String(error));
        }

    };
    const handleAvatarClick = (item: AvatarItem) => {
        if (item.src === selectedAvatar) {
            setSelectedAvatar(null);
        } else {
            setSelectedAvatar(item.src);
        }
    };

    const avatarTypeChange = (value: string) => {
        if (value === 'all') {
            setSiftAvatarList(initAvatarList);
        } else {
            setSiftAvatarList(initAvatarList.filter((item) => item.type === value));
        }
    };
    const isDayMode = () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('isDayMode') == 'true'
        }
    }

    const props: UploadProps = {
        // name: 'file',
        // action: `${BASE_URL}/${API_MODULE_NAME.AMBIT_OSS}/oss/img/file`,
        // headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': `${getToken()}`,
        //     'ambit-saas': process.env.NEXT_PUBLIC_AMBIT_SAAS || '',
        //     'sa-token': `${getToken()}`
        // },
        // listType: "picture-circle",
        showUploadList: false,
        maxCount: 1,
        beforeUpload: (file) => {
            const allowedTypes = ['image/jpg', 'image/png', 'image/gif']
            const isPNG = allowedTypes.includes(file.type);
            if (!isPNG) {
                toast.error(`${file.name} 不是正确的图片格式！`);
            }
            return isPNG || Upload.LIST_IGNORE;
        },
        // 自定义上传
        customRequest: async ({ file, onSuccess, onError }) => {
            // const uploadResult = await fileImg(file as File);
            // const uploadResult = await uploadHandler(file as File);
            try {
                const formData = new FormData();
                formData.append('file', file);
                // 检查文件类型
                if (!(file instanceof File)) {
                    toast.error('无效的文件类型');
                    return;
                }
                const res = await fileImg(file);
                if (res.code === '0') {
                    // onSuccess(res.data);
                    console.log(res.data);
                    setFileUrl(res.data.data);

                } else {
                    toast.error(res.message);
                }

            } catch (error) {
                toast.error(String(error));
            }
        },
        onChange(info) {
            if (info.file.status !== 'uploading') {
                handleUploadChange(info);
                // console.log('uploading', info.file, info.fileList);
            }
        },
    };
    // const uploadHandler = async (file: File) => {
    //     try {
    //         const formData = new FormData();
    //         formData.append('file', file);
    //         // 检查文件类型
    //         if (!(file instanceof File)) {
    //             toast.error('无效的文件类型');
    //             return;
    //         }
    //         const res = await fileImg(file);

    //     } catch (error) {
    //     }
    // };
    // 处理文件上传变化的函数
    const handleUploadChange = (info: any) => {
        const { fileList } = info;
        // 过滤出状态为 "done" 的文件（即上传成功的文件）
        const doneFiles = fileList.filter((file: any) => file.status === 'done');
        if (doneFiles.length > 0) {
            const file = doneFiles[0].originFileObj;
            setSelectedFile(file);
            // 获取这些文件的 URL
            const imageUrls = doneFiles.map((file: any) => {
                // 优先使用 response 中的 url，如果没有则使用文件的 originFileObj 的 URL
                return file.response?.url || URL.createObjectURL(file.originFileObj);
            });
            setSelectedImages(imageUrls);
        }
    }

    const handleDeleteImage = () => {
        // setSelectedImages(prevImages => {
        //     return prevImages.filter((_, i) => i !== index);
        // });
        setFileUrl('')
        setSelectedImages([])
    };
    const handleUpload = () => {
        form.validateFields(['file'])
            .then((values) => {
                console.log(values);
            }).catch((error) => {
                console.log(error);
            })
    }


    const ModalFooter: ModalProps["footer"] = () => (
        <div className="flex-x align-center justify-end">
            <button
                type="button"
                className={`${styles.modal_footerBtn} cancel_btn2 mr-5 font-14 font-w-500`}
                onClick={handCancel}
            >
                取消
            </button>
            <button
                type="button"
                className={`${styles.modal_footerBtn} default_btn`}
                onClick={handOk}
            >
                保存
            </button>
        </div>
    );

    return (
        <ConfigProvider
            theme={{
                components: {
                    Button: {
                        controlHeightLG: 50,
                        defaultActiveBorderColor: '#FF5F1F',
                        defaultActiveColor: '#FF5F1F',
                        defaultBg: 'transparent',
                        defaultHoverBorderColor: '#FF5F1F',
                        defaultHoverColor: '#FF5F1F',
                        defaultColor: '#FF5F1F',
                        defaultBorderColor: '#FF5F1F',
                    },
                    Segmented: {
                        trackBg: "var(--segmented-item-bgc)",
                        itemColor: "var(--text-color6)",
                        itemActiveBg: "var(--segmented-item-active-bg)",
                        itemSelectedBg: "var(--segmented-item-active-bg)",
                        itemHoverBg: "var(--segmented-item-active-bg)",
                        itemSelectedColor: "var(--cancel-color)",
                        itemHoverColor: "var(--cancel-color)",
                    },
                    Modal: {
                        contentBg: "var(--background5)",
                        footerBg: "var(--background5)",
                        headerBg: "var(--background5)",
                    }
                },
                token: {
                }
            }}
        >
            <Modal
                open={open}
                title={<p className={`${styles.title}`}>修改头像</p>}
                centered
                onCancel={handCancel}
                footer={ModalFooter}
                width={573}
                classNames={{
                    content: styles.modal_content,
                    body: styles.modal_body,
                    footer: styles.modal_footer,
                }}
            >
                <div className="flex-x flex-ai-center" style={{ width: "100%" }}>
                    <div className={`${styles.upload_box} flex-y-cc`}>
                        <div className={`${styles.upload_img_box} mb-4 relative`}
                            onMouseEnter={() => setImageItem(true)}
                            onMouseLeave={() => setImageItem(false)}
                        >
                            {!fileUrl ? <Image
                                src={isDayMode() ? '/images/userCenter/userSettings/up.png' : '/images/userCenter/userSettings/up_night.png'}
                                alt={`Selected Image `}
                                width={88}
                                height={88}
                                style={{ borderRadius: '50%' }}
                            /> :
                                <Image
                                    src={fileUrl}
                                    alt={`Selected Image`}
                                    width={88}
                                    height={88}
                                    style={{ borderRadius: '50%',width:'88px',height:'88px' }}
                                />
                            }
                            {(fileUrl) && (
                                <div className={`${styles.overlay} absolute-center cursor-pointer`}>
                                    <Iconify icon="fluent:delete-12-filled"
                                        size={24}
                                        className={`${styles.error_icon}`}
                                        onClick={() => handleDeleteImage()} />
                                </div>
                            )}

                        </div>
                        {/* <Form
                            form={form}
                        >
                            <Form.Item name="file" noStyle> */}
                        <Upload {...props}>
                            <Button type="default" className={`${styles.modal_footerBtn}`} icon={<UploadOutlined />}>
                                上传
                            </Button>
                        </Upload>
                        {/* </Form.Item>
                        </Form> */}
                        <p className={`${styles.tip_color} font-12 font-w-400 mt-2_5`}>图片头像仅支持jpg、png、gif格式</p>
                    </div>
                    <div className={`${styles.avatar_icon} flex-1`}>
                        <Segmented<string>
                            options={[
                                {
                                    label: <p style={{ minWidth: 55 }}>全部</p>,
                                    value: 'all'
                                },
                                {
                                    label: <p style={{ minWidth: 55 }}>男</p>,
                                    value: 'male'
                                },
                                {
                                    label: <p style={{ minWidth: 55 }}>女</p>,
                                    value: 'female'
                                }
                            ]}
                            defaultValue="all"
                            onChange={avatarTypeChange}
                            className={`${styles.avatar_icon_box}`}
                        />
                        <ul className={`${styles.avatar_icon_box} flex-x flex-wrap`}>
                            {siftAvatarList.map((item) => (
                                <li
                                    className={`${styles.avatar_icon_item} mt-2_5 ${selectedAvatar === item.src ? styles.selected : ''}`}
                                    key={item.id} onClick={() => handleAvatarClick(item)}>
                                    <Image src={item.src} className={`${styles.avatar_icon_img}`} alt={item.alt} width={58} height={58} />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </Modal>
        </ConfigProvider>
    );
}

export default AvatarUrlModal;