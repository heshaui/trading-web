import { request } from '@/request/index';
import {API_MODULE_NAME} from '@/config/apiConfig';
const fixUrl=`/${API_MODULE_NAME.AMBIT_HOME_WEB}`


// 获取全部国家区号
export function getCountryCode(): Promise<any> {
  return request(`${fixUrl}/home-web/v1/open/country/selectHomeCountryList`, {
    method: 'GET',
  });
}

// 获取logo
export function getLogo(data: { key: string }) {
  // 替换路径参数并发送请求
  return request(`/${API_MODULE_NAME.AMBIT_HOME_WEB}/home-web/v1/kv/params/${data.key}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}