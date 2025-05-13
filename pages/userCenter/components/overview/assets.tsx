import React from 'react';
// import UserCenterLayout from '@/components/UserCenterLayout/Layout';
import styles from "../../styles/overview.module.css"
import { Iconify } from "@/components/icon"
import { CSSProperties, useState, useEffect } from "react"
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

interface chartDataType {
    balance: string,
    time: string,
    recharge: string,
    symbol: string
}
const AssetsPage: React.FC = observer(() => {
    const [loginInfo, setLoginInfo] = useState<LoginInfoType>({} as LoginInfoType);
    const { t } = useTranslation('userCenter');
    const router = useRouter();
    const [banlanceShow, setBanlanceShow] = useState(true)
    // 获取币种列表
    // const { coinList } = useCoinList();
    const rateKey = appStore.getRateKey().replace(/\s+/g, ''); // 汇率key

    const [tableData, setTableData] = useState<DataType[]>([]);
    const [balanceByDay, setBalanceByDay] = useState<chartDataType[]>([]);

    const [balanceAll, setBalanceAll] = useState({
        usdBalance: 0,
        usdt: 0,
        symbol: ''
    });
    const [balanceDay, setBalanceDay] = useState({
        usdBalance: 0,
        // cnyBalance: 0,
    });
    const [todayEarnings, setTodayEarnings] = useState({
        usdBalance: 0,
        // cnyBalance: 0,
    });
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
                const usdRate = getRate('USDT', totalUsd, rateKeyName) //获取汇率
                setBalanceAll({
                    usdBalance: Number(usdRate.rate) || 0,
                    usdt: totalUsd,
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
                const usdRate = await getRate('USDT', res.data[0].balance, rateKeyName);
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
                    usdBalance: Number(usdRate.rate) || 0
                    // cnyBalance: Number(cnyRate.rate) || 0
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
                const usdRate = await getRate('USDT', res.data[0].balance, rateKeyName);
                // const cnyRate = await getRate('USDT', res.data[0].balance, 'CNY');
                setTodayEarnings({
                    usdBalance: Number(usdRate.rate) || 0
                    // cnyBalance: Number(cnyRate.rate) || 0
                });
            }
        } catch (error) {
            toast.error(String(error));
        }
    };
    const waxAndWane = (balance: number | string, balanceLastDay: number | string, toUp: number | string) => {
        // balance今日余额 balanceLastDay昨日余额 toUp今日充值
        return cut(Number(cut(Number(balance), Number(balanceLastDay))), Number(toUp))
    }

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
                    {banlanceShow ? <> <p className='font-32 font-w-700'>{balanceAll.usdt} USDT</p> 
                        <p className={`${styles.tip_color} font-14`}>≈&nbsp;{balanceAll.symbol}&nbsp;{balanceAll.usdBalance}</p></> :
                        <>
                            <p className='font-32 font-w-700'>******</p>
                            <p className={`${styles.tip_color} font-14`}>******</p>
                        </>}
                    <div className='font-14 mt-4 flex-x align-center'>
                        {/* 今日盈亏 */}
                        {t('overview.assets.todayProfitLoss')}
                        <Iconify icon="ep:warning" className='cursor-pointer mx-1' size={12} />
                        {banlanceShow ? <span className={`${Number(waxAndWane(balanceAll.usdBalance, balanceDay.usdBalance, todayEarnings.usdBalance)) > 0 ? styles.success_icon : Number(waxAndWane(balanceAll.usdBalance, balanceDay.usdBalance, todayEarnings.usdBalance)) < 0 ? styles.error_icon : styles.tip_color} font-12`}>
                            {Number(waxAndWane(balanceAll.usdBalance, balanceDay.usdBalance, todayEarnings.usdBalance)) < 0 ? "-" : "+"}
                            &nbsp;{balanceAll.symbol}&nbsp;
                            {waxAndWane(balanceAll.usdBalance, balanceDay.usdBalance, todayEarnings.usdBalance)}
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