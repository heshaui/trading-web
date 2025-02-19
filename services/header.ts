// import { request } from '@/request/index';


// export function getUserInfo() {
//   return request('//home-web/v1/menu/selectHomeMenuJson/{lang}', { method: 'GET' });
// }

// export function homeMenu(data: { username: string; password: string }) {
//   return request('/home-web/v1/menu/selectHomeMenuJson/{lang}', {
//     method: 'POST',
//     body: JSON.stringify(data),
//   });
// }

import { request } from '@/request/index';
import { API_MODULE_NAME } from '@/config/apiConfig';


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

