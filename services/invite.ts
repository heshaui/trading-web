import { request } from '@/request/index';
import {API_MODULE_NAME} from '@/config/apiConfig';

const fixUrl=`/${API_MODULE_NAME.AMBIT_USER_WEB}`

// 获取邀请列统计
export function getInviteCount() {
    return request(`${fixUrl}/user-web/v1/user/userInviteCount`, {
        method: 'POST',
    });
}
// 获取邀请列表
export function getInviteList() {
    return request(`${fixUrl}/user-web/v1/user/userInviteList`, {
        method: 'POST',
    });
}
