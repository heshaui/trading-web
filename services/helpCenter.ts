import { request } from '@/request/index';
import { API_MODULE_NAME } from '@/config/apiConfig';

// 获取帮助中心菜单
export function getHelpCenterMenu(data: { lang: string }) {
    return request(`/${API_MODULE_NAME.AMBIT_HOME_WEB}/home-web/v1/help-center/homeHelpCenterClassJson/${data.lang}`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}