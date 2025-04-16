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

