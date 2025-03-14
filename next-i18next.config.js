const path = typeof window === 'undefined' ? require('path') : null;

module.exports = {
  i18n: {
    defaultLocale: 'zh',
    locales: ['en', 'zh', 'ja', 'ko', 'tw'],
    localeDetection: false,
  },
  ns: ['common', 'home_menu', 'home', 'login'],
  defaultNS: 'common',
  localePath: typeof window === 'undefined' ? path.resolve('./public/locales') : '/locales',
};