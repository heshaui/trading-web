const path = typeof window === 'undefined' ? require('path') : null;

module.exports = {
  i18n: {
    defaultLocale: 'zh',
    locales: ['en', 'zh', 'ja', 'ko', 'tw'],

  },
  ns: ['common', 'home_menu', 'home', 'login', 'userCenter','resetPassword','assets','invite','spot','builetinCenter','helpCenter'],
  defaultNS: 'common',
  localePath: typeof window === 'undefined' ? path.resolve('./public/locales') : '/locales',
};