import React from 'react';
// import UserCenterLayout from '@/components/UserCenterLayout/Layout';
import styles from "../../styles/overview.module.css"
import { Iconify, SvgIcon } from "@/components/icon"
import { CSSProperties, useState, useEffect } from "react";
import { QRCode, Skeleton, Carousel } from "antd";
import Image from 'next/image';
// import AssetsAreaChart from '../charts/AreaChart';
import { useRouter } from 'next/router';
import { toast } from "sonner";
import { encryptString } from '@/utils/encrypt';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
// import dayjs from 'dayjs';
// import { getUserLoginLogList, getUserDeviceNoList } from '@/services/safeCenter';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useTranslation } from 'next-i18next';
// import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
// import type { GetStaticProps } from 'next';
import { getCarouselImageList } from '@/services/userCenter';
import { getLoginInfo } from '@/services/overview';
// import { LOCAL_STORAGE_KEY } from '@/config/apiConfig';
import { getKvObject } from '@/services/kv'
import { LoginInfoType, LoginLogListType, carouselImageContentsType, CarouselPicType } from '@/type/userCenter/overview'
import AssetsPage from "./assets"
import InvitePage from "./invite"
import SafeLogPage from "./safeLog"
import EquipmentPage from "./equipment"
import appStore from '@/store';

