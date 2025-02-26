import React from 'react';
import Link from 'next/link';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import { Iconify } from '@/components/icon'
import { useRouter } from 'next/router';

type MenuItem = Required<MenuProps>['items'][number];
const UserCenterSidebar = () => {
    const router = useRouter();
    const items: MenuItem[] = [
        {
            key: '/userCenter',
            icon: <Iconify icon="pixelarticons:dashboard" />,
            label: '总览',
            onClick: () => router.push('/userCenter')
        },
        {
            key: '/userCenter/safeCenter',
            icon: <Iconify icon="mingcute:safety-certificate-line" />,
            label: '安全中心',
            onClick: () => router.push('/userCenter/safeCenter')
        },
        {
            key: '/userCenter/identity',
            icon: <Iconify icon="mingcute:idcard-line" />,
            label: '身份认证',
            onClick: () => router.push('/userCenter/identity')
        },
        {
            key: '/userCenter/userSettings',
            icon: <Iconify icon="icon-park-outline:setting-two" />,
            label: '用户设置',
            onClick: () => router.push('/userCenter/userSettings')
        },
        // mingcute:invite-line //邀请
        // icon-park:api-app //api
        // mingcute:location-line //地址
    ]
    return (<>
        {/* <nav className="sidebar">
            <ul>
                <li><Link href="/userCenter">总揽</Link></li>
                <li><Link href="/userCenter/safeCenter">安全中心</Link></li>
                <li><Link href="/userCenter/identity">身份认证</Link></li>
                <li><Link href="/userCenter/userSettings">用户设置</Link></li>
            </ul>
            
        </nav> */}
         <Menu
            selectedKeys={[router.pathname]}
            mode="inline"
            items={items}
            style={{ width: '20%', height: '85vh' }}
        />
    </>
    );
};

export default UserCenterSidebar;