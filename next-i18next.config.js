const path = typeof window === 'undefined' ? require('path') : null;

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh', 'ja', 'ko', 'hk', 'vi', 'th', 'pt', 'ru', 'hi', 'bn', 'pl'],
    // localeDetection: false,
  },
  // ns: ['common',  'home', 'login', 'userCenter','resetPassword','assets','invite','spot','builetinCenter','helpCenter','notice'],
  // defaultNS: 'common',
  // localePath: typeof window === 'undefined' ? path.resolve('./public/locales') : '/locales',

  reloadOnPrerender: process.env.NODE_ENV === 'development',
  // 禁用默认后端，使用自定义方案
  use: [],

};