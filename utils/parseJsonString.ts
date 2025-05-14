export const parseJsonString = (jsonString: string) => {
    if (!jsonString) return null;
    try {
        // 修复JSON格式问题
        const fixedJsonString = jsonString.replace(/([{,]\s*)([a-zA-Z0-9_]+):/g, '$1"$2":')
            .replace(/:\s*'([^']*?)'/g, ':"$1"');
        
        return JSON.parse(fixedJsonString);
    } catch (error) {
        console.error('解析JSON失败:', error);
        return null;
    }
};