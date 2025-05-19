import appStore from '@/store';
import { nul, roundDown, division } from '@/utils';
import BigNumber from 'bignumber.js';
/*
* @param symbolName 币种符号
* @param num 数量
* @param rateName 汇率符号
* @returns ratetext 汇率返回内容,rate 汇率,symbol 汇率符号,shortName 汇率名称
*/
// 法币汇率换算
export const getRate = (symbolName: string,priceNum:string|number, rateName: string = 'USD',baseSymbolName: string='USDT') => {
    try {

    // 获取汇率数据 usdt-$
    const rateData = appStore.getRateData() || [];
    // 获取币种信息 coin-usdt
    const coinInfo =appStore.getCurrentPairList()|| [] //appStore.getCoinList() 
    // ||appStore.getCoinList() || [];

    // 获取币种价格
    const getCoinPrice = () => {
        // 如果是 USDT，直接返回 1
        if (symbolName.toUpperCase() === 'USDT') {
            return 1;
        }

        // 查找币种信息
        const coin = coinInfo.find((item: any) => 
            item.coinSymbol === symbolName&&item.baseSymbol===baseSymbolName
        // item.coinSymbol === symbolName
        );

        // 返回价格，如果没有则返回 0
        return coin?.price&&Number(coin?.price) > 0?Number(coin?.price) :
        coin?.yesterdayPrice&&Number(coin?.yesterdayPrice) > 0?Number(coin?.yesterdayPrice) :
         coin?.openingPrice&&Number(coin?.openingPrice) > 0?Number(coin?.openingPrice) :0;
    };

    // 获取汇率
    const getExchangeRate = () => {
        const rate = rateData.find((item: any) => 
            item.shortName === rateName.trim()
        );
        
        return {
            ...rate,
            exchangeRate: Number(rate?.exchangeRate),
            symbol: rate?.symbol,
            // symbol: rateName,
            shortName: rate?.shortName
        }
    };

    const {exchangeRate,symbol,shortName,accuracy} = getExchangeRate();
    // 计算最终结果
    const calculateRate = () => {
        const price = getCoinPrice();

        // 如果没有汇率数据，返回 '--'
        if (!exchangeRate) {
            return '--';
        }
        // 使用 BigNumber 保持 priceNum 的精度
        const priceNumBN = new BigNumber(priceNum);
        const num1 = nul(price, exchangeRate);
        // console.log(num1, priceNumBN.toNumber(), priceNum, 999);
        const num2 = nul(num1, priceNumBN.toNumber());
        // 使用 nul 函数计算最终结果
        // return roundDown(num2,accuracy||2);
        return num2
    };

    return {
        ratetext:`${symbol} ${calculateRate()}`, // 汇率返回内容
        rate:calculateRate(), // 汇率结果
        symbol:symbol, // 汇率符号
        shortName:shortName // 汇率名称
    };
            
} catch (error) {
     // 发生错误时返回默认值
     console.error('Error in getRate:', error);
     return {
         ratetext: '--',
         rate: '--',
         symbol: '',
         shortName: ''
     };    
}
};
/*
* @param symbolName 币种符号
* @param num 数量
* @param baseSymbolName 基础币种符号
* @param type 方向 0:正向-币种换算 基础币种 1:反向-基础币种换算 币种
* @returns 汇率
*/
// 币种汇率换算
export const getCoinRate = (symbolName: string,priceNum:string|number, baseSymbolName: string = 'USDT',type:number=0) => {

    try {

    // 获取币种信息 coin-usdt
    const coinInfo =appStore.getCurrentPairList()|| [] //appStore.getCoinList()

    // 获取币种价格
    const getCoinPrice = () => {
        // 如果是 USDT，直接返回 1
        if (symbolName.toUpperCase() === 'USDT') {
            return 1;
        }

        // 查找币种信息
        const coin = coinInfo.find((item: any) => 
            item.coinSymbol === symbolName&&item.baseSymbol===baseSymbolName
        );

        // 返回价格，如果没有则返回 0
        return coin?.price&&Number(coin?.price) > 0?Number(coin?.price) :
        coin?.yesterdayPrice&&Number(coin?.yesterdayPrice) > 0?Number(coin?.yesterdayPrice) :
         coin?.openingPrice&&Number(coin?.openingPrice) > 0?Number(coin?.openingPrice) :0;
    };
    const price = getCoinPrice();
    let useRate
    if(type === 0){
        useRate = Number(priceNum) === 0 ? 0 : nul(Number(priceNum), price || 0);
    }else if(type === 1){
        useRate = price === 0 ? 0 : division(Number(priceNum),price);
    }
    return {
        coinRate:useRate, // 价格
        price:price||0,
    };
            
} catch (error) {
     // 发生错误时返回默认值
     console.error('Error in getCoinRate:', error);
     return {
        coinRate:0,
         price:0
     };    
}
};

// 币对精度
export const getRound = (symbolPairs: string,num:string|number,symbolName?: string, baseSymbolName?: string,) => {

    try {
    const coinList = appStore.getCurrentPairList() || appStore.currencyPairs; // 货币对列表
        const coin = coinList.find((item: any) => {
            return (item.coinSymbol === symbolName&&item.baseSymbol===baseSymbolName)||
            (item.symbol===symbolPairs)
        });
        const scaleResult = roundDown(num,coin?.coinScale||0);
        const baseScaleResult = roundDown(num,coin?.baseCoinScale||0);
        return {
            scaleResult: scaleResult,
            baseScaleResult: baseScaleResult,
            coinScale:coin?.coinScale||0,
            baseCoinScale: coin?.baseCoinScale || 0,
            baseSymbol: coin?.baseSymbol || '--',
            coinSymbol: coin?.coinSymbol || '--'
        }
    } catch (error) {
     // 发生错误时返回默认值
     console.error('Error in getRound:', error);
     return {
        scaleResult:0,
        baseScaleResult:0,
        coinScale:0,
        baseCoinScale: 0,
        baseSymbol: '--',
        coinSymbol: '--'
     };    
}
};