import { request } from '@/request/index';
import { API_MODULE_NAME } from '@/config/apiConfig';
import { ExchangeRateParams } from '@/type/bulletin_center/bc_types';


export function homeMenu(data: { lang: string }) {
  // 加密请求数据
  // const encryptedData = encryptWithPublicKey(JSON.stringify(data));
  // if (!encryptedData) {
  //   throw new Error('加密失败');
  // }

  // 替换路径参数并发送请求
  return request(`/${API_MODULE_NAME.AMBIT_HOME_WEB}/home-web/v1/menu/selectHomeMenuJson/${data.lang}`, {
    method: 'POST',
    body: JSON.stringify(data), // 将加密后的数据作为请求体
  });
}

export function exchangeRate(data: ExchangeRateParams) {
  return request(`/${API_MODULE_NAME.AMBIT_HOME_WEB}/home-web/v1/exchangeRate/exchangeRateQuery`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
