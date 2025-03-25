import { request } from '@/request/index';
import { API_MODULE_NAME } from '@/config/apiConfig';

const fixUrl = `/${API_MODULE_NAME.AMBIT_USER_WEB}`
// const fixUrl2 = `/${API_MODULE_NAME.AMBIT_AUTH}`

interface paramsType {
    pageNo: number
    pageSize: number
}
//提现订单查询
export function getWithdrawDepositList(data: paramsType): Promise<any> {
  return request(`${fixUrl}/user-web/v1/withdraw-deposit/withdrawDepositList`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}