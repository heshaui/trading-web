'use client'
import React from 'react';
import styles from '../styles/spotHeader_pop.module.css'
import { ConfigProvider, Drawer, Switch, Tooltip, Button } from "antd";
import { Iconify } from "@/components/icon"
import { useState, useEffect, useRef } from "react";
import { useTranslation } from 'next-i18next';
import { observer } from 'mobx-react-lite';
import appStore from '@/store';
import { useAuth } from '@/context/AuthContext';
import { division } from '@/utils';
import { useRouter } from 'next/navigation';
import { ROUTER_KEY_OPEN } from '@/config/apiConfig';
import { usePopTypeContext, PopTypeEnum } from '@/hooks/usePopProvider';

const TradeRule = observer(() => {

    const { t } = useTranslation(['spot']);
    const { isLoggedIn } = useAuth();
    const router = useRouter();
    const {popType, setPopType } = usePopTypeContext();



    const currentPair = appStore.getCurrentPair() || appStore.currencyPairs[0];

    if(popType !== PopTypeEnum.TRADE_RULE) return null


    return (
        <>
            <ul className={`${styles.title_color} px-5 mt-5 font-16 font-w-500`}>
                <li className='flex-x align-center justify-between '>
                    最大下单金额
                    <span className={`${styles.tip_color} font-w-400 mx-1 font-14`}>
                        {currentPair?.maxBaseVolume}{currentPair?.baseSymbol}
                    </span>

                </li>
                <li className='flex-x align-center justify-between mt-5'>
                    最小下单金额
                    <span className={`${styles.tip_color} font-w-400  mx-1 font-14`}>
                        {currentPair?.minBaseVolume}{currentPair?.baseSymbol}
                    </span>
                </li>
                <li className='flex-x align-center justify-between mt-5'>
                    最大下单数量
                    <span className={`${styles.tip_color} font-w-400  mx-1 font-14`}>
                        {currentPair?.maxVolume}{currentPair?.coinSymbol}
                    </span>
                </li>
                <li className='flex-x align-center justify-between mt-5'>
                    最小下单数量
                    <span className={`${styles.tip_color} font-w-400  mx-1 font-14`}>
                        {currentPair?.minVolume}{currentPair?.coinSymbol}
                    </span>
                </li>

                {/* <li className='flex-x align-center justify-between mt-5'>
                    最小价格波动
                    <span className={`${styles.tip_color} font-w-400  mx-1 font-14`}>
                        {currentPair?.minPriceChange}
                    </span>
                </li>
                <li className='flex-x align-center justify-between mt-5'>
                    最小数量波动
                    <span className={`${styles.tip_color} font-w-400  mx-1 font-14`}>
                        {currentPair?.minPriceChange}
                    </span>
                </li> */}
            </ul>
        </>
    )
})
export default TradeRule;