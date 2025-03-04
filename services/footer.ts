import { request } from '@/request/index';
import { API_MODULE_NAME } from '@/config/apiConfig';

// 获取kv
export function getLogo(data: { key: string }) {
    // 替换路径参数并发送请求
    return request(`/${API_MODULE_NAME.AMBIT_HOME_WEB}/home-web/v1/kv/params/${data.key}`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}
// 获取自定义footer
export function getCustomFooter(data: { lang: string }) {
    return request(`/${API_MODULE_NAME.AMBIT_HOME_WEB}/home-web/v1/menu/selectHomeBottomJson/${data.lang}`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}