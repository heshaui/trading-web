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
interface encryptType {
    data: string,
    time: string|number,
    reqNo: string|number
  }
// 获取邀请列统计
export function createOrder(data: encryptType): Promise<any> {
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
        body:JSON.stringify(data)
    });
}
interface getOrderListType {
    endTime?: number|string;
    offset?: number;
    pageNo?: number;
    pageSize?: number
    startTime?: number|string;
}

// 订单查询
export function getOrderList(data: getOrderListType): Promise<any> {
    return request(`${fixUrl}/user-web/v1/order/exchangeOrderList`, {
        method: 'POST',
        body:JSON.stringify(data)
    });
}


//自选币对
export function getUserExchangeCoinTypeList(): Promise<any> {
    //2 自选币对
    return request(`${fixUrl}/user-web/v1/exchange-coin/userExchangeCoinTypeList/2`, {
        method: 'GET',
    });
}

// 取消订单
export function revocationOrder(data: encryptType): Promise<any> {
    return request(`${fixUrl}/user-web/v1/order/revocationOrder`, {
        method: 'POST',
        body:JSON.stringify(data)
    });
}

