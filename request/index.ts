const BASE_URL = process.env.NEXT_PUBLIC_API_BASE;
import { LOCAL_STORAGE_KEY } from '@/config/apiConfig';
/**
 * 通用请求封装
 * @param endpoint 请求的 API 路径，例如 '/user'
 * @param options 请求选项，支持 method、body、headers 等
 * @returns 返回 Promise
 */

interface RequestHeaders {
  [key: string]: string;
}
export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // const url = `${BASE_URL}${endpoint}`;
  const url = BASE_URL ? `${BASE_URL}${endpoint}`: `${endpoint}`;
  // console.log('请求 URL:', url);
  
  const defaultHeaders:RequestHeaders = {
    // 'Content-Type': '',
    'Authorization': `${getToken()}`, // 获取 token（可选）
    'ambit-saas': '0528bb1b278d4fb590db9fec13c871ab',
    'sa-token': `${getToken()}`
  };
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '请求失败');
    }

    return response.json();
  } catch (error) {
    console.error('API 请求错误:', error);
    throw error;
  }
}

// 获取 Token（如果有鉴权）
export function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(LOCAL_STORAGE_KEY.USER_TOKEN) || '';
  }
  return '';
}