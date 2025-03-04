import React from 'react';
import { withUserCenterLayout } from '@/components/UserCenterLayout/UserCenterLayout';
import styles from './styles/safe.module.css';
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
    isBind: boolean;
    bindValue: string;
    noBindValue: string;
    bindBtn: ButtonConfig[];
    noBindBtn: ButtonConfig[];
    icon: string;  // 可选的图标路径
}
// 安全日志项接口
interface SecurityLogItem {
    title: string;
    desc: string;
    tip: string;
    value: string;
    btntext: string;
    icon: string;
    type: string;
    button: () => void;
}
const SafeCenter: React.FC = () => {
    const baseSafeList: SafeListItem[] = [
        {
            title: "谷歌验证器(推荐)",
            type: "google",
            desc: "用于登录、提现、修改安全设置等安全验证。若经常收不到短信验证码，建议绑定谷歌验证器。",
            isBind: true,
            bindValue: "启用",
            noBindValue: "未绑定",
            icon: "/images/userCenter/safe/icon_google.svg",
            bindBtn: [{
                title: "解绑",
                onok: () => { }
            }
            ],
            noBindBtn: [{
                title: "绑定",
                onbind: () => { }
            }]
        },
        {
            title: "手机验证",
            type: "phone",
            desc: "短信验证码将保护您的账户与交易安全。修改绑定手机号后，支付、提现等功能将禁用24小时。",
            isBind: true,
            bindValue: "187***8523",
            noBindValue: "未绑定",
            icon: "/images/userCenter/safe/icon_phone.svg",
            bindBtn: [{
                title: "修改",
                onok: () => { }
            },
            {
                title: "关闭验证",
                onok: () => { }
            }
            ],
            noBindBtn: [{
                title: "绑定",
                onbind: () => { }
            }]
        },
        {
            title: "邮箱验证",
            type: "email",
            desc: "邮箱验证码将保护您的账户与交易安全。修改绑定邮箱后，支付、提现等功能将禁用24小时。",
            isBind: false,
            bindValue: "11****33@qq.com",
            noBindValue: "未绑定",
            icon: "/images/userCenter/safe/icon_email.svg",
            bindBtn: [{
                title: "修改",
                onok: () => { }
            }
            ],
            noBindBtn: [{
                title: "绑定",
                onbind: () => { }
            }]
        },
        {
            title: "登录密码",
            type: "password",
            desc: "重置时自动退出当前账号",
            isBind: false,
            bindValue: "已设置",
            noBindValue: "未设置",
            icon: "/images/userCenter/safe/icon_password.svg",
            bindBtn: [{
                title: "修改",
                onok: () => { }
            }
            ],
            noBindBtn: [{
                title: "设置",
                onbind: () => { }
            }]
        },
    ]
    const securityLogList: SecurityLogItem[] = [
        {
            title: "安全设备",
            desc: "管理已授权允许登录的设备。",
            tip: "授权设备数：",
            value: "3",
            btntext: "管理",
            icon: "/images/userCenter/safe/equipment.svg",
            type: "equipment",
            button: () => { }
        },
        {
            title: "安全日志",
            desc: "用于登录等IP地址安全。",
            tip: "最近登录IP地址：",
            value: "58.152.*.*",
            btntext: "查看",
            icon: "/images/userCenter/safe/icon_security_og.svg",
            type: "log",
            button: () => { }
        }
    ]
    return (<div className={`${styles.safe_page}`} >
        <div >
            <h2 className={`font-w-500 font-20`}>安全中心</h2>
        </div>
        {/* safe box*/}
        <div className={`${styles.card_bgc} mt-3 `}>
            <div className={`flex-row justify-between font-18 font-w-500 pl-6 mb-4`} >基础安全
            </div>
            <ul className={`${styles.content_ul} ${styles.border_bottom} mt-4 `} >
                {baseSafeList.map((item: SafeListItem) => (
                    <li className={`flex-row align-center justify-between flex-wrap`} key={item.type}>
                        {/* 绑定类型 bind type*/}
                        <div className={`flex-row align-center`}>
                            <Image src={item.icon}
                                alt="safe_device" width={28} height={28}
                                className={`${styles.svgIcon}`}
                            />
                            <p className='flex-y font-16 font-w-500'>
                                {item.title}
                                <span className={`${styles.tip_color} font-12 font-w-400 mt-1`}>
                                    {item.desc}
                                </span>
                            </p>

                        </div>
                        {/* 绑定状态 bind status*/}
                        <div className={`flex-row align-center justify-between ${styles.log_box} `}>

                            <div className='flex-y font-16 font-w-500 flex-1'>
                                {item.isBind ? (
                                    <div className={`flex-row align-center`}>
                                        <Image src="/images/userCenter/safe/check.svg"
                                            alt="safe_device" width={20} height={20}
                                            className={`${styles.svgIcon}`}
                                        />
                                        <span>{item.bindValue}</span>
                                    </div>

                                )
                                    :
                                    (
                                        <div className={`flex-row align-center`}>
                                            <Image src="/images/userCenter/safe/close.svg"
                                                alt="safe_device" width={20} height={20}
                                                className={`${styles.svgIcon}`}
                                            />
                                            <span>{item.noBindValue}</span>
                                        </div>
                                    )}
                            </div>
                            {/* 按钮 button */}
                            <div className={`flex-row align-center justify-end flex-1 ml-6`} >
                                {item.isBind ?
                                    (item.bindBtn.map((btn: ButtonConfig,index:number) => (
                                        <button className={`${styles.btn_style} btn-color-default ml-2`} key={index}>{btn.title}</button>
                                    )))
                                    :
                                    (item.noBindBtn.map((btn: ButtonConfig,index:number) => (
                                        <button className={`${styles.btn_style} btn-color-default ml-2`} key={index}>{btn.title}</button>
                                    )))
                                }
                            </div>
                        </div>

                    </li>
                ))}
            </ul>
            <div className={`flex-row justify-between font-18 font-w-500 pl-6 pt-6 mb-4`} >安全日志
            </div>
            <ul className={`${styles.content_ul}`}>
                {securityLogList.map((item: SecurityLogItem) => (
                    <li className={`flex-row align-center justify-between flex-wrap`} key={item.type}>
                        <div className={`flex-row align-center`}>
                            <Image src={item.icon}
                                alt="safe_device" width={28} height={28}
                                className={`${styles.svgIcon}`}
                            />
                            <p className='flex-y font-16 font-w-500'>
                                {item.title}
                                <span className={`${styles.tip_color} font-12 font-w-400 mt-1`}>
                                    {item.desc}
                                </span>
                            </p>

                        </div>
                        <div className={`flex-row align-center justify-between ${styles.log_box}`}>

                            <p className={`flex-y font-16 font-w-500 ${styles.log_tip}`}>
                                {item.tip}
                                <span className={`${styles.tip_color} font-12 font-w-400 mt-1 `}>
                                    {item.value}
                                </span>
                            </p>

                            <button className={`${styles.btn_style} btn-color-default`}>{item.btntext}</button>
                        </div>

                    </li>
                ))}
            </ul>
        </div>

    </div>);
};

export default withUserCenterLayout(SafeCenter);