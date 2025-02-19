import type { NextConfig } from "next";
const moduleName = process.env.NEXT_PUBLIC_MODULE || 'shared'; // 默认值改为 'shared'
// import { i18n } from './next-i18next.config.js';

const { i18n } = require('./next-i18next.config');

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/ambit-auth/:path*", // 匹配所有 /ambit-auth/xxx 请求  //认证服务-登录注册
        destination: "http://ljx.imbit.work/ambit-auth/:path*", // 代理到目标服务器
      },
      {
        source: "/ambit-home-web/:path*", // 首页静态数据
        destination: "http://ljx.imbit.work/ambit-home-web/:path*", // 代理到目标服务器
      },
      {
          source: "/ambit-user-web/:path*", // 匹配所有 /ambit-user-web/xxx 请求
          destination: "http://ljx.imbit.work/ambit-user-web/:path*" // 代理到目标服务器
      },
      {
          source: "/ambit-home-web/:path*", // 匹配所有 /ambit-home-web/xxx 请求
          destination: "http://ljx.imbit.work/ambit-home-web/:path*" // 代理到目标服务器
      }
    ];
  },
  i18n, // 集成 i18n 配置
  // i18n: {
  //   locales: ['en', 'zh', 'ko'],
  //   defaultLocale: 'en',
  // },
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
