const path = typeof window === 'undefined' ? require('path') : null;

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh', 'ja', 'ko', 'hk', 'vi', 'th', 'pt', 'ru', 'hi', 'bn', 'pl'],
    // localeDetection: false,
  },
  ns: ['common',  'home', 'login', 'userCenter','resetPassword','assets','invite','spot','builetinCenter','helpCenter','notice'],
  defaultNS: 'common',
  localePath: typeof window === 'undefined' ? path.resolve('./public/locales') : '/locales',
};