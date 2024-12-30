import type { NextConfig } from "next";
const moduleName = process.env.NEXT_PUBLIC_MODULE || 'shared'; // 默认值改为 'shared'
import { i18n } from './next-i18next.config.js';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  i18n, // 集成 i18n 配置
  async redirects() {
    // 如果环境变量是共享首页，不执行跳转
    if (moduleName === 'spot') {
      return [{ source: '/', destination: '/spot', permanent: true }];
    } else if (moduleName === 'contract') {
      return [{ source: '/', destination: '/contract', permanent: true }];
    } else if (moduleName === 'otc') {
      return [{ source: '/', destination: '/otc', permanent: true }];
    }
    // 不跳转，显示共享首页
    return [];
  },
};

export default nextConfig;
