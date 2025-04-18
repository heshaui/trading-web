import { getExchangeGroup, getExchangeCoinList, getUserExchangeCoinTypeList, getExchangeCoinAllPrice } from '@/services/spot';

// 币对接口数据类型
export interface CurrencyPairType {
    id: string,
    symbol: string,
    baseSymbol: string,
    coinSymbol: string,
    groupStatus: string,
    isFavorite?: boolean,
    baseCoinScale: number,
    buyFee: number,
    classLabel: string,
    coinScale: number,
    depthFour: number,
    depthOne: number,
    depthThree: number,
    depthTwo: number,
    enable: number,
    enableBuy: number,
    enableSell: number,
    maxBaseVolume: number,
    maxCurrentPrice: number,
    maxMarketPrice: number,
    maxVolume: number,
    minBaseVolume: number,
    minVolume: number,
    openingPrice: number,
    priceOffset: number,
    sellFee: number,
    show: number,
    price?: number,             // 当前价格
    yesterdayPrice?: number,    // 昨日价格
    priceChangePercent?: number // 价格变化百分比
}

// 获取所有币对数据
export async function fetchAllCurrencyPairs(userToken: string | null) {
    try {
        // 1. 获取币种列表
        const coinListResponse = await getExchangeCoinList();
        if (coinListResponse.code !== '0') {
            throw new Error('Failed to load coin list');
        }
        
        const coinList = coinListResponse.data || [];
        console.log('coinList', coinList);
        
        // 2. 获取交易对组信息
        const groupResponse = await getExchangeGroup();
        if (groupResponse.code !== '0') {
            throw new Error('Failed to load exchange groups');
        }
        
        const groups = groupResponse.data || [];
        console.log('groups', groups);
        
        // 3. 获取用户自选币对（如果用户已登录）
        let favoriteCoins: any[] = [];

        try {
            const favoriteResponse = await getUserExchangeCoinTypeList();
            if (favoriteResponse.code === '0') {
                console.log('favoriteResponse', favoriteResponse);
                favoriteCoins = favoriteResponse.data || [];
            }
        } catch (error) {
            console.error('Error loading favorite coins:', error);
        }
        
        // 4. 获取币对价格数据
        const priceResponse = await getExchangeCoinAllPrice();
        let priceData: any[] = [];
        if (priceResponse.code === '0') {
            priceData = priceResponse.data || [];
            console.log('priceData', priceData);
        }
        
        // 5. 合并数据并转换为CurrencyPairType格式
        const processedPairs: CurrencyPairType[] = [];
        
        coinList.forEach((coin: any) => {
            // 查找对应的组信息
            const group = groups.find((g: any) => 
                g.baseSymbol === coin.baseSymbol && 
                g.coinSymbol === coin.coinSymbol
            );
            
            // 确定是否为自选币对
            const pairId = `${coin.coinSymbol}_${coin.baseSymbol}`;
            const isFavorite = favoriteCoins.some((favCoin: any) => 
                favCoin.coinSymbol === coin.coinSymbol && 
                favCoin.baseSymbol === coin.baseSymbol
            );
            
            // 查找价格数据
            const priceInfo = priceData.find((p: any) => 
                p.baseSymbol === coin.baseSymbol && 
                p.coinSymbol === coin.coinSymbol
            );
            
            // 计算价格变化百分比
            let priceChangePercent = 0;
            if (priceInfo && priceInfo.yesterdayPrice && priceInfo.yesterdayPrice > 0) {
                priceChangePercent = ((priceInfo.price - priceInfo.yesterdayPrice) / priceInfo.yesterdayPrice) * 100;
            }
            
            // 转换为标准CurrencyPairType格式
            const currencyPair: CurrencyPairType = {
                id: pairId,
                symbol: `${coin.coinSymbol}/${coin.baseSymbol}`,
                baseSymbol: coin.baseSymbol,
                coinSymbol: coin.coinSymbol,
                groupStatus: group?.groupStatus,
                isFavorite,
                baseCoinScale: coin?.baseCoinScale,
                buyFee: coin?.buyFee,
                classLabel: coin?.classLabel,
                coinScale: coin?.coinScale,
                depthFour: coin?.depthFour,
                depthOne: coin?.depthOne,
                depthThree: coin?.depthThree,
                depthTwo: coin?.depthTwo,
                enable: coin?.enable,
                enableBuy: coin?.enableBuy,
                enableSell: coin?.enableSell,
                maxBaseVolume: coin?.maxBaseVolume,
                maxCurrentPrice: coin?.maxCurrentPrice,
                maxMarketPrice: coin?.maxMarketPrice,
                maxVolume: coin?.maxVolume,
                minBaseVolume: coin?.minBaseVolume,
                minVolume: coin?.minVolume,
                openingPrice: coin?.openingPrice,
                priceOffset: coin?.priceOffset,
                sellFee: coin?.sellFee,
                show: coin?.show,
                price: priceInfo?.price,
                yesterdayPrice: priceInfo?.yesterdayPrice,
                priceChangePercent
            };
            
            console.log('currencyPair', currencyPair);
            processedPairs.push(currencyPair);
        });
        
        return {
            success: true,
            data: processedPairs,
            rawData: coinList
        };
    } catch (error) {
        console.error('Error fetching currency pairs:', error);
        return {
            success: false,
            error,
            data: [],
            rawData: []
        };
    }
}

// 获取用户自选币对
export async function fetchUserFavorites() {
    try {
        const response = await getUserExchangeCoinTypeList();
        if (response.code === '0') {
            return {
                success: true,
                data: response.data || []
            };
        }
        return {
            success: false,
            data: [],
            error: new Error('Failed to get favorites')
        };
    } catch (error) {
        console.error('Failed to load favorite coins:', error);
        return {
            success: false,
            data: [],
            error
        };
    }
}

// 添加自选币对到服务器（需实现）
export async function addToFavorites(baseCurrency: string, quoteCurrency: string) {
    // 实现添加自选币对的API调用
    // return await addFavoriteApi({ baseCurrency, quoteCurrency });
    console.log('Add to favorites', baseCurrency, quoteCurrency);
    return { success: true };
}

// 从服务器移除自选币对（需实现）
export async function removeFromFavorites(baseCurrency: string, quoteCurrency: string) {
    // 实现移除自选币对的API调用
    // return await removeFavoriteApi({ baseCurrency, quoteCurrency });
    console.log('Remove from favorites', baseCurrency, quoteCurrency);
    return { success: true };
}

// 获取币对价格数据
export async function fetchCurrencyPairPrices() {
    try {
        const response = await getExchangeCoinAllPrice();
        if (response.code === '0') {
            return {
                success: true,
                data: response.data || []
            };
        }
        return {
            success: false,
            data: [],
            error: new Error('获取币对价格失败')
        };
    } catch (error) {
        console.error('获取币对价格出错:', error);
        return {
            success: false,
            data: [],
            error
        };
    }
} 