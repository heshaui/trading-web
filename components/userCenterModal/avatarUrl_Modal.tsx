import { Modal, ConfigProvider, Segmented, Upload, Button } from "antd";
import type { ModalProps } from "antd/es/modal/interface";
import styles from "./styles/avatarUrl.module.css";
import Image from "next/image";
import type { UploadFile, UploadProps } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { API_MODULE_NAME } from '@/config/apiConfig';
import { getToken } from '@/request/index';
import { useState } from "react";
import { toast } from "sonner";
import { fileImg } from "@/services/open";
import { updateUserCenter } from '@/services/userCenter';

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

function avatarUrlModal({ open, onCancel, userId, onOk }: Props) {
   
    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE;
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

    const [siftAvatarList, setSiftAvatarList] = useState<AvatarItem[]>(initAvatarList);
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

    const handCancel = () => {
        onCancel();
    };

    const handOk = async () => {
        if(!selectedAvatar){
            toast.error('请选择或选择头像!');
            return;
        }
        const params = {
            userId: userId,
            avatarUrl: selectedAvatar
        }

        try {
            const res = await updateUserCenter(params);
            if(res.code === '0'){
                toast.success('头像修改成功');
                onOk(true)
                onCancel()
            }else{
                toast.error(res.msg);
            }

        } catch (error) {
            toast.error(String(error));
        }
    };

    const handleAvatarClick = (item: AvatarItem) => {
        setSelectedAvatar(item.src);
    };

    const avatarTypeChange = (value: string) => {
        if (value === 'all') {
            setSiftAvatarList(initAvatarList);
        } else {
            setSiftAvatarList(initAvatarList.filter((item) => item.type === value));
        }
    };

    const props: UploadProps = {
        name: 'file',
        action: `${BASE_URL}/${API_MODULE_NAME.AMBIT_OSS}/oss/img/file`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${getToken()}`,
            'ambit-saas': process.env.NEXT_PUBLIC_AMBIT_SAAS || '',
            'sa-token': `${getToken()}`
        },
        listType: "picture-circle",
        maxCount: 1,
        onChange(info) {
            if (info.file.status !== 'uploading') {
                console.log('uploading', info.file, info.fileList);
            }
            if (info.file.status === 'done') {
                console.log('done', info.file.name);
            } else if (info.file.status === 'error') {
                console.log('error', info.file.name);
            }
        },
    };

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
                    Modal:{
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
                    <div className={`${styles.upload_box}`}>
                        <Upload {...props}>
                            <Button type="default" className={`${styles.modal_footerBtn}`} icon={<UploadOutlined />}>
                                上传
                            </Button>
                        </Upload>
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

export default avatarUrlModal;