import { request } from '@/request/index';
import {API_MODULE_NAME} from '@/config/apiConfig';
const fixUrl=`/${API_MODULE_NAME.AMBIT_AUTH}`
// 登录
export function getLogin(data: any): Promise<any> {
  return request(`${fixUrl}/auth/login`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
// 注册
export function getRegister(data: any): Promise<any> {
  return request(`${fixUrl}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
// 登录-邮件验证码-未登录
export function getLoginMailCode(data: any) {
  return request(`${fixUrl}/email/send/not/loginCheckEmail`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
// 登录-短信-未登录
export function getLoginSmsCode(data: any) {
  return request(`${fixUrl}/sms/send/not/loginCheckSms`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// 注册-邮件验证码-未登录
interface RegisterMailCodeType {
  number: string,
  code?: string,
  deviceType: string
}
export function getRegisterMailCode(data: RegisterMailCodeType): Promise<any> {
  return request(`${fixUrl}/email/send/not/registerCheckEmail`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// 注册-短信-未登录
export function getRegisterSmsCode(data: any): Promise<any> {
  return request(`${fixUrl}/sms/send/not/registerCheckSms`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}



