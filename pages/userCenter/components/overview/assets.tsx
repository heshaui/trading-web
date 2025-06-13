import React, { useState, useEffect, useRef, useCallback } from 'react';
// import UserCenterLayout from '@/components/UserCenterLayout/Layout';
import styles from "../../styles/overview.module.css"
import { Iconify } from "@/components/icon"
import { CSSProperties } from "react"
import AssetsAreaChart from '../charts/AreaChart';
import { useRouter } from 'next/router';
import { toast } from "sonner";
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { getLoginInfo } from '@/services/overview';
import { LOCAL_STORAGE_KEY } from '@/config/apiConfig';
import { ROUTER_KEY_ASSETS } from '@/config/apiConfig';
import { LoginInfoType } from '@/type/userCenter/overview'
import { getUserBalanceAll, getUserBalanceByDay, getTodayEarnings } from '@/services/assets';
import { DataType } from '@/type/assets/assetsAccount/assets'
import { add, roundDown, cut, nul } from '@/utils'
import { useCoinList } from '@/hooks/use-coinList';
import { getRate, getCoinRate } from '@/utils/getUseRate';
import appStore from '@/store';
import { observer } from 'mobx-react-lite';
import WebSocketService from '@/utils/websocket';
import { getToken } from '@/request';
import { BalanceAllType, TodayEarningsType, YesterdayBalanceType } from '@/type/assets/assetsAccount/assets'

