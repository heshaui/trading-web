import { request } from '@/request/index';
import { API_MODULE_NAME } from '@/config/apiConfig';

// 获取公告列表
export function getBulletinMessage(data: { languageCode: string }) {
    return request(`/${API_MODULE_NAME.AMBIT_INFORM_WEB}/inform-web/v1/open/announcement/list`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}