import { request } from '@/request/index';
import  '@/public/js/security';
import { LOCAL_STORAGE_KEY } from '@/config/apiConfig';
const getCookie = function (name:any) {
  let arrd = null;
  const reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
  const match = document.cookie.match(reg);
  if (match) {
    arrd = match;
    return unescape(arrd[2]);
  }
  return null;
};
// 扩展Window接口以包含secur属性
declare global {
  interface Window {
    secur?: {
      org: string;
      device: string;
      language: string;
      platform: string;
      timezone: string;
      adblock: string;
      userAgent: string;
      plugins: string;
      sessionStorage: string;
      localStorage: string;
      indexedDb: string;
      touchSupport: string;
      fonts: string;
      availableScreenResolution: string;
      screenResolution: string;
    };
  }
}

// 声明全局security变量
declare let security: any;

const formatTime = (dateTime: number | string | Date): string => {
  const date = new Date(dateTime);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  function s(t: number): string {
    return t < 10 ? `0${t}` : t.toString();
  }

  return `${year}-${s(month)}-${s(day)} ${s(hours)}:${s(minutes)}:${s(seconds)}`;
};

// 初始化security对象
const initSecurity = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window对象未定义'));
      return;
    }

    // 如果window.secur已经存在，直接返回
    if (window.secur) {
      resolve();
      return;
    }

    // 检查security对象是否存在
    if (typeof security === 'undefined') {
      reject(new Error('Security库未正确加载'));
      return;
    }

    try {
      // 初始化security
      security.init({
        org: process.env.NODE_ENV === 'development' ? 'www.fe.com' : window.location.hostname,
        server: '',
        sendRemote: 0
      }, (data: any) => {
        // 将初始化后的数据设置到window.secur
        window.secur = data;
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
};

const formatParams = async (acParams: any = {}): Promise<any> => {
  // 确保security已初始化
  try {
    if (!window.secur) {
      await initSecurity();
    }
  } catch (error) {
    console.warn('Security初始化失败，使用默认值:', error);
    // 如果security初始化失败，使用默认值
    window.secur = {
      org: '',
      device: '',
      language: '',
      platform: '',
      timezone: '',
      adblock: '',
      userAgent: '',
      plugins: '',
      sessionStorage: '',
      localStorage: '',
      indexedDb: '',
      touchSupport: '',
      fonts: '',
      availableScreenResolution: '',
      screenResolution: ''
    };
  }

  let data: any;
  const {
    org = '', device = '', language = '', platform = '', timezone = '', 
    adblock = '', userAgent = '', plugins = '', sessionStorage = '', 
    localStorage = '', indexedDb = '', touchSupport = '', fonts = '', 
    availableScreenResolution = '', screenResolution = ''
  } = window.secur || {};

  let infoOrg = org;
  if (process.env.NODE_ENV === 'development') {
    infoOrg = 'www.fe.com';
  }

  const securityInfo = JSON.stringify({
    id: '',
    org: infoOrg,
    timestamp: formatTime(new Date().getTime()),
    userAgent,
    availableScreenResolution,
    screenResolution,
    touchSupport,
    sessionStorage,
    localStorage,
    indexedDb,
    plugins,
    fonts,
    adblock,
    client_type: '',
    identity: '',
    device,
    ip: '',
    ip2region: '',
    language,
    platform,
    browser: '',
    browser_version: '',
    os: '',
    os_version: '',
    resolution: '',
    timezone,
    ctime: '',
    mtime: '',
  });

  if (acParams instanceof FormData) {
    acParams.append('uaTime', formatTime(new Date().getTime()));
    acParams.append('securityInfo', securityInfo);
    data = acParams;
  } else {
    data = { ...acParams };
    data.uaTime = formatTime(new Date().getTime());
    data.securityInfo = securityInfo;
  }
  return data;
};


const formatHeaders = (acHeaders?: any) => {
  let headers: { [key: string]: string } = {};
  headers['exchange-token'] = localStorage.getItem(LOCAL_STORAGE_KEY.USER_TOKEN) || '';
  headers['exchange-client'] = 'pc';
  headers['exchange-language'] = localStorage.getItem('lang') || 'en_US';
  // headers['exchange-time'] = formatTime(new Date().getTime())
  if (acHeaders) {
    headers = { ...headers, ...acHeaders };
  }
  return headers;
};


// 获取公共信息
export const getPublicInfo = async (params: any) => {
  try {
    const formattedParams = await formatParams(params);
    const response = await request<any>('/fe-co-api/common/public_info', {
      method: 'POST',
      headers: formatHeaders(),
      body: JSON.stringify(formattedParams),
    });
    
    return response;
  } catch (error) {
    console.error('获取公共信息失败:', error);
    throw error;
  }
};

// 创建订单
export const createOrder = async (params: any) => {
  try {
    const formattedParams = await formatParams(params);
    const response = await request<any>('/fe-co-api/order/order_create', {
      method: 'POST',
      headers: formatHeaders(),
      body: JSON.stringify(formattedParams),
    });
    return response;
  } catch (error) {
    console.error('创建订单失败:', error);
    throw error;
  }
};



// user/create_co_id
export const createCoId = async (params: any) => {
  try {
    const formattedParams = await formatParams(params);
    const response = await request<any>('/fe-co-api/user/create_co_id', {
      method: 'POST',
      headers: formatHeaders(),
      body: JSON.stringify(formattedParams),
    });
    
    return response;
  } catch (error) {
    console.error('创建合约ID失败:', error);
    throw error;
  }
};

// 获取用户合约配置
export const getUserConfig = async (params: any) => {
  try {
    const formattedParams = await formatParams(params);
    const response = await request<any>('/fe-co-api/user/get_user_config', {
      method: 'POST',
      headers: formatHeaders(),
      body: JSON.stringify(formattedParams),
    });
    
    return response;
  } catch (error) {
    console.error('获取用户合约配置失败:', error);
    throw error;
  }
};



export const getAccountBalance = async (params: any) => {
  try {
    const formattedParams = await formatParams(params);
    const response = await request<any>('/fe-co-api/account/account_balance', {
      method: 'POST',
      headers: formatHeaders(),
      body: JSON.stringify(formattedParams),
    });
    return response;
  } catch (error) {
    console.error('获取账户余额失败:', error);
    throw error;
  }
};


export const getAssetsList = async () => {
  try {
    const formattedParams = await formatParams();
    const response = await request<any>('/fe-co-api/position/get_assets_list', {
      method: 'POST',
      headers: formatHeaders(),
      body: JSON.stringify(formattedParams),
    });
    return response;
  } catch (error) {
    console.error('获取账户余额失败:', error);
    throw error;
  }
};


export const editUserPageConfig = async (params: any) => {
  try {
    const formattedParams = await formatParams(params);
    const response = await request<any>('/fe-co-api/user/edit_user_page_config', {
      method: 'POST',
      headers: formatHeaders(),
      body: JSON.stringify(formattedParams),
    });
  } catch (error) {
    console.error('编辑用户页面配置失败:', error);
    throw error;
  }
};

//调整用户合约杠杆
export const levelEdit = async (params: any) => {
  try {
    const formattedParams = await formatParams(params);
    const response = await request<any>('/fe-co-api/user/level_edit', {
      method: 'POST',
      headers: formatHeaders(),
      body: JSON.stringify(formattedParams),
    });
    return response;
  } catch (error) {
    console.error('调整合约杠杆失败:', error);
    throw error;
  }
};


// 获取当前持仓列表
export const getCurrentOrderList = async (params: any) => {
  try {
    const formattedParams = await formatParams(params);
    const response = await request<any>('/fe-co-api/order/current_order_list', {
      method: 'POST',
      headers: formatHeaders(),
      body: JSON.stringify(formattedParams),
    });
    return response;
  } catch (error) {
    console.error('获取当前持仓列表失败:', error);
    throw error;
  }
};


// 取消订单
export const cancelOrder = async (params: any) => {
  try {
    const formattedParams = await formatParams(params);
    const response = await request<any>('/fe-co-api/order/order_cancel', {
      method: 'POST',
      headers: formatHeaders(),
      body: JSON.stringify(formattedParams),
    });

    return response;
  } catch (error) {
    console.error('取消订单失败:', error);
    throw error;
  }
};

// 历史委托
export const getHistoryOrderList = async (params: any) => {
  try {
    const formattedParams = await formatParams(params);
    const response = await request<any>('/fe-co-api/order/history_order_list', {
      method: 'POST',
      headers: formatHeaders(),
      body: JSON.stringify(formattedParams),
    });
    return response;
  } catch (error) {
    console.error('获取历史委托列表失败:', error);
    throw error;
  }
};

// 历史持仓,盈亏记录
export const getHistoryPositionList = async (params: any) => {
  try {
    const formattedParams = await formatParams(params);
    const response = await request<any>('/fe-co-api/position/history_position_list', {
      method: 'POST',
      headers: formatHeaders(),
      body: JSON.stringify(formattedParams),
    });
    return response;
  } catch (error) {
    console.error('获取历史持仓列表失败:', error);
    throw error;
  }
};

//深度图
export const getDepthMap = async (params: any) => {
  try {
    const formattedParams = await formatParams(params);
    const response = await request<any>('/fe-co-api/common/depth_map', {
      method: 'POST',
      headers: formatHeaders(),
      body: JSON.stringify(formattedParams),
    });
    return response;
  } catch (error) { 
    console.error('获取深度图失败:', error);
    throw error;
  }
};

// 条件委托
export const getPositionList = async (params: any) => {
  try {
    const formattedParams = await formatParams(params);
    const response = await request<any>('/fe-co-api/order/trigger_order_list', {
      method: 'POST',
      headers: formatHeaders(),
      body: JSON.stringify(formattedParams),
    });
    return response;
  } catch (error) {
    console.error('获取条件委托列表失败:', error);
    throw error;
  }
};





// 成交记录
export const getTradeRecord = async (params: any) => {
  try {
    const formattedParams = await formatParams(params);
    const response = await request<any>('/fe-co-api/order/get_trade_info', {
      method: 'POST',
      headers: formatHeaders(),
      body: JSON.stringify(formattedParams),
    });
    return response;
  } catch (error) {
    console.error('获取成交记录失败:', error);
    throw error;
  }
};