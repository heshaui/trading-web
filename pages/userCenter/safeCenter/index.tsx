import React from 'react';
import { withUserCenterLayout } from '@/components/sidebarLayout/UserCenterLayout/useUserCenterLayout';
import styles from '../styles/safe.module.css';
// import { Iconify } from "@/components/icon"
import Image from 'next/image';
import { getSafeCenter, getPhoneClose } from "@/services/safeCenter"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useRouter } from 'next/router';
import { Skeleton } from 'antd'
import { encryptString, encryptData } from '@/utils/encrypt'
import SetPhoneModal from '@/components/safeCenterModal/setPhone_Modal'
import SetMailModal from '@/components/safeCenterModal/setMail_Modal'
import CheckModal from '@/components/safeCenterModal/change_check'
// import SafeModal from '@/components/safeCenterModal/safe_Modal';
import SetLockModal from '@/components/safeCenterModal/setLock_Modal';
import MailSafeModal from '@/components/safeCenterModal/mailSafe_Modal';
import PhoneSafeModal from '@/components/safeCenterModal/phoneSafe_Modal';
import LockSafeModal from '@/components/safeCenterModal/lockSafe_Modal';
import UnbindGoogleModal from '@/components/safeCenterModal/unbindGoogle_Modal';
import BindGoogleModal from '@/components/safeCenterModal/bindGoogle_Modal';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { LOCAL_STORAGE_KEY } from '@/config/apiConfig';
import appStore from "@/store"
// 按钮配置接口
interface ButtonConfig {
    title: string;
    key: string;
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
interface acountType {
    countryCode?: string;
    email?: string;
    phone?: string;
    type?: string;
}
interface SafeDataType {
    phone?: string;
    email?: string;
    countryCode?: string;
    googleCode?: boolean;
    password?: boolean;
    deviceNos?: string;
    recentIp?: string;
    userId?: string;
    type?: string;
}
// 手机
//  -关闭-1确认弹窗-2安全验证
//  -修改-1确认弹窗-2安全验证-3添加/修改手机号
//  -绑定-1确认弹窗-2添加/修改手机号

// 邮箱
//  -修改-1确认弹窗-2安全验证-3添加/修改邮箱
//  -绑定-1确认弹窗-2添加/修改邮箱



const SafeCenter: React.FC = () => {
    const [safeData, setSafeData] = useState<SafeDataType>({})
    const [phoneModalOpen, setPhoneModalOpen] = useState(false) // 手机修改/设置弹窗
    const [phoneType, setPhoneType] = useState('')
    const [mailModalOpen, setMailModalOpen] = useState(false) // 邮箱修改/设置弹窗
    const [mailType, setMailType] = useState('')
    const [lockModalOpen, setLockModalOpen] = useState(false) // 密码修改/设置弹窗
    const [lockType, setLockType] = useState('')
    const [checkModalOpen, setCheckModalOpen] = useState(false)
    const [checkType, setCheckType] = useState('')
    const [safeModalOpen, setSafeModalOpen] = useState(false)
    const [safeType, setSafeType] = useState('')
    const [lockSafeModalOpen, setLockSafeModalOpen] = useState(false) // 密码修改-安全验证
    const [lockSafeType, setLockSafeType] = useState('')
    // const [safeAccount, setSafeAccount] = useState<SafeDataType>({})
    const [mailSafeModalOpen, setMailSafeModalOpen] = useState(false)
    const [phoneSafeModalOpen, setPhoneSafeModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loadingSkeleton, setLoadingSkeleton] = useState(true)
    const [unbindGoogleModalOpen, setUnbindGoogleModalOpen] = useState(false)
    const [BindGoogleModalOpen, setBindGoogleModalOpen] = useState(false)
    const router = useRouter();
    const { t } = useTranslation(['userCenter']);
    const kvConfigKey=appStore.getKvConfig('out_money')
 const langKey = appStore.getLang();
    const initBaseSafeList: SafeListItem[] = [
        {
            title: t('security.googleAuth'),
            type: "googleCode",
            /* 用于登录、提现、修改安全设置等安全验证。若经常收不到短信验证码，建议绑定谷歌验证器。 */
            desc: t('security.googleAuthDesc'),
            isBind: false,
            /* 启用 */
            bindValue: t('security.enabled'),
            /* 未绑定 */
            noBindValue: t('security.notBound'),
            icon: "/images/userCenter/safe/icon_google.svg",
            bindBtn: [{
                /* 解绑 */
                title: t('security.unbind'),
                onok: () => {
                    setCheckModalOpen(true)
                    setCheckType('4')
                },
                key: 'close'
            },
            {
                /* 已启用 */
                title: t('security.enabled_status'),
                onok: () => {},
                key: 'open'
            }],
            noBindBtn: [{
                /* 绑定 */
                title: t('security.bind'),
                onbind: () => {
                    setBindGoogleModalOpen(true)
                },
                key: 'bind'
            }]
        },
        {
            /* 手机验证 */
            title: t('security.phoneAuth'),
            type: "phone",
            /* 短信验证码将保护您的账户与交易安全。修改绑定手机号后，支付、提现等功能将禁用24小时。 */
            desc: t('security.phoneAuthDesc2', {time:kvConfigKey||24}),
            isBind: false,
            bindValue: "--",
            /* 未绑定 */
            noBindValue: t('security.notBound'),
            icon: "/images/userCenter/safe/icon_phone.svg",
            bindBtn: [{
                /* 修改 */
                title: t('security.modify'),
                onok: () => {
                    setCheckModalOpen(true)
                    setCheckType('0')
                },
                key: 'change'
            },
            {
                /* 关闭验证 */
                title: t('security.closeVerify'),
                onok: () => {
                    setCheckModalOpen(true)
                    setCheckType('1')
                },
                key: 'close'
            }],
            noBindBtn: [{
                /* 绑定 */
                title: t('security.bind'),
                onbind: () => {
                    setPhoneModalOpen(true)
                    setPhoneType('set')
                },
                key: 'bind'
            }]
        },
        {
            /* 邮箱验证 */
            title: t('security.emailAuth'),
            type: "email",
            /* 邮箱验证码将保护您的账户与交易安全。修改绑定邮箱后，支付、提现等功能将禁用24小时。 */
            desc: t('security.emailAuthDesc2', {time:kvConfigKey||24}),
            isBind: false,
            bindValue: "--",
            /* 未绑定 */
            noBindValue: t('security.notBound'),
            icon: "/images/userCenter/safe/icon_email.svg",
            bindBtn: [{
                /* 修改 */
                title: t('security.modify'),
                onok: () => {
                    setCheckModalOpen(true)
                    setCheckType('2')
                },
                key: 'change'
            }],
            noBindBtn: [{
                /* 绑定 */
                title: t('security.bind'),
                onbind: () => {
                    setMailModalOpen(true)
                    setMailType('set')
                    // setSafeAccount({
                    //     ...safeData,
                    //     type: safeData?.email ? 'email' : 'phone',
                    // })
                },
                key: 'bind'
            }]
        },
        {
            /* 登录密码 */
            title: t('security.loginPassword'),
            type: "password",
            /* 重置时自动退出当前账号 */
            desc: t('security.loginPasswordDesc'),
            isBind: false,
            /* 已设置 */
            bindValue: t('security.set'),
            /* 未设置 */
            noBindValue: t('security.notSet'),
            icon: "/images/userCenter/safe/icon_password.svg",
            bindBtn: [{
                /* 修改 */
                title: t('security.modify'),
                onok: () => {
                    setCheckModalOpen(true)
                    setCheckType('3')
                },
                key: 'change'
            }],
            noBindBtn: [{
                /* 设置 */
                title: t('security.setAction'),
                onbind: () => {
                    setCheckModalOpen(true)
                    setCheckType('5')
                    // setSafeAccount({
                    //     ...safeData,
                    //     type: safeData?.email ? 'email' : 'phone',
                    // })
                },
                key: 'bind'
            }]
        }
    ]
    const initSecurityLogList: SecurityLogItem[] = [
        {
            /* 安全设备 */
            title: t('security.securityDevice'),
            /* 管理已授权允许登录的设备。 */
            desc: t('security.securityDeviceDesc'),
            /* 授权设备数： */
            tip: t('security.deviceCount'),
            value: "--",
            /* 管理 */
            btntext: t('security.manage'),
            icon: "/images/userCenter/safe/equipment.svg",
            type: "deviceNos",
            button: () => {
                router.push(`/userCenter/safeCenter/equipment`)
            }
        },
        {
            /* 安全日志 */
            title: t('security.securityLog'),
            /* 用于登录等IP地址安全。 */
            desc: t('security.securityLogDesc'),
            /* 最近登录IP地址： */
            tip: t('security.lastLoginIp'),
            value: "--",
            /* 查看 */
            btntext: t('security.view'),
            icon: "/images/userCenter/safe/icon_security_og.svg",
            type: "recentIp",
            button: () => {
                if (!safeData) return toast.warning('loading...')
                router.push(`/userCenter/safeCenter/safe_log`)
            }
        }
    ]
    const [baseSafeList, setBaseSafeList] = useState<SafeListItem[]>(initBaseSafeList)
    const [securityLogList, setSecurityLogList] = useState<SecurityLogItem[]>(initSecurityLogList)
    // 确认弹窗后续操作
    const handCheckModal = async (type: string) => {
        // 0:修改手机号 1:关闭手机验证 2:修改邮箱 3:设置/修改密码 4:关闭谷歌验证 5:设置密码
        if (type.toString() === '0') {
            // 手机修改-2验证安全弹窗
            // setSafeModalOpen(true)
            setPhoneSafeModalOpen(true)
            setSafeType('0')
            // setSafeAccount({
            //     ...safeData,
            //     type: safeData?.phone ? 'phone' : 'email',
            //     // phone: safeData?.phone || '',
            //     // countryCode: safeData?.countryCode || ''
            // })
        } else if (type.toString() === '1') {
            // 关闭手机-2安全验证弹窗
            // setSafeModalOpen(true)
            setPhoneSafeModalOpen(true)
            setSafeType('1')
            // setSafeAccount({
            //     ...safeData,
            //     type: safeData?.phone ? 'phone' : 'email',
            //     // phone: safeData?.phone || '',
            //     // countryCode: safeData?.countryCode || ''
            // })
        }
        else if (type.toString() === '2') {
            // 修改邮箱-2验证安全弹窗
            // setSafeModalOpen(true)
            setMailSafeModalOpen(true)
            setSafeType('2')
            // setSafeAccount({
            //     ...safeData,
            //     type: safeData?.email ? 'email' : safeData?.phone ? 'phone' : '',
            // })
            // setMailModalOpen(true)
            // setMailType('change')

        } else if (type.toString() === '3'||type.toString() === '5') {
            // 修改密码-2验证安全弹窗
            // setSafeModalOpen(true)
            setLockSafeModalOpen(true)
            setSafeType('3')
            // setSafeAccount({
            //     ...safeData,
            //     type: safeData?.email ? 'email' : 'phone',
            // })

        } else if (type.toString() === '4') {
            setUnbindGoogleModalOpen(true)
            // setSafeAccount({
            //     ...safeData,
            //     type: safeData?.email ? 'email' : 'phone',
            // })
        }
    }
    // 安全校验完毕
    const handsvcOk = async (type: string) => {
        // 0:修改手机号 1:关闭手机验证 2:修改邮箱
        if (type === '0') {
            // 手机修改-3添加/修改手机号弹窗
            setPhoneModalOpen(true)
            setPhoneType('change')
        } else if (type === '1') {
            // 手机关闭-2关闭接口
            await handPhoneClose()
        }
        else if (type === '2') {
            // 邮箱修改-3修改邮箱弹窗
            setMailModalOpen(true)
            setMailType('change')
        } else if (type === '3') {
            // 密码修改-3添加/修改密码弹窗
            setLockModalOpen(true)
            setLockType('change')
        }
    }
    // 关闭手机
    const handPhoneClose = async () => {
        try {
            const dataInfo = {
                isPhoneAuth: 0,
                type:3,
                platformType:'Web'
            }
            const dataEncrypt = await encryptData(dataInfo)
            const res = await getPhoneClose(dataEncrypt)
            if (res.code === '0') {
                toast.success(res.message)
                await getSafeCenterData()
            } else {
                toast.error(res.message)
            }
        } catch (error) {
            toast.error(String(error))
        }
    }
    // 检查安全验证方式的数量
    const checkMethodsCount = (data: SafeDataType) => {
        let count = 0;
        if (data.phone) count++;
        if (data.email) count++;
        if (data.googleCode) count++;
        return count;
    }
    // 获取安全中心数据
    const getSafeCenterData = async () => {
        setLoading(true)
        try {
            const res = await getSafeCenter()
            const { code, data } = res
            if (code === '0') {
                setLoadingSkeleton(false)
                setSafeData(data)
                const localUserInfo = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY.USER_INFO) || '{}')
                localStorage.setItem(LOCAL_STORAGE_KEY.USER_INFO, JSON.stringify(Object.assign({}, localUserInfo, data)))
                const securityMethodsCount = checkMethodsCount(data);
                const baseSafeData = initBaseSafeList.map((item: SafeListItem) => {
                    if (data.hasOwnProperty(item.type)) {
                        // 判断是否有足够的安全验证方式允许解绑
                        // 只有当安全验证方式数量大于2时才允许解绑
                        const canUnbind = securityMethodsCount > 2;
                        if (item.type === 'googleCode') {
                            const value = data[item.type];
                            // 如果只有一种安全验证方式，且当前是googleCode，则过滤掉close按钮
                            const filteredBindBtn = !canUnbind ?
                                item.bindBtn.filter(btn => btn.key !== 'close') :
                                item.bindBtn.filter(btn =>  btn.key !== 'open');
                            return {
                                ...item,
                                bindValue: t('security.enabled'), //'启用',
                                isBind: Boolean(value),
                                bindBtn: filteredBindBtn
                            };
                        }
                        if (item.type === 'password') {
                            const value = data[item.type];
                            return {
                                ...item,
                                bindValue: t('security.set'), //'已设置',
                                isBind: Boolean(value),
                            };
                        }
                        if (item.type === 'phone' || item.type === 'email') {
                            const value = data[item.type];
                            // 如果只有2种安全验证方式，且当前是phone或email，则过滤掉close按钮
                            const filteredBindBtn = !canUnbind ?
                                item.bindBtn.filter(btn => btn.key !== 'close') :
                                item.bindBtn;
                            return {
                                ...item,
                                bindValue: encryptString(value),
                                isBind: Boolean(value),
                                bindBtn: filteredBindBtn
                            }
                        }
                        const value = data[item.type];
                        return {
                            ...item,
                            bindValue: value,
                            isBind: Boolean(value),
                        };
                    }
                    return item;

                })
                const securityLogData = initSecurityLogList.map((item: SecurityLogItem) => {
                    if (data.hasOwnProperty(item.type)) {
                        const value = data[item.type];
                        return {
                            ...item,
                            value: value,
                            bindValue: value,
                            isBind: Boolean(value),
                        };
                    }
                    return item;
                })
                // console.log(baseSafeData, 1);
                // console.log(securityLogData, 2);

                setBaseSafeList(baseSafeData)
                setSecurityLogList(securityLogData)
            } else {
                toast.error(res.message)
            }
            setLoading(false)
        } catch (error) {
            setLoading(false)
            toast.error(String(error))
        }
    }
    // 重新获取安全中心数据
    const handOk = async () => {
        await getSafeCenterData()
    }
    // 修改密码成功后
    const changeLock = () => {
        appStore.clearUserInfo()
        appStore.clearUserToken()
        router.push('/login')
    }

    useEffect(() => {
        getSafeCenterData()
    }, [langKey])

    return (<div className={`${styles.safe_page}`} >
        {/* <Spin size="large" spinning={loading} /> */}
        <div >
            <h2 className={`font-w-500 font-20`}>
                {/* 安全中心 */}
                {t('security.title')}
            </h2>
        </div>
        {/* safe box*/}
        <div className={`${styles.card_bgc} mt-3 `}>
            <div className={`flex-row justify-between font-18 font-w-500 pl-6 mb-4`} >{t('security.basicSecurity')}
            </div>
            <ul className={`${styles.content_ul} ${styles.border_bottom} mt-4 `} >
                {baseSafeList.map((item: SafeListItem) => (
                    <Skeleton active title={false} loading={loadingSkeleton} key={item.type} className='px-6 py-6'>

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
                                    {item.isBind && Array.isArray(item.bindBtn) && item.bindBtn.length > 0 && (
                                        item.bindBtn.map((btn: ButtonConfig, index: number) => (
                                            <button
                                                className={`${styles.btn_style} btn-color-default ml-2`}
                                                key={index}
                                                onClick={btn.onok}
                                            >
                                                {btn.title}
                                            </button>
                                        ))
                                    )}
                                    {!item.isBind && Array.isArray(item.noBindBtn) && item.noBindBtn.length > 0 && !item.isBind && (
                                        item.noBindBtn.map((btn: ButtonConfig, index: number) => (
                                            <button
                                                className={`${styles.btn_style} btn-color-default ml-2`}
                                                key={index}
                                                onClick={btn.onbind}
                                            >
                                                {btn.title}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>

                        </li>
                    </Skeleton>
                ))}

            </ul>
            {/* } */}
            <div className={`flex-row justify-between font-18 font-w-500 pl-6 pt-6 mb-4`} >{t('security.securityLog')}</div>
            <ul className={`${styles.content_ul}`}>
                {securityLogList.map((item: SecurityLogItem) => (
                    <Skeleton active title={false} loading={loadingSkeleton} key={item.type} className='px-6 py-6'>
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

                                <button className={`${styles.btn_style} btn-color-default`} onClick={item.button}>{item.btntext}</button>
                            </div>

                        </li>
                    </Skeleton>
                ))}
            </ul>
            {/* 修改确认弹窗 */}
            <CheckModal
                open={checkModalOpen}
                type={checkType}
                onOk={handCheckModal}
                onCancel={() => setCheckModalOpen(false)} />
            {/* 安全验证-关闭/修改手机 */}
            {/* <SafeModal
                open={safeModalOpen}
                type={safeType}
                onOk={handsvcOk}
                acountInfo={safeAccount}
                onCancel={() => setSafeModalOpen(false)} /> */}
            <MailSafeModal
                open={mailSafeModalOpen}
                type={safeType}
                onOk={handsvcOk}
                acountInfo={safeData}
                onCancel={() => setMailSafeModalOpen(false)} />
            <PhoneSafeModal
                open={phoneSafeModalOpen}
                type={safeType}
                onOk={handsvcOk}
                acountInfo={safeData}
                onCancel={() => setPhoneSafeModalOpen(false)} />
            {/* 安全验证-设置/修改密码 */}
            <LockSafeModal
                open={lockSafeModalOpen}
                type={safeType}
                onOk={handsvcOk}
                acountInfo={safeData}
                onCancel={() => setLockSafeModalOpen(false)} />
            {/* 设置/修改手机号 */}
            <SetPhoneModal
                open={phoneModalOpen}
                type={phoneType}
                acountInfo={safeData}
                onOk={() => handOk()}
                onCancel={() => setPhoneModalOpen(false)} />
            {/* 设置/修改邮箱 */}
            <SetMailModal
                open={mailModalOpen}
                type={mailType}
                acountInfo={safeData}
                onOk={() => handOk()}
                onCancel={() => setMailModalOpen(false)} />
            {/* 设置/修改密码 */}
            <SetLockModal
                open={lockModalOpen}
                type={lockType}
                onOk={() => changeLock()}
                onCancel={() => setLockModalOpen(false)} />
            {/* 解绑谷歌 */}
            <UnbindGoogleModal
                open={unbindGoogleModalOpen}
                acountInfo={safeData}
                onOk={() => handOk()}
                onCancel={() => setUnbindGoogleModalOpen(false)} />
            {/* 绑定谷歌 */}
            <BindGoogleModal
                open={BindGoogleModalOpen}
                acountInfo={safeData}
                onOk={() => handOk()}
                onCancel={() => setBindGoogleModalOpen(false)} />
        </div>

    </div>);
};
export const getStaticProps: GetStaticProps = async ({ locale }) => {
	return {
		props: {
			...(await serverSideTranslations(locale || 'en', ['userCenter','common'])),
		},
	};
};
export default withUserCenterLayout(SafeCenter);