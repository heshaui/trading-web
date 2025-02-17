import { request } from '@/request/index';


// export function getUserInfo() {
//   return request('//home-web/v1/menu/selectHomeMenuJson/{lang}', { method: 'GET' });
// }

export function homeMenu(data: { username: string; password: string }) {
  return request('/home-web/v1/menu/selectHomeMenuJson/{lang}', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}


