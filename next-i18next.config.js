const path = typeof window === 'undefined' ? require('path') : null;

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh', 'ko', 'ja', 'tw'],
    localeDetection: true,
  },
  fallbackLng: {
    default:''['en'],
    'zh': ['zh_CN'],
    'ja': ['ja-JP'],
    'ko': ['ko-KR'],
    'tw': ['zh_TW', 'zh-HK'],
  },
  ns: ['common', 'home_menu', 'home', 'login'],
  defaultNS: 'common',
  localePath: typeof window === 'undefined' ? path.resolve('./public/locales') : '/locales',
};