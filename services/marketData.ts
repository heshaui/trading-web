import {request} from '@/request/index';
import { API_MODULE_NAME } from '@/config/apiConfig';
//获取行情信息
 export function getMarket():Promise<any>{
    return request(`/${API_MODULE_NAME.AMBIT_HOME_WEB}/home-web/v1/coin/coinTypeList/${3}`,{
        method:'GET'
    });
 }
//  获取热门榜单

export function getHotData():Promise<any>{
    return request(`/${API_MODULE_NAME.AMBIT_HOME_WEB}/home-web/v1/open/hotMarketSymbol/hotMarketSymbolList`,{
        method:'POST',
    });
}
// 获取现货市场
export function getspotData():Promise<any>{
    return request(`/${API_MODULE_NAME.AMBIT_HOME_WEB}/home-web/v1/exchange-coin/exchangeCoinAllPrice`,{
        method:'GET'
    });
 }

// 获取所有币种
export function getAllCoinsData():Promise<any>{
    return request(`/${API_MODULE_NAME.AMBIT_HOME_WEB}/home-web/v1/exchange-coin/tenantCurrencyCoinAll`,{
        method:'GET'
    });
 }