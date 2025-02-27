import React from 'react';
import UserCenterSidebar from './menu';
import { useRouter, NextRouter } from 'next/router';
import styles from "./styles/layout.module.css"

// 定义 UserCenterLayout 组件的属性类型
interface UserCenterLayoutProps {
    children: React.ReactNode; // children 属性表示组件包裹的子元素，类型为 React.ReactNode
}

const UserCenterLayout: React.FC<UserCenterLayoutProps> = ({ children }) => {
    // 使用 useRouter 钩子获取路由对象，并指定其类型为 NextRouter
    const router: NextRouter = useRouter();
    // console.log(router);
    

    return (
        <div className={`user-center-page flex ${styles.layout_container}`}>
            <UserCenterSidebar  />
            <div className={`${styles.content}`}>
                {children}
            </div>
        </div>
    );
};

export default UserCenterLayout;