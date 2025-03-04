import React from 'react';
import { withUserCenterLayout } from '@/components/UserCenterLayout/UserCenterLayout';
import styles from '../../styles/identity.module.css';
import { Iconify } from "@/components/icon"
import Image from 'next/image';
// 按钮配置接口
interface ButtonConfig {
    title: string;
    onok?: () => void;
    onbind?: () => void;
}

// 安全项配置接口
interface SafeListItem {
    title: string;
    type: string;
    desc: string;
    isBind?: boolean;
    bindValue: string;
    bindBtn?: ButtonConfig[];
    noBindBtn?: ButtonConfig[];
    icon: string;  // 可选的图标路径
}

const NoAuthentication: React.FC = () => {

    return (< >
        <div className={`${styles.identity_content} flex-1`}>
            <div className={`${styles.content_header} `}>
                <Image src="/images/userCenter/identity/icon_Identity.svg"
                    alt="identity" width={120} height={54}
                    className={`${styles.header_icon}`} />
                {/* 1.认证内容 */}
                <div className='flex-1 flex-col justify-center'>
                    {/* 认证状态 */}
                    <div className={`font-18 font-w-500 flex align-center`} >
                        <p>标准身份认证</p>
                        <div className='font-14  ml-2 flex-x align-center'>
                            <Iconify icon="mingcute:safety-certificate-line" className={`${styles.success_icon} mr-1`} size={20} />
                            <span className={`${styles.tip_color} font-14 font-w-500`}>已认证</span>
                        </div>
                    </div>
                    {/* 认证提示 */}
                    <div className={`font-14 font-w-400 mt-3 ${styles.tip_color}`} >
                        <Iconify icon="emojione-monotone:small-blue-diamond" className={`${styles.error_icon}`} size={20} />
                        已完成身份认证，开始您的货币之旅吧！
                    </div>
                </div>
                {/* 按钮 */}
                <div className={`${styles.btn_box} flex-col align-end justify-end`}>
                    <button type='button' className={`${styles.btn_style} default_btn`}>去认证</button>
                    {/* <button type='button' className={`${styles.btn_style} default_btn`}>审核中</button>
            <button type='button' className={`${styles.btn_style} disabled_btn`}>重新认证</button> */}
                </div>
            </div>
            {/* 2.认证权益 */}
            <div className='mt-6'>
                <div className={`font-18 font-w-500 flex align-center `} >
                    <Image src="/images/userCenter/identity/icon_account.svg" alt='' width={24} height={24} className='mr-1' />
                    <span>账户权益</span>
                </div>
                <ul className={`${styles.border_btm} mt-3`}>
                    <li className={`flex align-center justify-between font-14 ${styles.certified_box}`}>
                        <div className={` font-w-400 ${styles.tip_color}`}>加密货币提现</div>
                        <div className={` font-w-500`}>50K USDT每日</div>
                    </li>
                    <li className={`flex align-center justify-between font-14 ${styles.certified_box}`}>
                        <div className={` font-w-400 ${styles.tip_color}`}>加密货币充值</div>
                        <div className={` font-w-500`}>允许</div>
                    </li>
                    <li className={`flex align-center justify-between font-14 ${styles.certified_box}`}>
                        <div className={` font-w-400 ${styles.tip_color}`}>C2C交易</div>
                        <div className={` font-w-500`}>禁止</div>
                    </li>
                </ul>
                
            </div>
            <div className='mt-6'>
                <div className={`font-18 font-w-500 flex align-center `} >
                    <Image src="/images/userCenter/identity/icon_IDcard.svg" alt='' width={24} height={24} className='mr-1' />
                    <span>个人信息</span>
                </div>
                <ul className={`mt-3`}>
                    <li className={`flex align-center justify-between font-14 ${styles.certified_box}`}>
                        <div className={` font-w-400 ${styles.tip_color}`}>真实姓名</div>
                        <div className={` font-w-500`}>杰</div>
                    </li>
                    <li className={`flex align-center justify-between font-14 ${styles.certified_box}`}>
                        <div className={` font-w-400 ${styles.tip_color}`}>证件类型</div>
                        <div className={` font-w-500`}>护照</div>
                    </li>
                    <li className={`flex align-center justify-between font-14 ${styles.certified_box}`}>
                        <div className={` font-w-400 ${styles.tip_color}`}>国家</div>
                        <div className={` font-w-500`}>中国大陆</div>
                    </li>
                    <li className={`flex align-center justify-between font-14 ${styles.certified_box}`}>
                        <div className={` font-w-400 ${styles.tip_color}`}>证件号</div>
                        <div className={` font-w-500`}>12**********223</div>
                    </li>
                </ul>
                
            </div>
        </div>


    </>);
};

export default NoAuthentication;