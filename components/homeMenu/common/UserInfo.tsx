import styles from '@/styles/components/HomeMenu.module.css';
import { Dropdown, Space, Button, Avatar, ConfigProvider, Row, Col, Drawer, Empty, Tabs, TabsProps, Badge } from 'antd';
import { MenuProps } from 'antd';
import MenuItemLabel from '../HomeMenuLabel';import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
// import dayjs from 'dayjs';
// import { LOCAL_STORAGE_KEY } from "@/config/apiConfig";
import { useThemeMode } from '@/hooks/useThemeMode'; // 导入 useThemeMode 获取当前主题状态
import { useAuth } from '@/context/AuthContext';
import { getLoginInfo } from '@/services/overview';
import { encryptString } from '@/utils/encrypt';
import { toast } from 'sonner';
import { LOCAL_STORAGE_KEY } from '@/config/apiConfig';
export default function UserInfoIcon() {
    // 路由
    const router = useRouter();

    // t - 多语言
    const { t, i18n } = useTranslation('home_menu');
    // 获取主题状态
    const { isDayMode } = useThemeMode();
    // 使用 useAuth 钩子获取登录状态
    const { isLoggedIn, logout } = useAuth();
    // 退出登录
    const handleLogout = () => {
        // store.clearUserToken();  // 清除 token
        // setIsLogin(false);
        // // 触发自定义事件
        // window.dispatchEvent(new Event('loginStatusChanged'));
        // router.push('/login');
        logout();
    };
    const userItems = [
        {
            key: '1',
            type: 'item',
            label: (
                <MenuItemLabel
                    src={isDayMode
                        ? '/images/home_menu/icon_layout_line.png'
                        : '/images/home_menu/icon_layout_line_dark.png'}
                    h5Text="总览"
                    onClick={() => {
                        router.push('/userCenter')
                    }}
                />
            ),
        },
        {
            key: '3',
            type: 'item',
            label: (
                <MenuItemLabel
                    src={isDayMode
                        ? '/images/home_menu/icon_safety_certificate_line.png'
                        : '/images/home_menu/icon_safety_certificate_line_dark.png'}
                    h5Text="安全中心"
                    onClick={() => {
                        router.push('/userCenter/safeCenter')
                    }}
                />
            ),
        },
        {
            key: '4',
            type: 'item',
            label: (
                <MenuItemLabel
                    src={isDayMode
                        ? '/images/home_menu/icon_IDcard_line.png'
                        : '/images/home_menu/icon_IDcard_line_dark.png'}
                    h5Text="身份认证"
                    onClick={() => {
                        router.push('/userCenter/identity')
                    }}
                />
            ),
        },
        {
            key: '5',
            type: 'item',
            label: (
                <MenuItemLabel
                    src={isDayMode
                        ? '/images/home_menu/icon_user_day.png'
                        : '/images/home_menu/icon_user_dark2.png'}
                    h5Text="邀请好友"
                    onClick={() => {
                        router.push('/invite')
                    }}
                />
            ),
        },
        {
            key: '2',
            type: 'item',
            label: (
                <MenuItemLabel
                    src={isDayMode
                        ? '/images/home_menu/icon_setting_day.png'
                        : '/images/home_menu/icon_setting_dark.png'}
                    h5Text="设置"
                    onClick={() => {
                        router.push('/userCenter/userSettings')
                    }}
                />
            ),
        },
        // {
        //     key: '5',
        //     type: 'item',
        //     label: (
        //         <MenuItemLabel 
        //             src={isDayMode 
        //                 ? '/images/home_menu/icon_world.png' 
        //                 : '/images/home_menu/icon_world_dark.png'} 
        //             h5Text="国家/地区" 
        //         />
        //     ),
        // },
        // {
        //     key: '6',
        //     type: 'item',
        //     label: (
        //         <MenuItemLabel 
        //             src={isDayMode 
        //                 ? '/images/home_menu/icon_settings.png' 
        //                 : '/images/home_menu/icon_settings_dark.png'} 
        //             h5Text="偏好设置" 
        //         />
        //     ),
        // },
        // {
        //     key: '7',
        //     type: 'item',
        //     label: (
        //         <MenuItemLabel 
        //             src={isDayMode 
        //                 ? '/images/home_menu/icon_sub-account.png' 
        //                 : '/images/home_menu/icon_sub-account_dark.png'} 
        //             h5Text="子账户" 
        //         />
        //     ),
        // },
        // {
        //     key: '8',
        //     type: 'item',
        //     label: (
        //         <MenuItemLabel 
        //             src={isDayMode 
        //                 ? '/images/home_menu/icon_API.png' 
        //                 : '/images/home_menu/icon_API_dark.png'} 
        //             h5Text="API" 
        //         />
        //     ),
        // },
        // {
        //     key: '9',
        //     type: 'item',
        //     label: (
        //         <MenuItemLabel 
        //             src={isDayMode 
        //                 ? '/images/home_menu/icon_Third party authorization.png' 
        //                 : '/images/home_menu/icon_Third party authorization_dark.png'} 
        //             h5Text="第三方授权管理" 
        //         />
        //     ),
        // },
        {
            key: '10',
            type: 'divider',
            label: '',
        },
        {
            key: '11',
            type: 'item',
            label: (
                <MenuItemLabel
                    src={isDayMode
                        ? '/images/home_menu/icon_exit.png'
                        // : '/images/home_menu/icon_exit_dark.png'} 
                        : '/images/home_menu/icon_exit_dark.png'}
                    h5Text="退出登录"
                    onClick={() => handleLogout()}
                />
            ),
        },
    ];
    const [userInfo, setUserInfo] = useState<any>({});
    const userInfoOpenChange = async (open: boolean) => {
        if(open){
            if(typeof window !== 'undefined'){
                const userInfo = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY.USER_INFO) || '{}')
                setUserInfo(userInfo)
            }
        }
        // const res = await getLoginInfo()
        // if (res.code === "0") {
        //     setUserInfo(res.data)
        // } else {
        //     toast.error(res.message)
        // }
    }
    // nav***@gmail.com
    const userItemsAll = [
        {
            key: '1',
            type: 'group',
            label: (
                <MenuItemLabel src={userInfo.avatarUrl ? userInfo.avatarUrl : isDayMode ? '/images/home_menu/Avatar.png' : '/images/home_menu/Avatar_night.png'}
                    h5Text={userInfo.registerAccount ? encryptString(userInfo.registerAccount) : '--'}
                    spanText={`UID：${userInfo.userId ? userInfo.userId : '--'}`}
                    nickName={`${t('overview.nickname')}：${userInfo.nickname ? userInfo.nickname : `IMUSER-${userInfo.userId || '--'}`}`} level='V0' />
            ),
        },
        {
            key: '2',
            type: 'group',
            label: (
                <MenuItemLabel myWords_1='近30天交易量' myWords_2='0.00' myWords_3='USD' h5Text="切换账户" isUser />
            ),
        },
        {
            key: '3',
            type: 'divider',
            label: '',
        },
        {
            key: '4',
            type: 'group',
            label: (
                <MenuItemLabel items={userItems} isUserList />
            ),
        },
    ];
    return (
        <>
            <Dropdown
                menu={{
                    items: userItemsAll as MenuProps['items'],
                    triggerSubMenuAction: 'click',
                }}
                placement="bottomLeft"
                trigger={['click']}
                overlayStyle={{ top: '80px', maxWidth: '240px', minWidth: '240px' }}
                overlayClassName='customUserAllMenu'
                onOpenChange={userInfoOpenChange}
            >
                <Space>
                    <Image
                        onClick={(e) => e.preventDefault()}
                        src="/images/home_menu/icon_user_line.png"
                        className={styles.userCursor}
                        alt="avatar"
                        width={20}  // 必须指定宽度
                        height={20} // 必须指定高度
                    />
                </Space>
            </Dropdown>
        </>
    )
}
