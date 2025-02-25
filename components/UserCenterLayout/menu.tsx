import React from 'react';
import Link from 'next/link';

const UserCenterSidebar = () => {
    return (
        <nav className="sidebar">
            <ul>
                <li><Link href="/userCenter/overview">总揽</Link></li>
                <li><Link href="/userCenter/safeCenter">安全中心</Link></li>
                <li><Link href="/userCenter/identity">身份认证</Link></li>
                <li><Link href="/userCenter/userSettings">用户设置</Link></li>
                {/* 可以添加其他侧边栏菜单项 */}
            </ul>
        </nav>
    );
};

export default UserCenterSidebar;