const identityStyle: CSSProperties = {
    position: 'relative',
    // backgroundImage: "url('/images/userCenter/overview/icon_identity.png')",
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 20px bottom 24px',
    backgroundSize: '58px'
};
const OverviewPage: React.FC = () => {
    const [loginInfo, setLoginInfo] = useState<LoginInfoType>({} as LoginInfoType);
    // const [loginLogList, setLoginLogList] = useState<LoginLogListType[]>([] as LoginLogListType[]);
    // const [userDeviceNoList, setUserDeviceNoList] = useState<LoginLogListType[]>([] as LoginLogListType[]);
    const [loadingSkeleton, setLoadingSkeleton] = useState(true)
    const [carouselPic, setCarouselPic] = useState<CarouselPicType[]>([] as CarouselPicType[]);
    const { t, i18n } = useTranslation('userCenter');
    const router = useRouter();
    const { copyFn } = useCopyToClipboard();
    // const BASE_URL = process.env.NEXT_PUBLIC_INVITE_BASE;
    const [useInvite, setUseInvite] = useState(false)

    const { isDayMode } = useThemeMode(); // 使用 hook
    const getLoginInfoData = async () => {
        setLoadingSkeleton(true)
        try {
            const res = await getLoginInfo();
            if (res.code === '0') {
                setLoginInfo(res.data);
                setLoadingSkeleton(false)
                // const localUserInfo = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY.USER_INFO) || '{}')
                // localStorage.setItem(LOCAL_STORAGE_KEY.USER_INFO, JSON.stringify(Object.assign({}, localUserInfo, res.data)))
                appStore.updateUserInfo(res.data)
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
        if (status === 1 || status === 0 || status === 3) {
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
    const picClick = (url: string) => {
        window.open(url, '_blank', 'noopener')
    }
    const getUseBankKv = async () => {
        const keys = ['account_configuration']

        const res = await getKvObject(keys)
        try {
            if (res.code === '0') {
                if (res.data.account_configuration === '1') {
                    setUseInvite(true)
                } else {
                    setUseInvite(false)
                }
            } else {
                toast.error(res.message)
            }
        } catch (error) {
            toast.error(String(error))
        }
    }
    useEffect(() => {
        getLoginInfoData()
        // getLoginLogListData()
        // getUserDeviceNoListData()
        getCarouselPic()
        getUseBankKv()
    }, [i18n.language]);

    useEffect(() => {
        const updateBannerHeight = () => {
            const identityElement = document.querySelector('.content_identity');
            const bannerElements = document.querySelectorAll(`.${styles.bannerImg_box}`);

            if (identityElement && bannerElements.length > 0) {
                const identityHeight = identityElement.clientHeight;
                const newHeight = identityHeight - 42;

                bannerElements.forEach((element) => {
                    (element as HTMLElement).style.height = `${newHeight}px`;
                });
            }
        };

        // 初始设置
        updateBannerHeight();

        // 监听窗口大小变化
        window.addEventListener('resize', updateBannerHeight);

        // 清理函数
        return () => {
            window.removeEventListener('resize', updateBannerHeight);
        };
    }, []);

    // 身份等级指示器组件
    const LevelIndicator = ({ active = true, className = '' }) => {
        // 非激活状态使用图片
        if (!active) {
            return (
                <Image
                    src={isDayMode ? "/images/userCenter/safe/icon_none_day.png" :
                        "/images/userCenter/safe/icon_none_dark.png"}
                    width={21}
                    height={4}
                    alt=""
                    className={className}
                />
            );
        }

        // 激活状态使用 SVG
        return (
            <SvgIcon
                viewBox="0 0 21 4"
                className={className}
                width={21}
                height={4}
            >
                <rect width="21" height="4" fill={'var(--theme-color)'} />
            </SvgIcon>
        );
    };

    // 获取身份状态显示
    const getIdentityStatus = (status: number) => {
        if (!status || status < 1 || status > 3) return '';
        return (
            <div className='flex-x-cc'>
                <LevelIndicator active={status >= 3} className='mr-1' />
                <LevelIndicator active={status >= 2} className='mr-1' />
                <LevelIndicator active={status >= 1} />
            </div>
        );
    }

    return (<div className={`${styles.overview_page}`} >
        <div className={`${styles.overview_header}`}>
            <Skeleton active={false} title={false} loading={loadingSkeleton} paragraph={{ rows: 2 }}>
                <h2 className={`${styles.header_userName} font-20`}>
                    {/* 欢迎回来， */}
                    {t('overview.welcome')} {loginInfo?.account || `IMUSER-${loginInfo?.userId || '--'}`}
                </h2>
                <p className={`${styles.header_tip} ${styles.tip_color} font-14`}>
                    {loginInfo?.famousAphorisms || `"${t('overview.famousAphorisms')}"`}
                </p>
            </Skeleton>
        </div>
        {/* userInfo-header*/}
        <div className={`${styles.card_bgc} ${styles.pt0} ${styles.overview_header} mt-3 flex-row justify-between `}>
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
                                <Image src={isDayMode ? "/images/userCenter/overview/icon_avatarUrl_day.png"
                                    : "/images/userCenter/overview/icon_avatarUrl_dark.png"}
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
                                <Iconify icon="mingcute:time-line" className={`${styles.warning_color} mr-1`} size={20} />
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
        <div className={`flex `} >
            {/* content-content */}
            <div className={`${styles.content_box}  flex-1`}>
                {/* content-main */}
                <div className={`flex-row justify-between flex-wrap ${styles.content_box_main} `} >
                    {/* 身份认证 */}
                    <div className={`${styles.card_bgc} ${styles.content_identity} flex-1 mr-6 mt-6 content_identity`}
                        style={{
                            ...identityStyle,
                            backgroundImage: isDayMode ? "url('/images/userCenter/overview/icon_identity.png')" : "url('/images/userCenter/overview/icon_identity_dark.png')",
                        }}>
                        <div className={`flex-row justify-between font-18 font-w-500`} >
                            {/* 身份认证 */}
                            {t('overview.identityAuth.title')}
                        </div>
                        <p className={`font-14 mt-2 ${styles.tip_color}`}>
                            {statusText(loginInfo?.realnessStatus)}
                        </p>
                        {loginInfo?.realnessStatus === 0 ? <div className={`font-14 mt-3 ${styles.error_icon}`}>
                            {!loginInfo?.remark ? <div className='flex align-center'>-- </div> :
                                loginInfo.remark.includes('&') ? <span >
                                    {loginInfo.remark.split('&')[0]}
                                </span>
                                    : <span >
                                        {loginInfo.remark}
                                    </span>
                            }
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
                    <div className={`${styles.card_bgc} ${styles.content_safe} flex-1 mt-6`}
                        style={{
                            ...identityStyle,
                            backgroundImage: isDayMode ? "url('/images/userCenter/overview/icon_safe.png')" : "url('/images/userCenter/overview/icon_safe_dark.png')"
                        }}>
                        <div className={`flex-row justify-between font-18 font-w-500`} >
                            {/* 安全认证 */}
                            {t('overview.securityAuth.title')}
                        </div>
                        <div className={`font-14 mt-2 ${styles.tip_color} flex align-center`}>
                            <span className='mr-2_5' >
                                {/* 安全强度 */}
                                {t('overview.securityAuth.securityLevel')}({loginInfo?.securityIntensity === 1 ? t('overview.securityAuth.low') : loginInfo?.securityIntensity === 2 ? t('overview.securityAuth.medium') : t('overview.securityAuth.high')})</span>
                            {getIdentityStatus(loginInfo?.securityIntensity)}
                        </div>
                        <p className={`font-14 mt-3`}>
                            {/* 启用双重认证提高账户安全性 */}
                            {t('overview.securityAuth.tip')}
                        </p>
                        <button className={`btn-color font-14 font-w-500 mt-10 ${styles.btn}`}
                            onClick={() => router.push('/userCenter/safeCenter')}
                        >{loginInfo?.securityIntensity === 3 ? t('overview.securityAuth.view') : t('overview.securityAuth.bind')}</button>
                    </div>
                </div>
                {/* 资产 */}
                <AssetsPage />
                {/* 最近登录 */}
                <SafeLogPage />
                {/* 授权设备 */}
                <EquipmentPage />
            </div>
            {/* content-aside */}
            <div className={`${styles.aside_box} ml-6 mt-6`}>
                <div className={`${styles.aside_invite_box} flex-1`}>
                    <div className={`flex-row justify-between font-18 font-w-500 mb-3`} >

                        {t('overview.recommend.title')}
                    </div>
                    {(carouselPic.length === 0) ? <div className={`${styles.card_bgc} ${styles.aside_invite} flex-col justify-between `}
                        style={{ ...identityStyle, backgroundImage: isDayMode ? "url('/images/userCenter/overview/icon_invite_day.png')" : "url('/images/userCenter/overview/icon_invite_dark.png')", }}
                        onClick={() => { router.push('/invite') }}>
                        <div className={`flex-row justify-between font-18 font-w-500`} >

                            {t('overview.recommend.invite')}
                        </div>
                        <p style={{ width: '60%' }} className='font-14'>{t('overview.recommend.inviteNewUser')}</p>
                    </div> : <div>
                        <Carousel autoplay>
                            {carouselPic.map((item: any) => (
                                <div key={item.id} className={`${styles.bannerImg_box} w-full`} onClick={() => picClick(getLanguage(item.carouselImageContents)?.accessUrl)}>
                                    <Image src={getLanguage(item.carouselImageContents)?.imageUrl} className={`w-full pointer ${styles.banner_mg}`}
                                        alt={getLanguage(item.carouselImageContents)?.title || ''} width={100} height={260}

                                    />
                                </div>
                            ))}
                        </Carousel>
                    </div>}
                </div>

                {useInvite && <InvitePage />
                }
            </div>
        </div>
    </div>);
};

export default OverviewPage;