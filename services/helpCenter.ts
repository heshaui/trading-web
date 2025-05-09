import { request } from '@/request/index';
import { API_MODULE_NAME } from '@/config/apiConfig';
const baseUrl = `/${API_MODULE_NAME.AMBIT_HOME_WEB}`;
// 获取帮助中心菜单
export function getHelpCenterMenu(data: { lang: string }): Promise<any> {
    return request(`${baseUrl}/home-web/v1/help-center/homeHelpCenterClassJson/${data.lang}`, {
        method: 'POST',
        // body: JSON.stringify(data),
    });
}

// 自定义服务菜单
export function getCustomization({ lang }: { lang: string }): Promise<any> {
    return request(`${baseUrl}/home-web/v1/help-center/customizationJson/${lang}`, {
        method: 'POST',
    });
}

// 分类文章
export function getClassIdContent({ classId, lang }: { classId: number, lang: string }): Promise<any> {
    return request(`${baseUrl}/home-web/v1/help-center/classIdContent/${classId}/${lang}`, {
        method: 'POST',
    });
}