interface chartDataType {
    balance: string,
    time: string,
    recharge: string,
    symbol: string
}
const AssetsPage: React.FC = observer(() => {
    const { t } = useTranslation('userCenter');
    const router = useRouter();
    const [banlanceShow, setBanlanceShow] = useState(true)
    // 获取币种列表
    // const { coinList } = useCoinList();
    const rateKey = appStore.getRateKey()?.replace(/\s+/g, ''); // 汇率key
    const userInfo = appStore.getUserInfo();
    const [tableData, setTableData] = useState<DataType[]>([]);
    const [balanceByDay, setBalanceByDay] = useState<chartDataType[]>([]);
    // 添加客户端渲染标记
    const [isClient, setIsClient] = useState(false);
    const [balanceAll, setBalanceAll] = useState<BalanceAllType>({} as BalanceAllType);
    const [balanceDay, setBalanceDay] = useState<YesterdayBalanceType>({} as YesterdayBalanceType);
    const [todayEarnings, setTodayEarnings] = useState<TodayEarningsType>({} as TodayEarningsType);
    const balanceDataRef = useRef<WebSocketService | null>(null);

    // 获取所有币种余额
    const getUserBalanceAllData = async () => {
        // setTableLoading(true);
        try {
            const res = await getUserBalanceAll();
            if (res.code === '0') {
                setTableData(res.data || []);
                const totalUsd = res.data.reduce((sum: number, curr: any) => {
                    const coinTotal = add(
                        add(curr.balance || 0, curr.releaseBalance || 0),
                        curr.frozenBalance || 0
                    );
                    const balance = getCoinRate(curr.coinName, coinTotal).coinRate
                    return sum + Number(balance) || 0;
                }, 0);
                const rateKeyName = rateKey.split('-')[0].trim()
                const usdRate = getRate('USDT', totalUsd || 0, rateKeyName) //获取汇率
                setBalanceAll({
                    usdBalance: Number(usdRate.rate) || 0,
                    balance: totalUsd,
                    symbol: usdRate.symbol
                });
            }
        } catch (error) {
            toast.error(String(error));
        } finally {
            // setTableLoading(false);
        }
    };


    // 获取用户余额以及充值金额 日K线
    const getUserBalanceDay = async () => {
        try {
            const res = await getUserBalanceByDay();
            if (res.code === '0') {
                const rateKeyName = rateKey.split('-')[0].trim()
                // const usdRate = await getRate('USDT', res.data[0].balance, rateKeyName);
                // const withdraw = getRate('USDT', res.data[0].withdraw, rateKeyName)

                const usdBalance = await getRate('USDT', res.data?.[0]?.balance || 0, rateKeyName);
                const usdRecharge = await getRate('USDT', res.data?.[0]?.recharge || 0, rateKeyName);
                const usdWithdraw = await getRate('USDT', res.data?.[0]?.withdraw || 0, rateKeyName)
                const initData = res.data.map((item: any) => {
                    const usdBalance = getRate('USDT', item.balance, rateKeyName)
                    return {
                        balance: Number(usdBalance.rate) || 0,
                        time: item.time,
                        recharge: Number(item.recharge) || 0,
                        symbol: usdBalance.symbol
                    }
                }).sort((a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime());
                setBalanceByDay(initData);
                setBalanceDay({
                    balanceAll: res.data?.[0]?.balance || 0,
                    balance: res.data?.[0]?.recharge || 0,
                    withdraw: res.data?.[0]?.withdraw || 0,
                    usdBalanceAll: usdBalance.rate || 0,
                    usdBalance: usdRecharge.rate || 0,
                    usdWithdraw: usdWithdraw.rate || 0
                });
            }
        } catch (error) {
            toast.error(String(error));
        }
    };
    // 获取今日充值
    const getTodayEarningsData = async () => {
        try {
            const res = await getTodayEarnings();
            if (res.code === '0') {
                const rateKeyName = rateKey.split('-')[0].trim()
                const usdBalance = await getRate('USDT', res.data?.balance || 0, rateKeyName);
                const usdWithdraw = await getRate('USDT', res.data?.withdraw || 0, rateKeyName);
                const usdGift = await getRate('USDT', res.data?.gift || 0, rateKeyName);

                setTodayEarnings({
                    usdBalance: Number(usdBalance.rate) || 0,
                    usdWithdraw: Number(usdWithdraw.rate) || 0,
                    usdGift: Number(usdGift.rate) || 0,
                    balance: res.data?.balance || 0,
                    withdraw: res.data?.withdraw || 0,
                    gift: res.data?.gift || 0
                });
            }
        } catch (error) {
            toast.error(String(error));
        }
    };
    const waxAndWane = () => {
        // const waxAndWane = (balance: number | string, balanceLastDay: number | string, toUp: number | string) => {
        // const banlanceShow =cut(Number(cut(Number(balance), Number(balanceLastDay))), Number(toUp))
        const banlance1 = cut(Number(cut(Number(balanceAll.usdBalance), Number(balanceDay.usdBalanceAll))), Number(todayEarnings.usdBalance))
        const banlanceShow = add(add(Number(banlance1), Number(balanceDay.usdWithdraw)), Number(todayEarnings.usdGift))

        return banlanceShow || 0
    }
    // 设置WebSocket连接
    const setupBalanceWebSocket = useCallback(() => {
        // 如果已经有连接，不要重复创建
        if (balanceDataRef.current) return;

        // 创建新的WebSocket连接
        const token = getToken();
        if (!token) {
            console.error('No token found');
            return;
        }

        const websocket = new WebSocketService(`${process.env.NEXT_PUBLIC_ASSETS_API_BASE}/ws/asset?userId=${userInfo.userId}`, {
            headers: {
                'Authorization': `${getToken()}`, // 获取 token（可选）
                'sa-token': `${getToken()}`,
            }
        });
        balanceDataRef.current = websocket;

        websocket.connect((message: string) => {
            console.log('收到WebSocket消息:', message);

            try {
                const data = JSON.parse(message);
                console.log('解析后的数据:', data);

                if (data.type === '__ping__') {
                    websocket.send(JSON.stringify({ type: '__pong__' }));
                    return;
                }

                // 更新余额数据
                if (data && Array.isArray(data)) {
                    setTableData(data);

                    // 重新计算总余额
                    const totalUsd = data.reduce((sum: number, curr: any) => {
                        const coinTotal = add(
                            add(curr.balance || 0, curr.releaseBalance || 0),
                            curr.frozenBalance || 0
                        );
                        const balance = getCoinRate(curr.coinName, coinTotal).coinRate
                        return sum + Number(balance) || 0;
                    }, 0);

                    const rateKeyName = rateKey.split('-')[0].trim()
                    const usdRate = getRate('USDT', totalUsd, rateKeyName);

                    setBalanceAll({
                        usdBalance: Number(usdRate.rate) || 0,
                        balance: totalUsd,
                        symbol: usdRate.symbol
                    });
                }
            } catch (error) {
                console.error('WebSocket数据处理错误:', error);
            }
        });
    }, [userInfo])

    // useEffect(() => {
    //     if (!userInfo?.userId) return;

    //     // 初始化WebSocket连接
    //     setupBalanceWebSocket();

    //     // 组件卸载时清理WebSocket连接
    //     return () => {
    //         if (balanceDataRef.current) {
    //             balanceDataRef.current.close();
    //             balanceDataRef.current = null;
    //         }
    //     };
    // }, [userInfo?.userId, setupBalanceWebSocket]);
    // useEffect(() => {
    //     if (!isClient || !userInfo || typeof window === 'undefined') return;

    //     // 安全地使用currentPair
    //     setupBalanceWebSocket();
    // }, [isClient, userInfo]);
    useEffect(() => {
        getUserBalanceAllData();
        getUserBalanceDay()
        getTodayEarningsData()
    }, [rateKey]);
    useEffect(() => {
        // 只在客户端执
        if (typeof window === 'undefined') return;

        try {
            appStore.loadCurrencyPairs()
        } catch (error) {
            console.error('初始化货币对数据错误:', error);
        }
    }, []);
    return (< >
        {/* 资产 */}
        <div className={`${styles.card_bgc} ${styles.assets_box} mt-6`}>
            <div className={`flex-row justify-between font-18 font-w-500`} >
                {/* 资产 */}
                {t('overview.assets.title')}
                <button type='button' onClick={() => router.push(ROUTER_KEY_ASSETS.ACCOUNT)}>
                    <Iconify icon="mingcute:arrow-right-line" className='cursor-pointer' size={20} />
                </button>
            </div>
            <div className={`flex-row justify-between align-center`}>
                <div className={`${styles.assets_main}`} >
                    <div className={`${styles.tip_color} mt-2`} >
                        {/* 总资产折合 */}
                        {t('overview.assets.totalAssets')}
                        <button type='button' className='ml-1'
                            onClick={() => setBanlanceShow(!banlanceShow)}
                        >
                            {banlanceShow ? <Iconify icon={'clarity:eye-show-line'} size={20} /> : <Iconify icon={'ep:hide'} size={18} />}
                        </button>
                    </div>
                    {banlanceShow ? <> <p className='font-32 font-w-700'>{balanceAll.balance} USDT
                        {/* {tableData?.[0]?.balance || '--'} */}
                    </p>
                        <p className={`${styles.tip_color} font-14`}>≈&nbsp;{balanceAll.symbol}&nbsp;{balanceAll.usdBalance}</p></> :
                        <>
                            <p className='font-32 font-w-700'>******</p>
                            <p className={`${styles.tip_color} font-14`}>******</p>
                        </>}
                    <div className='font-14 mt-4 flex-x align-center'>
                        {/* 今日盈亏 */}
                        {t('overview.assets.todayProfitLoss')}
                        <Iconify icon="ep:warning" className='cursor-pointer mx-1' size={12} />
                        {banlanceShow ? <span className={`${Number(waxAndWane()) > 0 ? styles.success_icon : Number(waxAndWane()) < 0 ? styles.error_icon : styles.tip_color} font-12`}>
                            {Number(waxAndWane()) < 0 ? "-" : "+"}
                            &nbsp;{balanceAll.symbol}&nbsp;
                            {Number(waxAndWane()) ? Math.abs(Number(waxAndWane())) : 0}
                        </span> :
                            <span className={`${styles.tip_color} font-12 flex-x-cc`}>******</span>
                        }
                    </div>
                    <div className='mt-5'>
                        <button type='button' className={`btn-color font-14 font-w-500  ${styles.btn} mr-4`}
                            onClick={() => router.push(ROUTER_KEY_ASSETS.TOP_UP)}
                        >
                            {/* 充值 */}
                            {t('overview.assets.deposit')}
                        </button>
                        <button type='button' className={`btn-disable font-14 font-w-500  ${styles.btn}`}
                            onClick={() => router.push(ROUTER_KEY_ASSETS.WITHDRAW_MONEY)}
                        >
                            {/* 提现 */}
                            {t('overview.assets.withdraw')}
                        </button>
                    </div>
                </div>
                <div className={`${styles.assets_chart}`} >
                    <AssetsAreaChart chartData={balanceByDay} />
                </div>
            </div>
        </div>
    </>);
});
export default AssetsPage;