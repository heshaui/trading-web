import appStore from '@/store';
import { nul,roundDown } from '@/utils';
/*
* @param symbolName 币种符号
* @param num 数量
* @param rateName 汇率符号
* @returns 汇率
*/
export const getRate = (symbolName: string,priceNum:string|number, rateName: string = 'USD') => {
    // 获取汇率数据 usdt-$
    const rateData = appStore.getRateData() || [];
    // 获取币种信息 coin-usdt
    const coinInfo = appStore.getCoinList() || [];

    // 获取币种价格
    const getCoinPrice = () => {
        // 如果是 USDT，直接返回 1
        if (symbolName.toUpperCase() === 'USDT') {
            return 1;
        }

        // 查找币种信息
        const coin = coinInfo.find((item: any) => 
            item.coinSymbol === symbolName
        );

        // 返回价格，如果没有则返回 0
        return Number(coin?.price) || 0;
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
        const num1 = nul(price, exchangeRate);
        const num2 = nul(num1, Number(priceNum));
        // 使用 nul 函数计算最终结果
        return roundDown(num2,accuracy||2);
    };

    return {
        ratetext:`${symbol} ${calculateRate()}`, // 汇率返回内容
        rate:calculateRate(), // 汇率
        symbol:symbol, // 汇率符号
        shortName:shortName // 汇率名称
    };
};