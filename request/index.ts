const BASE_URL = process.env.NEXT_PUBLIC_API_BASE;
const CONTRACT_URL= process.env.NEXT_PUBLIC_WEB_CONTRACT_BASE;
import { LOCAL_STORAGE_KEY } from '@/config/apiConfig';
// import { useAuth } from '@/context/AuthContext';
import router from 'next/router';
import { toast } from 'sonner';
import appStore from '@/store';
/**
 * 通用请求封装
 * @param endpoint 请求的 API 路径，例如 '/user'
 * @param options 请求选项，支持 method、body、headers 等
 * @returns 返回 Promise
 */
// const { logout } = useAuth();
interface RequestHeaders {
  [key: string]: string;
}
export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // 特殊处理：fe-co-api 强制转发到 futures.imbit.work
  let url: string;
  if (endpoint.startsWith('/fe-co-api/')) {
    url = `${CONTRACT_URL}${endpoint}`;
  } else {
    url = BASE_URL ? `${BASE_URL}${endpoint}`: `${endpoint}`;
  }
  // console.log('请求 URL:', url);
  
  let defaultHeaders:RequestHeaders = {};
  
  // 针对 fe-co-api 请求使用不同的头部配置
  if (endpoint.startsWith('/fe-co-api/')) {
    // fe-co-api 请求使用最小化头部配置，避免CORS问题
    // 具体的头部（exchange-token, exchange-client, exchange-language）
    // 会通过 formatHeaders 在 common.ts 中处理
    defaultHeaders = {
      // 只设置必要的头部
    };
  } else {
    // 其他请求保持原有配置
    defaultHeaders = {
      'Authorization': `${getToken()}`, // 获取 token（可选）
      'sa-token': `${getToken()}`,
      'lang': localStorage.getItem('lang') || 'en_US',
    };
  }
  
  // 仅在开发环境下添加 ambit-saas 头部（但不包括 fe-co-api 请求）
  if (process.env.NODE_ENV === 'development' && !endpoint.startsWith('/fe-co-api/')) {
    defaultHeaders['ambit-saas'] = process.env.NEXT_PUBLIC_AMBIT_SAAS||'2e5bbf22907d4a31992e9641079af195';
  }

 // 发送 FormData 时才添加 Content-Type: application/json
 if (!(options.body instanceof FormData)) {
  defaultHeaders['Content-Type'] = 'application/json';
}
  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // throw new Error(data.message || '请求失败');
      console.log(data.message || '请求失败');
    }

    // 检查响应码是否为 10005
    if (data.code === '10005' //账户已禁用
      || data.code === '10046' //未登录
      || data.code === '10047' //Token 不存在或已过期，请重新登录
      || data.code === '10106' //登录超时
      || data.code === '10118' //账户已冻结
      || data.code === '10132' //商户已过期
    ) {
     
      if(!url.includes('/fe-co-api')){
         toast.error(data.message);
        logout();
      }
      
    }
    return data;
  } catch (error) {
    console.error('API 请求错误:', error);
    throw error;
  }
}
    // 登出方法
    const logout = () => {
      // localStorage.removeItem(LOCAL_STORAGE_KEY.USER_TOKEN);
      // sessionStorage.removeItem(LOCAL_STORAGE_KEY.USER_TOKEN);
      appStore.clearToken();
      // 触发自定义事件
      window.dispatchEvent(new Event('loginStatusChanged'));
      router.push('/');
  };
// 获取 Token（如果有鉴权）
export function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(LOCAL_STORAGE_KEY.USER_TOKEN) || '';
  }
  return '';
}