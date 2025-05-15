
import React from 'react';
import styles from '../styles/invite.module.css';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
// import type { CSSProperties } from 'react';
import { ConfigProvider, Tabs, Skeleton } from 'antd';
import { Iconify } from "@/components/icon"
import Image from 'next/image';
import type { TabsProps } from 'antd';
import InvitationDetails from './tables/invitation_details';
import InvitationReward from './tables/invitation_reward';
import { getInviteCount, getRewardConfiguration } from '@/services/invite'
import { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next';
import { getKvObject } from '@/services/kv'

import { toast } from 'sonner';
import { getRate, getCoinRate } from '@/utils/getUseRate';
import appStore from '@/store';

type InviteContentProps = {
    onReturn: () => void;
}
interface InviteCountType {
    userInviteCount?: number,
    userInviteSuccessCount?: number,
    accumulateMoney?: number,
}
interface RewardRouterType {
    inviteCode: string,
    coinId: number,
    coinName: string,
    rebateRatio: string,
    validTime: string,
    rechargeLimit: number,
    isRealname: string
}
const InviteContent = ({ onReturn }: InviteContentProps) => {
    const { t } = useTranslation(['invite']);
    const allConfig = appStore.getKvConfigAll();

    const [inviteCount, setInviteCount] = useState<InviteCountType>({})
    const [inviteCountLoading, setInviteCountLoading] = useState(true)
    const { isDayMode } = useThemeMode(); // 使用 hook
    const { copyFn } = useCopyToClipboard();
    const [rewardRouter, setRewardRouter] = useState<RewardRouterType>({} as RewardRouterType)
    const rateKey = appStore.getRateKey().replace(/\s+/g, ''); // 汇率key
    const inviteContentList = [
        {
            key: 1,
            title: t('invite.recommend'), //'推荐好友',
            desc: t('invite.recommendDesc'), //'将您的邀请链接分享给好友',
            icon: '/images/invite/icon_recommend1.png'
        },
        {
            key: 2,
            title: t('invite.inviteActive'), //'邀请激活',
            desc: t('invite.inviteActiveDesc'), //'好友注册且累计充值至少50USDT',
            icon: '/images/invite/icon_Invitation2.png'
        },
        {
            key: 3,
            title: t('invite.complete'), //'完成认证',
            desc: t('invite.completeDesc'), //'好友完成身份认证',
            icon: '/images/invite/icon_complete3.png'
        },
        {
            title: t('invite.inviteReward'), //'发放奖励',
            desc: t('invite.inviteRewardDesc'), //'满足奖励条件后，系统自动发放',
            icon: '/images/invite/icon_issue4.png'
        }
    ]
    const items: TabsProps['items'] = [
        {
            key: '1',
            label: t('invite.myInvite'), //'我的邀请',
            children: <InvitationDetails onReturn={onReturn} />,
        },
        {
            key: '2',
            label: t('invite.inviteReward'), //'奖励发放',
            children: <InvitationReward onReturn={onReturn} />,
        },
    ];
    const getInviteCountData = async () => {
        setInviteCountLoading(true)
        try {
            const res = await getInviteCount()
            if (res.code === '0') {

                setInviteCount(res.data)
            }
        } catch (error) {

        } finally {
            setInviteCountLoading(false)
        }

    }
    // const getUseBankKv = async () => {
    //     const keys = ['account_configuration']

    //     const res = await getKvObject(keys)
    //     try {
    //         if (res.code === '0'&&res.data.account_configuration==='1') {

    //         } else {
    //             toast.error(res.message)
    //         }
    //     } catch (error) {
    //         toast.error(String(error))
    //     }


    // }
    const setRewardRouterData = async () => {
        const res = await getRewardConfiguration()
        try {
            if (res.code === '0') {
                setRewardRouter(res.data)
            } else {
                toast.error(res.message)
            }
        } catch (error) {
            toast.error(String(error))
        }
    }
    useEffect(() => {
        setRewardRouterData()
        getInviteCountData()
    }, [rateKey])
    return (<>
        <div className={`${styles.header_banner} flex-y align-center`}>
            <div className={`${styles.main_page}`}>
                <div className={`${styles.content_box}`}>
                    <h3 className={`font-32 font-w-500 mb-10 ${styles.mt8}`}>
                        {/* 如何获得佣金？ */}
                        {t('invite.qtitle1')}
                    </h3>
                    <ul className={`flex-x  flex-wrap`}>
                        {inviteContentList.map((item) => (
                            <li key={item.key} className={`${styles.auto_item} flex-y align-center mt-5`}>
                                <Image src={item.icon} alt={item.title} width={68} height={68} />
                                <p className={`font-18 font-w-500 mt-5`}>{item.title}</p>
                                <p className={`font-14 font-w-400 mt-2_5 ${styles.tip_color}`}>{item.desc}</p>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className={`${styles.content_box} ${styles.title_color}`}>
                    <h3 className={`font-32 font-w-500 mb-10 `}>
                        {/* 奖励规则 */}
                        {t('invite.ruleTitle')}
                    </h3>
                    <ul className={`${styles.content_list} font-16 font-w-400 `}>
                        <li className="flex align-base ">
                            <Iconify icon="carbon:diamond-solid" className="theme_color mr-2" size={10} />
                            {/* 邀请好友加入Metawave，您可获得平台奖励 */}
                            {t('invite.ruleDesc12', { platformName: allConfig?.tenant_cache_name || '--' })}
                        </li>
                        <li className="flex align-base mt-3">
                            <Iconify icon="prime:circle-fill" className=" mr-2" size={8} />
                            {/* 第一步：进入“邀请好友”页面，将您的邀请链接或邀请码分享给好友。 */}
                            {t('invite.ruleDesc2')}
                        </li>
                        <li className="flex align-base mt-2_5">
                            <Iconify icon="prime:circle-fill" className=" mr-2" size={8} />
                            {/* 第二步：好友成功注册后，在注册 14 天内累计充值不低于 100 USDT且完成实名认证。您就可以获取好友现货交易20%手续费返佣。您可在此页面追踪邀请进度和任务完成情况。 */}
                            {rewardRouter.isRealname == '1' ? t('invite.ruleDesc31', { date: rewardRouter.validTime, count: rewardRouter.rechargeLimit, coinName: rewardRouter.coinName, rebateRatio: rewardRouter.rebateRatio })
                                : t('invite.ruleDesc32', { date: rewardRouter.validTime, count: rewardRouter.rechargeLimit, coinName: rewardRouter.coinName, rebateRatio: rewardRouter.rebateRatio })}
                        </li>
                        <li className="flex align-base mt-6">
                            <Iconify icon="carbon:diamond-solid" className="theme_color mr-2" size={10} />
                            {/* 奖励发放时间：我们将在每日02:00（UTC+8）发放前一日邀请奖励至您的现货账户，若未收到请及时与我们的客服联系。 */}
                            {t('invite.ruleDesc4')}
                        </li>
                    </ul>
                </div>
                <div className={`${styles.content_box}`}>
                    <h3 className={`font-32 font-w-500 mb-10`}>
                        {/* 我的邀请 */}
                        {t('invite.myInvite2.title')}
                    </h3>
                    <Skeleton active loading={inviteCountLoading} title={false}
                        paragraph={{ rows: 3 }}
                        className={`${styles.content_list}`} >

                        <ul className={`${styles.content_list}  font-16 font-w-400  flex-x flex-wrap`}>
                            <li className={`${styles.tip_color} ${styles.auto_item} flex-1`}>
                                <p className={`font-14 font-w-400`}>{t('invite.myInvite2.tip1')}</p>
                                <p className={`font-32 font-w-700 ${styles.title_color}`}>{inviteCount?.userInviteCount || 0}</p>
                            </li>
                            <li className={`${styles.tip_color} ${styles.auto_item} flex-1`}>
                                <p className={`font-14 font-w-400`}>{t('invite.myInvite2.tip2')}</p>
                                <p className={`font-32 font-w-700 ${styles.title_color}`}>{inviteCount?.userInviteSuccessCount || 0}</p>
                            </li>
                            <li className={`${styles.tip_color} ${styles.auto_item} flex-1`}>
                                <p className={`font-14 font-w-400`}>{t('invite.myInvite2.tip3')}</p>
                                <p className={`font-32 font-w-700 ${styles.title_color}`}>{inviteCount?.accumulateMoney || 0}</p>
                            </li>
                            <li className={`${styles.tip_color} ${styles.auto_item} flex-1`}>
                                <p className={`font-14 font-w-400`}>{`${t('invite.myInvite2.tip5')}(${rateKey.split('-')[0].trim() || '--'})`}</p>
                                <p className={`font-32 font-w-700 ${styles.title_color}`}>
                                    {/* {'暂无'} */}
                                    {inviteCount?.accumulateMoney ? getRate('USDT', inviteCount?.accumulateMoney, rateKey.split('-')[0].trim()).rate : 0}
                                    {/* <span className={`font-14 font-w-500 ml-1 ${styles.tip_color}`}>≈  100.02 USDT</span> */}
                                </p>
                            </li>
                        </ul>
                    </Skeleton>

                </div>
                <div className={`${styles.content_box}`}>
                    <h3 className={`font-32 font-w-500 mb-10`}>
                        {/* 邀请详情 */}
                        {t('invite.inviteDetails')}
                    </h3>
                    <ConfigProvider
                        theme={{
                            components: {
                                Tabs: {
                                    itemActiveColor: "var(--tip-color)", //激活态颜色  
                                    itemSelectedColor: "var(--text-color5)", //选中态颜色
                                    horizontalMargin: "0 0 0 0",
                                    itemColor: "var(--text-color6)",
                                    inkBarColor: "var(--text-color5)", //指示条颜色
                                    // horizontalItemPaddingLG:"24px 8px",
                                    // horizontalItemPadding:"24px 8px",
                                    // horizontalItemPaddingSM:"24px 8px",
                                },
                            },
                        }}>
                        <Tabs items={items}
                            className="custom-tabs"
                            indicator={{ size: (origin) => origin - 35, align: 'center' }}
                        />
                    </ConfigProvider>
                </div>
            </div>

        </div >
    </>
    );
};

export default InviteContent;