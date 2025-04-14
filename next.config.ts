import type { NextConfig } from "next";
const moduleName = process.env.NEXT_PUBLIC_MODULE || 'shared'; // 默认值改为 'shared'

import { i18n } from './next-i18next.config';

// const { i18n } = require('./next-i18next.config');

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  transpilePackages: [
    // antd & deps
    "@ant-design",
    "@rc-component",
    "antd",
    "rc-cascader",
    "rc-checkbox",
    "rc-collapse",
    "rc-dialog",
    "rc-drawer",
    "rc-dropdown",
    "rc-field-form",
    "rc-image",
    "rc-input",
    "rc-input-number",
    "rc-mentions",
    "rc-menu",
    "rc-motion",
    "rc-notification",
    "rc-pagination",
    "rc-picker",
    "rc-progress",
    "rc-rate",
    "rc-resize-observer",
    "rc-segmented",
    "rc-select",
    "rc-slider",
    "rc-steps",
    "rc-switch",
    "rc-table",
    "rc-tabs",
    "rc-textarea",
    "rc-tooltip",
    "rc-tree",
    "rc-tree-select",
    "rc-upload",
    "rc-util",
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false, // 禁用 fs 模块
      };
    }
    config.module.rules.push({
      test: /\.m?js$/, // 匹配所有的 `.mjs` 和 `.js` 文件
      resolve: {
        fullySpecified: false, // 禁用对 .mjs 文件的严格匹配
      },
    });
    config.module.rules.push({
      test: /node_modules\/classnames\/index\.js/,
      use: {
        loader: "string-replace-loader",
        options: {
          search: "import.meta.webpackHot.accept()",
          replace: "if (module.hot) module.hot.accept()",
          flags: "g",
        },
      },
    });
    return config;
  },
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
        source: "/ambit-inform-web/:path*", // 公告数据
        destination: "http://ljx.imbit.work/ambit-inform-web/:path*", // 代理到目标服务器
      },
      {
        source: "/ambit-user-web/:path*", // 匹配所有 /ambit-user-web/xxx 请求
        destination: "http://ljx.imbit.work/ambit-user-web/:path*" // 代理到目标服务器
      },
      {
        source: "/ambit-oss/:path*", // 匹配所有 zs/xxx 请求
        destination: "http://ljx.imbit.work/ambit-oss/:path*" // 代理到目标服务器
      },
      {
        source: "/ambit-assets-web/:path*", // 匹配所有 zs/xxx 请求
        destination: "http://ljx.imbit.work/ambit-assets-web/:path*" // 代理到目标服务器
      },
      
    ];
  },
  i18n,
  // 集成 i18n 配置
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
  images: {
    domains: ['meta2025.oss-ap-northeast-2.aliyuncs.com', 'example.com'],
  },
};

export default nextConfig;
