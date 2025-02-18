import { request } from '@/request/index';
import {API_MODULE_NAME} from '@/config/apiConfig';
// 登录
export function getLogin(data: any) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
// 注册
export function getRegister(data: any) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
// 登录-邮件验证码-未登录
export function getLoginMailCode(data: any) {
  return request('/email/send/not/loginCheckEmail', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
// 登录-短信-未登录
export function getLoginSmsCode(data: any) {
  return request('/sms/send/not/loginCheckSms', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// 注册-邮件验证码-未登录
export function getRegisterMailCode(data: any) {
  return request('/email/send/not/registerCheckEmail', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// 注册-短信-未登录
export function getRegisterSmsCode(data: any) {
  return request('/sms/send/not/registerCheckSms', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}



