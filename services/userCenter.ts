import { request } from '@/request/index';
import {API_MODULE_NAME} from '@/config/apiConfig';

const fixUrl=`/${API_MODULE_NAME.AMBIT_USER_WEB}`


//用户信息
export function getLoginUserInfo(): Promise<any> {
  return request(`${fixUrl}/user-web/v1/user/getLoginInfo`, {
    method: 'GET',
  });
}

//安全中心
export function getSafeCenter(): Promise<any> {
    return request(`${fixUrl}/user-web/v1/user/safeCenter`, {
      method: 'POST',
    });
  }
// 个人中心
  export function getUserCenter(): Promise<any> {
    return request(`${fixUrl}/user-web/v1/user/userCenter`, {
      method: 'POST',
    });
  }
//   修改个人中心
  export function updateUserCenter(): Promise<any> {
    return request(`${fixUrl}/user-web/v1/user/updateUserCenter`, {
      method: 'POST',
    });
  }
  

