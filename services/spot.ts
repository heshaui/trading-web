import { request } from '@/request/index';
import { API_MODULE_NAME } from '@/config/apiConfig';

const fixUrl = `/${API_MODULE_NAME.AMBIT_USER_WEB}`

interface createOrderType {
    amount:number,
    baseSymbol:string,
    coinSymbol:string,
    direction:number,
    price?:number,
    symbol:string,
    type:number,
}

// 获取邀请列统计
export function createOrder(data: createOrderType): Promise<any> {
    return request(`${fixUrl}/user-web/v1/order/createOrder`, {
        method: 'POST',
        body:JSON.stringify(data)
    });
}


// 获取交易所组
export function getExchangeGroup(): Promise<any> {
    return request(`${fixUrl}/user-web/v1/group/getExchangeGroup`, {
        method: 'GET',
    });
}



export function getExchangeCoinList(): Promise<any> {
    return request(`${fixUrl}/user-web/v1/exchange-coin/exchangeCoinList`, {
        method: 'GET',
    });
}



export function getExchangeOrderList(data: any): Promise<any> {
    return request(`${fixUrl}/user-web/v1/order/exchangeOrderList`, {
        method: 'POST',
        body:data
    });
}


