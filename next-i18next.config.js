// module.exports = {
//   i18n: {
//     locales: ['en', 'zh', 'ko'], // 支持的语言
//     defaultLocale: 'en',        // 默认语言
//   },
//   ns: ['common', 'home_menu', 'home', 'login'],
//   defaultNS: 'common',
// };
module.exports = {
  i18n: {
    locales: ['en', 'zh', 'ko'], // 支持的语言
    defaultLocale: 'en',        // 默认语言
  },
  ns: ['common', 'home_menu', 'home', 'login'],
  defaultNS: 'common',
  localePath: typeof window === 'undefined' ? require('path').resolve('./public/locales') : '/locales',
};