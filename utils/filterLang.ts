export const getNextJsLocale = (langCode: string) => {
    // 确保 langCode 是小写的，以便更一致地匹配
    const lowerLangCode = langCode.toLowerCase();
    
    // 更精确的匹配
    if (lowerLangCode.startsWith('zh_') || lowerLangCode === 'zh') return 'zh';
    if (lowerLangCode.startsWith('ja_') || lowerLangCode === 'ja') return 'ja';
    if (lowerLangCode.startsWith('ko_') || lowerLangCode === 'ko') return 'ko';
    if (lowerLangCode.startsWith('tw_') || lowerLangCode === 'tw') return 'tw';
    
    // 默认返回英语
    return 'en';
};