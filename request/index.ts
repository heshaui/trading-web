const BASE_URL = process.env.VITE_APP_BASE_API || 'http://ljx.imbit.work/ambit-user-web';

/**
 * 通用请求封装
 * @param endpoint 请求的 API 路径，例如 '/user'
 * @param options 请求选项，支持 method、body、headers 等
 * @returns 返回 Promise
 */
export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}` // 获取 token（可选）
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
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
function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || '';
  }
  return '';
}