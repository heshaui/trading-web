// 解析设备名称及版本
const getDeviceModel = (userAgent: string): string => {
    if (/iPhone/.test(userAgent)) {
        const match = userAgent.match(/iPhone\s([^;]+);\sCPU\siPhone\sOS\s([\d_]+)/);
        return match ? `iPhone ${match[1]} (iOS ${match[2].replace(/_/g, '.')})` : 'iPhone';
    } else if (/iPad/.test(userAgent)) {
        const match = userAgent.match(/iPad\s([^;]+);\sCPU\siPad\sOS\s([\d_]+)/);
        return match ? `iPad ${match[1]} (iPadOS ${match[2].replace(/_/g, '.')})` : 'iPad';
    } else if (/Android/.test(userAgent)) {
        const match = userAgent.match(/Android\s([^;]+);\s([^)]+)/);
        const versionMatch = userAgent.match(/Android\s([\d.]+)/);
        const version = versionMatch ? versionMatch[1] : 'Unknown';
        return match ? `${match[2]} (Android ${version})` : `Android Device (Android ${version})`;
    }
    return 'Unknown Device';
};

// 解析浏览器名称及版本
const getBrowserName = (userAgent: string): string => {
    if (/Edg/.test(userAgent)) {
        const match = userAgent.match(/Edg\/([\d.]+)/);
        return match ? `Microsoft Edge ${match[1]}` : 'Microsoft Edge';
    } else if (/Chrome/.test(userAgent)) {
        const match = userAgent.match(/Chrome\/([\d.]+)/);
        return match ? `Google Chrome ${match[1]}` : 'Google Chrome';
    } else if (/Firefox/.test(userAgent)) {
        const match = userAgent.match(/Firefox\/([\d.]+)/);
        return match ? `Mozilla Firefox ${match[1]}` : 'Mozilla Firefox';
    } else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
        const match = userAgent.match(/Version\/([\d.]+)\sSafari/);
        return match ? `Apple Safari ${match[1]}` : 'Apple Safari';
    } else if (/MSIE|Trident/.test(userAgent)) {
        const match = userAgent.match(/MSIE\s([\d.]+)/) || userAgent.match(/rv:([\d.]+)\)/);
        return match ? `Internet Explorer ${match[1]}` : 'Internet Explorer';
    }
    return 'Unknown Browser';
};

export const useGetDevice = () => {
    const userAgent = typeof window!== 'undefined'? window.navigator.userAgent : '';
    const deviceType = getDeviceModel(userAgent);
    const browserType = getBrowserName(userAgent);
    return {
        deviceType,
        browserType
    };
};