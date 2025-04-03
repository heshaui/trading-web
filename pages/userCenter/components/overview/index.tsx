import React from 'react';
// import UserCenterLayout from '@/components/UserCenterLayout/Layout';
import styles from "../../styles/overview.module.css"
import { Iconify } from "@/components/icon"
import { CSSProperties, useState, useEffect } from "react";
import { QRCode, Skeleton, Carousel } from "antd";
import Image from 'next/image';
import AssetsAreaChart from '../charts/AreaChart';
import { useRouter } from 'next/router';
import { toast } from "sonner";
import { encryptString } from '@/utils/encrypt';
import {useCopyToClipboard} from '@/hooks/use-copy-to-clipboard';
import dayjs from 'dayjs';
import { getUserLoginLogList, getUserDeviceNoList } from '@/services/safeCenter';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useTranslation } from 'next-i18next';
// import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
// import type { GetStaticProps } from 'next';
import { getCarouselImageList } from '@/services/userCenter';
import { getLoginInfo } from '@/services/overview';

const identityStyle: CSSProperties = {
    position: 'relative',
    // backgroundImage: "url('/images/userCenter/overview/icon_identity.png')",
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 20px bottom 24px',
    backgroundSize: '58px'
};
interface LoginInfoType {
    userId: number,
    account: string,
    status: number,
    email: string,
    password: string,
    phone: string,
    inviteCode: string,
    parentUserId: number,
    isGoogleAuth: number,
    isPhoneAuth: number,
    isEmailAuth: number,
    realnessStatus: number,
    addressStatus: number,
    fundPassword: string,
    countryCode: string,
    userLevel: string,
    createTime: number,
    updateTime: number,
    tenantId: string,
    salt: string,
    transactionStatus: number,
    withdrawalStatus: number,
    famousAphorisms: string,
    registerAccount: string,
    securityIntensity: number,
    avatarUrl: string,
    remark: string
}
interface LoginLogListType {
    id: number,
    userId: number,
    platformType: number,
    deviceNo: string,
    ip: string,
    address: string,
    token: string,
    tokenTime: string,
    createTime: number,
    updateTime: number,
    tenantId: string
}
interface carouselImageContentsType {
    id: number,
    languageCode: string,
    title: string,
    carouselImageId: number,
    createTime: number,
    updateTime: number,
    tenantId: string,
    accessType: number,
    accessUrl: string,
    imageUrl: string
}
interface CarouselPicType {
    id: number,
    isShow: number,
    sort: number,
    createTime: number,
    updateTime: number,
    tenantId: string,
    carouselImageContents: carouselImageContentsType[]
}
const OverviewPage: React.FC = () => {
    const [loginInfo, setLoginInfo] = useState<LoginInfoType>({} as LoginInfoType);
    const [loginLogList, setLoginLogList] = useState<LoginLogListType[]>([] as LoginLogListType[]);
    const [userDeviceNoList, setUserDeviceNoList] = useState<LoginLogListType[]>([] as LoginLogListType[]);
    const [loadingSkeleton, setLoadingSkeleton] = useState(true)
    const [carouselPic, setCarouselPic] = useState<CarouselPicType[]>([] as CarouselPicType[]);
    const { t } = useTranslation('userCenter');
    const router = useRouter();
    const { copyFn } = useCopyToClipboard();
    const BASE_URL = process.env.NEXT_PUBLIC_INVITE_BASE;
    const [codeValue, setcodeValue] = useState(`${BASE_URL}?inviteCode=${loginInfo?.inviteCode || '--'}`) //, setcodeValue

    const { isDayMode } = useThemeMode(); // 使用 hook
    const getLoginInfoData = async () => {
        setLoadingSkeleton(true)
        try {
            const res = await getLoginInfo();
            if (res.code === '0') {
                setLoginInfo(res.data);
                setLoadingSkeleton(false)
                setcodeValue(`${BASE_URL}?inviteCode=${res.data?.inviteCode || '--'}`)
            }
        } catch (error) {
            toast.error(String(error));
        }

    }
    const getLoginLogListData = async () => {
        try {
            const params = {
                pageNo: 1,
                pageSize: 5,
            }
            const res = await getUserLoginLogList(params);
            if (res.code === '0') {
                setLoginLogList(res.data.list)
            }

        } catch (error) {
            toast.error(String(error));
        }
    }
    const getUserDeviceNoListData = async () => {
        try {
            const params = {
                pageNo: 1,
                pageSize: 5,
            }
            const res = await getUserDeviceNoList(params);
            if (res.code === '0') {
                setUserDeviceNoList(res.data.list)
            }
        } catch (error) {
            toast.error(String(error));
        }
    }
    const statusText = (status: number) => {
        switch (status) {
            case 1:
                // 已认证
                return t('overview.auth');
            case 0:
                // 已驳回
                return t('overview.reject');
            case 2:
                // 未认证
                return t('overview.unAuth');
            case 3:
                // 审核中
                return t('overview.audit');
            default:
                return '--';
        }
    }

    const goIdentity = (status: number) => {
        if (status === 1) {
            router.push(`/userCenter/identity`)
        } else {
            localStorage.setItem('identity_authStatus', status.toString())
            router.push(`/userCenter/identity/${loginInfo?.userId}?authStatus=${status}`)
        }
    }
    const getCarouselPic = async () => {
        const res = await getCarouselImageList()
        if (res.code === '0') {
            setCarouselPic(res.data)
        }
    }
    const getLanguage = (carouselImageContents: carouselImageContentsType[]) => {
        const language = localStorage.getItem('lang') || 'en_US'
        let imgRes = carouselImageContents.filter((item: carouselImageContentsType) => item.languageCode === language)
        // 3. 如果当前语言没有对应内容，则使用英文内容
        if (!imgRes || imgRes.length === 0) {
            imgRes = carouselImageContents.filter((item: carouselImageContentsType) =>
                item.languageCode === 'en_US'
            );
        }
        return imgRes[0]
    }

    useEffect(() => {
        getLoginInfoData()
        getLoginLogListData()
        getUserDeviceNoListData()
        getCarouselPic()
    }, []);

    return (<div className={`${styles.overview_page}`} >
        <div className={`${styles.overview_header}`}>
            <h2 className={`${styles.header_userName} font-20`}>
                {/* 欢迎回来， */}
                {t('overview.welcome')} {loginInfo?.account || `IMUSER-${loginInfo?.userId || '--'}`}
            </h2>
            <p className={`${styles.header_tip} ${styles.tip_color} font-14`}>
                {loginInfo?.famousAphorisms || `"${t('overview.famousAphorisms')}"`}
            </p>
            {/* </Skeleton> */}
        </div>
        {/* userInfo-header*/}
        <div className={`${styles.card_bgc} ${styles.pt0} mt-3 flex-row justify-between `}>
            {/* <Skeleton.Avatar active  shape={'circle'}  loading={loadingSkeleton} /> */}
            <Skeleton active title={false} loading={loadingSkeleton} paragraph={{ rows: 3 }} className='mt-6' avatar={{
                shape: 'circle',
                size: 68,
                // active: true
            }}>
                <div className={`flex-row justify-between align-center flex-wrap  ${styles.userInfo_content}`}>
                    <div className={`${styles.content_header_userInfo} flex-row align-center mt-6`}>
                        <div className={`${styles.userInfo_pic_box} flex-y-cc`}>
                            {loginInfo?.avatarUrl ? <Image src={loginInfo?.avatarUrl}
                                alt="" width={68} height={68}
                                className={`${styles.userInfo_pic}`} />
                                :
                                <Image src={isDayMode ? "/images/userCenter/overview/icon_avatarUrl1.png"
                                    : "/images/userCenter/overview/icon_avatarUrl2.png"}
                                    alt="" width={68} height={68}
                                    className={`${styles.userInfo_pic}`} />}
                        </div>
                        <div className='ml-3 '>
                            <div className={`${styles.userInfo_name} font-18`}>{loginInfo?.account || '--'}</div>
                            <div className={`${styles.userInfo_uid} font-14 flex-row align-baseline`}>
                                UID：{loginInfo?.userId || '--'}
                                <Iconify icon="icon-park-solid:copy"
                                    className='ml-1 cursor-pointer' size={18}
                                    onClick={() => copyFn(loginInfo?.userId?.toString() || '')}
                                />
                            </div>
                        </div>
                    </div>
                    {/* <div className='flex-1 flex-wrap flex-x justify-between ml-4'> */}
                    <div className={`${styles.card_mt} mt-6`}>
                        <p className={`${styles.tip_color} font-12`}>
                            {/* 注册账号 */}
                            {t('overview.registerAccount')}
                        </p>
                        <p className='font-14 mt-2'>{encryptString(loginInfo?.registerAccount)}</p>
                    </div>
                    <div className={`${styles.tip_color} font-12 ${styles.card_mt} mt-6`}>
                        <div className={`${styles.tip_color} font-12 flex-x-cc cursor-pointer`}
                            onClick={() => goIdentity(loginInfo?.realnessStatus)}>
                            {/* 身份认证 */}
                            {t('overview.identityAuth.title')}
                            <Iconify icon="mingcute:right-line" className={`${styles.tip_color} ml-1`} size={18} />
                        </div>
                        {loginInfo && loginInfo?.realnessStatus === 1 && (
                            <div className='font-14 mt-2 flex-x align-center'>
                                <Iconify icon="mingcute:safety-certificate-line" className={`${styles.success_icon} mr-1`} size={20} />
                                <span className={`${styles.tip_color} font-14 font-w-500`}>
                                    {/* 已认证 */}
                                    {t('overview.auth')}
                                </span>
                            </div>)}
                        {loginInfo && loginInfo?.realnessStatus === 0 && (
                            <div className='font-14 mt-2 flex-x align-center'>
                                <Iconify icon="lets-icons:close-ring" className={`${styles.error_icon} mr-1`} size={20} />
                                <span className={`${styles.tip_color} font-14 font-w-500`}>
                                    {/* 已驳回 */}
                                    {t('overview.reject')}
                                </span>
                            </div>
                        )}
                        {loginInfo && loginInfo?.realnessStatus === 3 && (
                            <div className='font-14 mt-2 flex-x align-center'>
                                <Iconify icon="mingcute:time-line" className={`${styles.tip_color} mr-1`} size={20} />
                                <span className={`${styles.tip_color} font-14 font-w-500`}>
                                    {/* 审核中 */}
                                    {t('overview.audit')}
                                </span>
                            </div>
                        )}
                        {loginInfo && loginInfo?.realnessStatus === 2 && (
                            <div className='font-14 mt-2 flex-x align-center'>
                                <Iconify icon="mingcute:safe-alert-line" className={`${styles.default_icon} mr-1`} size={20} />
                                <span className={`${styles.default_icon} font-14 font-w-500`}>
                                    {/* 未认证 */}
                                    {t('overview.unAuth')}
                                </span>

                            </div>)}
                    </div>
                    <div className={`${styles.card_mt} mt-6 `}>
                        <p className={`${styles.tip_color} font-12`}>
                            {/* 账号状态 */}
                            {t('overview.accountStatus')}
                        </p>
                        <div className='font-14 mt-2 font-w-500 flex-y'>
                            <span className='mr-2'>
                                {loginInfo?.status === 1 && loginInfo?.transactionStatus === 1 && loginInfo?.withdrawalStatus === 1 ? (
                                    <span className='mr-2'>{t('overview.normal')}</span>
                                ) : (
                                    <>
                                        {(() => {
                                            const statusMessages = [];

                                            if (loginInfo?.status === 0) {
                                                statusMessages.push(t('overview.loginFrozen'));
                                            }

                                            if (loginInfo?.transactionStatus === 0) {
                                                statusMessages.push(t('overview.tradeFrozen'));
                                            }

                                            if (loginInfo?.withdrawalStatus === 0) {
                                                statusMessages.push(t('overview.withdrawFrozen'));
                                            }

                                            return <span className='mr-2'>{statusMessages.join(' / ')}</span>;
                                        })()}
                                    </>
                                )}
                            </span>
                        </div>
                    </div>
                    {/* </div> */}

                </div>
                <div className={`${styles.userInfo_detail} flex-row align-start justify-end flex-1 mt-6`} >
                    <button type='button' className={`${styles.userInfo_btn} font-w-500`} onClick={() => router.push('/userCenter/userSettings')}>
                        {/* 个人资料 */}
                        {t('overview.personalInfo')}
                    </button>
                </div>
            </Skeleton>
        </div>
        {/* userInfo-content */}
        <div className={`flex flex-wrap`} >
            {/* content-content */}
            <div className={`${styles.content_box}  flex-1`}>
                {/* content-main */}
                <div className={`flex-row justify-between flex-wrap ${styles.content_box_main}`} >
                    {/* 身份认证 */}
                    <div className={`${styles.card_bgc} ${styles.content_identity} flex-1 mr-6 mt-6`}
                        style={{ ...identityStyle, backgroundImage: "url('/images/userCenter/overview/icon_identity.png')", }}>
                        <div className={`flex-row justify-between font-18 font-w-500`} >
                            {/* 身份认证 */}
                            {t('overview.identityAuth.title')}
                        </div>
                        <p className={`font-14 mt-2 ${styles.tip_color}`}>
                            {statusText(loginInfo?.realnessStatus)}
                        </p>
                        {loginInfo?.realnessStatus === 0 ? <div className={`font-14 mt-3`}>
                            {/* 请重新提交认证，完成认证后可以享受
                            交易所完整的服务 */}
                            {t('overview.identityAuth.reVerify')}
                            {loginInfo?.remark && (
                                <div className="mb-2">
                                    {loginInfo.remark.includes('&')
                                        ? loginInfo.remark.split('&').map((item, index) => (
                                            <div key={index} className={`${index > 0 ? 'mt-1' : ''}`}>
                                                {item.trim()}
                                            </div>
                                        ))
                                        : loginInfo.remark
                                    }
                                </div>
                            )}
                        </div>
                            : <p className={`font-14 mt-3 mb-2`}>
                                {/* 已完成身份认证，开始您的货币之旅吧！ */}
                                {loginInfo?.realnessStatus === 1 ? t('overview.identityAuth.verified') : t('overview.identityAuth.unverified')}
                            </p>}
                        <button className={`btn-color font-14 font-w-500 mt-10 ${styles.btn}`}
                            onClick={() => goIdentity(loginInfo?.realnessStatus)}
                        >
                            {loginInfo?.realnessStatus === 2 ? t('overview.identityAuth.goVerify') : t('overview.identityAuth.viewDetails')}
                            {/* {loginInfo?.realnessStatus === 0 && '重新认证'}
                            {loginInfo?.realnessStatus === 3 && '审核中'} */}
                        </button>
                        {/* {loginInfo?.realnessStatus === 3 && <button className={`disabled_btn font-14 font-w-500 mt-10 ${styles.btn}`}
                            onClick={() => router.push(`/userCenter/identity/${loginInfo?.userId}?authStatus=${loginInfo?.realnessStatus}`)}
                        >审核中</button>} */}
                    </div>
                    {/* 安全认证 */}
                    <div className={`${styles.card_bgc} ${styles.content_safe} flex-1 mt-4`}
                        style={{ ...identityStyle, backgroundImage: "url('/images/userCenter/overview/icon_safe.png')", }}>
                        <div className={`flex-row justify-between font-18 font-w-500`} >
                            {/* 安全认证 */}
                            {t('overview.securityAuth.title')}
                        </div>
                        <div className={`font-14 mt-2 ${styles.tip_color} flex align-center`}>
                            <span className='mr-2_5' >
                                {/* 安全强度 */}
                                {t('overview.securityAuth.securityLevel')}({loginInfo?.securityIntensity === 1 ? t('overview.securityAuth.low') : loginInfo?.securityIntensity === 2 ? t('overview.securityAuth.medium') : t('overview.securityAuth.high')})</span>
                            {loginInfo?.securityIntensity === 1 && <Image src="/images/userCenter/safe/icon_safe1.svg"
                                width={71}
                                height={4}
                                alt="" />}
                            {loginInfo?.securityIntensity === 2 && <Image src="/images/userCenter/safe/icon_safe2.svg"
                                width={71}
                                height={4}
                                alt="" />}
                            {loginInfo?.securityIntensity === 3 && <Image src="/images/userCenter/safe/icon_safe3.svg"
                                width={71}
                                height={4}
                                alt="" />}
                        </div>
                        <p className={`font-14 mt-3`}>
                            {/* 启用双重认证提高账户安全性 */}
                            {t('overview.securityAuth.tip')}
                        </p>
                        <button className={`btn-color font-14 font-w-500 mt-10 ${styles.btn}`}
                            onClick={() => router.push('/userCenter/safeCenter')}
                        >{loginInfo?.securityIntensity === 3 ? t('overview.securityAuth.view') : t('overview.securityAuth.bind')}</button>
                        {/* <Image
                                src="/images/userCenter/overview/icon_safe.png"
                                width={58}
                                height={58}
                                alt="identity icon"
                                style={{
                                    position: 'absolute',
                                    right: '20px',
                                    bottom: '24px'
                                }}
                            /> */}
                    </div>
                </div>
                {/* 资产 */}
                <div className={`${styles.card_bgc} ${styles.assets_box} mt-6`}>
                    <div className={`flex-row justify-between font-18 font-w-500`} >
                        {/* 资产 */}
                        {t('overview.assets.title')}
                        <Iconify icon="mingcute:arrow-right-line" className='cursor-pointer' size={20} />
                    </div>
                    <div className={`flex-row justify-between align-center`}>
                        <div className={`${styles.assets_main}`} >
                            <div className={`${styles.tip_color} mt-2`} >
                                {/* 总资产折合 */}
                                {t('overview.assets.totalAssets')}
                                <Iconify icon="clarity:eye-show-line" className='cursor-pointer ml-1' size={20} />
                            </div>
                            <p className='font-32 font-w-700'>0.00 USDT</p>
                            <p className={`${styles.tip_color} font-14`}>≈￥0.00</p>
                            <div className='font-14 mt-4'>
                                {/* 今日盈亏 */}
                                {t('overview.assets.todayProfitLoss')}
                                <Iconify icon="ep:warning" className='cursor-pointer mx-1' size={12} />
                                <span className={`${styles.success_icon} font-12`}>+￥13.00</span>
                            </div>
                            <div className='mt-5'>
                                <button className={`btn-color font-14 font-w-500  ${styles.btn} mr-4`} >
                                    {/* 充值 */}
                                    {t('overview.assets.deposit')}
                                </button>
                                <button className={`btn-disable font-14 font-w-500  ${styles.btn}`} >
                                    {/* 提现 */}
                                    {t('overview.assets.withdraw')}
                                </button>
                            </div>
                        </div>
                        <div className={`${styles.assets_chart}`} >
                            <AssetsAreaChart />
                        </div>
                    </div>
                </div>
                {/* 最近登录 */}
                <div className={`${styles.card_bgc} mt-6`}>
                    <div className={`flex-row justify-between font-18 font-w-500`} >
                        {/* 最近登录 */}
                        {t('overview.recentLogin.title')}
                        <Iconify icon="mingcute:arrow-right-line" className='cursor-pointer' size={20}
                            onClick={() => router.push('/userCenter/safeCenter/safe_log')}
                        />
                    </div>
                    <div className={`flex-1`} >
                        <ul>
                            {loginLogList && loginLogList.map((item: any) => (
                                <li className='flex-row justify-between mt-5' key={item.id}>
                                    <p className='font-14 font-w-500 flex-col'>
                                        <span className='font-w-500'>
                                            {/* WEB */}
                                            {`${item.deviceNo || '--'}(${item.platformType || '--'})`}
                                        </span>
                                        <span className={`${styles.tip_color} font-12 font-w-400`}>
                                            {/* 中国香港 */}
                                            {item.address || '--'}
                                        </span>
                                    </p>
                                    <p className='font-14 font-w-500 flex-col align-end'>
                                        <span className='font-w-500'>
                                            {/* 2024-01-01 12:00:00 */}
                                            {item.createTime ? dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss') : '--'}
                                        </span>
                                        <span className={`${styles.tip_color} font-12 font-w-400 mt-0_5`}>
                                            {/* 5.180.44.127 */}
                                            {item.ip || '--'}
                                        </span>
                                    </p>
                                </li>
                                // <li className='flex-row justify-between mt-5'>
                                //     <p className='font-14 font-w-500 flex-col '>
                                //         <span className='font-w-500'> ANDROID</span>
                                //         <span className={`${styles.tip_color} font-12 font-w-400`}>中国香港</span>
                                //     </p>
                                //     <p className='font-14 font-w-500 flex-col align-end'>
                                //         <span className='font-w-500'>2024-10-08 09:53:42</span>
                                //         <span className={`${styles.tip_color} font-12 font-w-400 mt-0_5`}>2001:0DB8:130F:0000:0000:09C0:876A:130B</span>
                                //     </p>
                                // </li>
                            ))}
                        </ul>
                    </div>
                </div>
                {/* 授权设备 */}
                <div className={`${styles.card_bgc} mt-6`}>
                    <div className={`flex-row justify-between font-18 font-w-500`} >
                        {/* 授权设备 */}
                        {t('overview.authorizedDevices.title')}
                        <Iconify icon="mingcute:arrow-right-line" className='cursor-pointer' size={20}
                            onClick={() => router.push('/userCenter/safeCenter/equipment')}
                        />
                    </div>
                    <div className={`flex-1`} >
                        <ul>
                            {userDeviceNoList && userDeviceNoList.map((item: any) => (
                                <li className='flex-row justify-between mt-5' key={item.id}>
                                    <p className='font-14 font-w-500 flex-col'>
                                        <span className='font-w-500'>
                                            {/* Chrome 12 125.0.0.0(Mac OS X) */}
                                            {`${item.deviceNo || '--'}(${item.platformType || '--'})`}
                                        </span>
                                        <span className={`${styles.tip_color} font-12 font-w-400`}>
                                            {/* 2020-02-20 12:12:01 中国香港 */}
                                            {/* {item.createTime ? dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss') : '--'} */}
                                            {item.createTime ? `${dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')} ${item.address || '--'}` : '--'}
                                        </span>
                                    </p>
                                    <p className='font-14 font-w-500 flex-col align-end'>
                                        <span className={`font-w-500 ${styles.warning_color} pointer`}
                                            onClick={() => router.push(`/userCenter/safeCenter/equipment?deviceId=${item.id}`)}
                                        >
                                            {/* 管理 */}
                                            {t('overview.authorizedDevices.manage')}
                                        </span>
                                        <span className={`${styles.tip_color} font-12 font-w-400 mt-0_5`}>
                                            {/* 223.168.123.111 */}
                                            {item.ip || '--'}
                                        </span>
                                    </p>
                                </li>
                                // <li className='flex-row justify-between mt-5'>
                                //     <p className='font-14 font-w-500 flex-col '>
                                //         <span className='font-w-500'> ANDROID</span>
                                //         <span className={`${styles.tip_color} font-12 font-w-400`}>Xiaomi Mi 10</span>
                                //     </p>
                                //     <p className='font-14 font-w-500 flex-col align-end'>
                                //         <span className={`font-w-500 ${styles.warning_color} pointer`}>管理</span>
                                //         <span className={`${styles.tip_color} font-12 font-w-400 mt-0_5`}>2001:0DB8:130F:0000:0000:09C0:876A:130B</span>
                                //     </p>
                                // </li>
                            ))}
                        </ul>
                    </div>
                </div>

            </div>
            {/* content-aside */}
            <div className={`${styles.aside_box} ml-6 mt-6`}>
                <div className={`${styles.aside_invite_box} flex-1`}>
                    <div className={`flex-row justify-between font-18 font-w-500 mb-3`} >

                        {t('overview.recommend.title')}
                    </div>
                    {(carouselPic.length === 0) ? <div className={`${styles.card_bgc} ${styles.aside_invite} flex-col justify-between `}
                        style={{ ...identityStyle, backgroundImage: "url('/images/userCenter/overview/icon_recommend.png')", }}>
                        <div className={`flex-row justify-between font-18 font-w-500`} >

                            {t('overview.recommend.invite')}
                        </div>
                        <p style={{ width: '60%' }} className='font-14'>{t('overview.recommend.inviteNewUser')}</p>
                    </div> : <div>
                        <Carousel autoplay>
                            {carouselPic.map((item: any) => (
                                <div key={item.id} className={`${styles.bannerImg_box} w-full`}>
                                    <Image src={getLanguage(item.carouselImageContents)?.imageUrl} className='w-full'
                                        alt={getLanguage(item.carouselImageContents)?.title || ''} width={100} height={260} />
                                </div>
                            ))}
                        </Carousel>
                    </div>}
                </div>

                <div className={`${styles.card_bgc}  mt-6 ${styles.aside_invite2} flex-y flex-1`}>
                    <div className={`flex-row justify-between font-18 font-w-500 mb-3 ${styles.box_padding}`} >

                        {t('overview.recommend.inviteFriend')}
                    </div>
                    <div className={`${styles.qr_code} flex-x align-center  flex-1`}>
                        <QRCode
                            style={{ backgroundColor: "#fff", padding: "6px", minWidth: "68px" }}
                            value={`${codeValue}`} size={68}
                        // className='flex-1'
                        />
                        <div className={`flex-1 ${styles.invite_code_box} flex-col justify-between`}>
                            <div >
                                <p className='font-14 font-w-400'>{t('overview.recommend.inviteCode')}</p>
                                <div className={`${styles.invite_code} font-12 flex align-center justify-between`}>
                                    <span className={`${styles.tip_color}`}>{loginInfo?.inviteCode || '--'}</span>
                                    <Iconify icon="bx:copy" className='cursor-pointer' size={20}
                                        onClick={() => copyFn(loginInfo?.inviteCode || '')}
                                    />
                                </div>
                            </div>
                            <div  >
                                <p className='font-14 font-w-400' >{t('overview.recommend.inviteLink')}</p>
                                <div className={`${styles.invite_code} font-12 flex align-center justify-between`}>
                                    <span className={`${styles.tip_color} ${styles.line1} line-2 mr-1`}>{`${codeValue}`}</span>
                                    <Iconify icon="bx:copy" className='cursor-pointer' size={20}
                                        onClick={() => copyFn(`${codeValue}`)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>);
};
// export const getStaticProps: GetStaticProps = async ({ locale }) => {
// 	return {
// 		props: {
// 			...(await serverSideTranslations(locale || 'en', ['userCenter','common'])),
// 		},
// 	};
// };
export default OverviewPage;