import React from 'react';
import styles from '../styles/spotChartAssets.module.css'
import { useTranslation } from 'next-i18next';
import { ROUTER_KEY_ASSETS } from '@/config/apiConfig';
import { useRouter } from 'next/router';
import { observer } from 'mobx-react-lite';
import appStore from '@/store';
import { useEffect, useState } from 'react';
import { getUserBalanceAll } from '@/services/assets';
import { toast } from 'sonner';
import { lastD, roundDown } from '@/utils';
import { Skeleton } from 'antd';
import { useCoinList } from '@/hooks/use-coinList';
import { useAuth } from '@/context/AuthContext';
interface DataType {
    id: number,
    userId: number,
    platformType: number,
    deviceNo: string,
    ip: string,
    address: string,
    token: number,
    tokenTime: number,
    createTime: number,
    updateTime: number,
    tenantId: string,
}
type Props = {
    orderUpdateFlag?: number,
    updateAssets?: number
}
const SpotAssetsPage = observer(({orderUpdateFlag,updateAssets}:Props) => {
    const { t } = useTranslation(['spot']);
    const router = useRouter();
    const updateOrder = appStore.getUpdateFlag()

    // 获取币种列表
    const { coinList } = useCoinList();
    const currentPair = appStore.getCurrentPair() || appStore.currencyPairs[0];
    const [userBalanceAllData, setUserBalanceAllData] = useState<any>([]);
    const [loading, setLoading] = useState(true);
     const userToken = appStore.getUserToken();
    const getUserBalanceAllData = async () => {
        if(!userToken) return
        setLoading(true);
        try {
            const res = await getUserBalanceAll();
            if (res.code === '0') {
                setUserBalanceAllData(res.data || []);
            }
        } catch (error) {
            toast.error(String(error));
        } finally {
            setLoading(false);
        }
    }
    const roundNum=(coinName:string)=>{
        const balance=lastD(userBalanceAllData.find((item: any) => item.coinName === coinName)?.balance || 0)
        // const coin = coinList.find((item: any) => item.coinName === coinName);
        return roundDown(balance,8);
    }
    useEffect(() => {
        getUserBalanceAllData();
    }, [updateOrder.orderPlace, updateOrder.orderDelect,updateOrder.orderUpdate,updateAssets])
    return (<>
        <div className={`${styles.card_header} flex align-center w-full`}>
            {t('spot.assets.title')}
        </div>
        <div className={`px-6 py-6 w-full ${styles.spot_main}`}>
            <ul className={`${styles.tip_color1} font-14 font-w-400`}>
                <Skeleton active
                    loading={loading}
                    title={false}
                    paragraph={{ rows: 2 }}
                    className={`mb-4`} >
                    <li className='flex justify-between align-center mb-5'>
                        <div>{currentPair?.coinSymbol || '--'}{t('spot.assets.availableAssets')}</div>
                        {/* <div>{lastD(userBalanceAllData.find((item: any) => item.coinName === currentPair?.coinSymbol)?.balance || 0) || 0}</div> */}
                       {userToken ? <div>{roundNum(currentPair?.coinSymbol || '--')}</div> : <div>--</div>}
                    </li>
                    <li className='flex justify-between align-center mb-5' >
                        <div>{currentPair?.baseSymbol || '--'}{t('spot.assets.availableAssets')}</div>
                        {/* <div>{lastD(userBalanceAllData.find((item: any) => item.coinName === currentPair?.baseSymbol)?.balance || 0) || 0}</div> */}
                        {userToken ? <div>{roundNum(currentPair?.baseSymbol || '--')}</div> : <div>--</div>}
                    </li>
                </Skeleton>
            </ul>
            <div className={`flex-x-cc w-full `}>
                <button type='button' className={`cancel_btn2 ${styles.btn_style} mr-4`}
                    onClick={() => {
                        router.push(ROUTER_KEY_ASSETS.TOP_UP)
                    }}
                >{t('spot.columns.deposit')}</button>
                <button type='button' className={`cancel_btn2 ${styles.btn_style}`}
                    onClick={() => {
                        router.push(ROUTER_KEY_ASSETS.WITHDRAW_MONEY)
                    }}>{t('spot.columns.withdraw')}</button>
            </div>
        </div>
    </>
    );
});

export default SpotAssetsPage