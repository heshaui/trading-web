const path = typeof window === 'undefined' ? require('path') : null;

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh', 'ko', 'ja', 'tw'],
    localeDetection: true,
  },
  ns: ['common', 'home_menu', 'home', 'login'],
  defaultNS: 'common',
  localePath: typeof window === 'undefined' ? path.resolve('./public/locales') : '/locales',
};