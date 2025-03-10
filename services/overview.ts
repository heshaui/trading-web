import { request } from '@/request/index';
import {API_MODULE_NAME} from '@/config/apiConfig';

const fixUrl=`/${API_MODULE_NAME.AMBIT_USER_WEB}`


//用户信息
export function getLoginInfo(): Promise<any> {
    return request(`${fixUrl}/user-web/v1/user/getLoginInfo`, {
      method: 'GET',
    //   body:JSON.stringify({userId:userId})
    });
  }
