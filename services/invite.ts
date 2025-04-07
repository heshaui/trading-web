import { request } from '@/request/index';
import { API_MODULE_NAME } from '@/config/apiConfig';

const fixUrl = `/${API_MODULE_NAME.AMBIT_USER_WEB}`

// 获取邀请列统计
export function getInviteCount(): Promise<any> {
    return request(`${fixUrl}/user-web/v1/user/userInviteCount`, {
        method: 'POST',
    });
}
interface paramType{
    pageNo:number,
    pageSize:number,
}
// 获取邀请列表
export function getInviteList(params:paramType): Promise<any> {
    return request(`${fixUrl}/user-web/v1/user/userInviteList`, {
        method: 'POST',
        body:JSON.stringify(params)
    });
}

