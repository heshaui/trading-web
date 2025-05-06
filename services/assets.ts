import { request } from '@/request/index';
import { API_MODULE_NAME } from '@/config/apiConfig';

const fixUrl = `/${API_MODULE_NAME.AMBIT_USER_WEB}`
const fixUrl2 = `/${API_MODULE_NAME.AMBIT_ASSETS_WEB}`

interface paramsType {
    pageNo: number
    pageSize: number
}
interface encryptType {
  data: string,
  time: string | number,
  reqNo: string | number
}
//提现订单查询
export function getWithdrawDepositList(data: paramsType): Promise<any> {
  return request(`${fixUrl}/user-web/v1/withdraw-deposit/withdrawDepositList`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}
interface saveUserAddressType {
    id?: number;
    protocolId?: number;
    addressName?: string;
    userId?: number;
    tenantId?: string;
}
// 新增提现地址
export function saveUserAddress(data: saveUserAddressType): Promise<any> {
  return request(`${fixUrl2}/assets-web/v1/user-address/saveUserAddress`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

interface paramsType {
    pageNo: number;
    pageSize: number;
}
// 用户提现地址查询
export function getuserAddressList(data: paramsType): Promise<any> {
  return request(`${fixUrl2}/assets-web/v1/user-address/userAddressList`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

// 删除提现地址（批量）
export function deleteByIds(data: number[]): Promise<any> {
  return request(`${fixUrl2}/assets-web/v1/user-address/deleteByIds`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

// 币种查询
export function getCoinAll(): Promise<any> {
  return request(`${fixUrl2}/assets-web/v1/currency-coin/tenantCurrencyCoinAll`, {
    method: 'POST',
    // body: JSON.stringify(data)
  });
}

// 币种协议(网络)
export function getcoinExtList(tenantId: number): Promise<any> {
    return request(`${fixUrl}/user-web/v1/withdraw-deposit/coinExtList?coinId=${tenantId}`, {
      method: 'POST',
    //   body: JSON.stringify({coinId:tenantId})
    });
  }
// 获取商户所有支持的币种协议(网络)
export function getProtocolTypeAll(): Promise<any> {
  return request(`${fixUrl2}/assets-web/v1/protocol-type/protocolTypeAll`, {
    method: 'POST',
  });
}


// 币种余额（单个）
export function getUserBalance(coinId: string|number): Promise<any> {
    return request(`${fixUrl2}/assets-web/v1/user-wallet/userBalance?coinId=${coinId}`, {
      method: 'POST',
    });
  }
  // 币种余额（全部）
  export function getUserBalanceAll(): Promise<any> {
    return request(`${fixUrl2}/assets-web/v1/user-wallet/userBalanceAll`, {
      method: 'POST',
    });
  }
  
  // 提现订单
  export function creatWithdraw(data: encryptType): Promise<any> {
    return request(`${fixUrl}/user-web/v1/withdraw-deposit/createWithdrawDeposit`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 提现校验
  export function checkWithdrawDeposit(data: encryptType): Promise<any> {
    return request(`${fixUrl}/user-web/v1/withdraw-deposit/checkWithdrawDeposit`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 提现安全验证-短信验证码
  export function getWithdrawalCheckSmsCode(data: encryptType): Promise<any> {
    return request(`${fixUrl}/user-web/v1/sms/send/withdrawalCheckSms`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 提现安全验证-邮箱验证码
  export function getWithdrawalCheckEmailCode(data: encryptType): Promise<any> {
    return request(`${fixUrl}/user-web/v1/email/send/withdrawalCheckEmail`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 取消提现/撤回提现
  export function getCancelWithdraw(data:encryptType): Promise<any> {
    return request(`${fixUrl}/user-web/v1/withdraw-deposit/undoWithdrawDeposit`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 查询用户余额日K线
  export function getUserBalanceByDay(): Promise<any> {
    return request(`${fixUrl2}/assets-web/v1/user-wallet/getUserBalanceByDay`, {
      method: 'GET'
    });
  }
  // 获取用户24小时限额
  export function getUserALlLimit(): Promise<any> {
    return request(`${fixUrl}/user-web/v1/withdraw-deposit/getUserALlLimit`, {
      method: 'GET',
    });
  }
