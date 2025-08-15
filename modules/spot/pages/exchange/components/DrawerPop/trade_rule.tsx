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

// 根据精度值生成对应的最小小数值
const getMinimumDecimal = (scale: number | undefined): string => {
  if (!scale || scale <= 0) return '1';
  
  // 生成对应精度的小数，例如：scale为4时返回0.0001
  return `0.${'0'.repeat(scale-1)}1`;
};

const TradeRule = observer(() => {
    const price=1
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
                    {t('spot.tradeRule.maxOrderAmount')}
                    <span className={`${styles.tip_color} font-w-400 mx-1 font-14`}>
                        {currentPair?.maxBaseVolume}{currentPair?.baseSymbol}
                    </span>

                </li>
                <li className='flex-x align-center justify-between mt-5'>
                    {t('spot.tradeRule.minOrderAmount')}
                    <span className={`${styles.tip_color} font-w-400  mx-1 font-14`}>
                        {currentPair?.minBaseVolume}{currentPair?.baseSymbol}
                    </span>
                </li>
                <li className='flex-x align-center justify-between mt-5'>
                    {t('spot.tradeRule.maxOrderQuantity')}
                    <span className={`${styles.tip_color} font-w-400  mx-1 font-14`}>
                        {currentPair?.maxVolume}{currentPair?.coinSymbol}
                    </span>
                </li>
                <li className='flex-x align-center justify-between mt-5'>
                    {t('spot.tradeRule.minOrderQuantity')}
                    <span className={`${styles.tip_color} font-w-400  mx-1 font-14`}>
                        {currentPair?.minVolume}{currentPair?.coinSymbol}
                    </span>
                </li>

                 <li className='flex-x align-center justify-between mt-5'>
                    {t('spot.tradeRule.minPriceFluctuation')}
                    <span className={`${styles.tip_color} font-w-400  mx-1 font-14`}>
                       {getMinimumDecimal(currentPair?.coinScale)}{currentPair?.coinSymbol}
                    </span>
                </li>
                <li className='flex-x align-center justify-between mt-5'>
                    {t('spot.tradeRule.minQuantityFluctuation')}
                    <span className={`${styles.tip_color} font-w-400  mx-1 font-14`}>
                     {currentPair?.baseCoinScale}{currentPair?.baseSymbol}
                    </span>
                </li> 
            </ul>
        </>
    )
})
export default TradeRule;