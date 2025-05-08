import { request } from '@/request/index';
import { API_MODULE_NAME } from '@/config/apiConfig';

// 获取公告列表 - 登录前
export function getBulletinMessage(data: { languageCode: string, classMenu?: number }) {
    return request(`/${API_MODULE_NAME.AMBIT_INFORM_WEB}/inform-web/v1/open/announcement/list`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}
// 获取公告详情 - 登录前
export function getBulletinDetail(data: { languageCode: string, id: number }) {
    return request(`/${API_MODULE_NAME.AMBIT_INFORM_WEB}/inform-web/v1/open/announcement/detail/${data.id}/${data.languageCode}`, {
        method: 'GET',
    });
}
// 获取公告列表 - 登录后
export function getBulletinMessageLogined(data: { languageCode: string, classMenu?: number }) {
    return request(`/${API_MODULE_NAME.AMBIT_INFORM_WEB}/inform-web/v1/announcement/list`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}
// 获取公告详情 - 登录后
export function getBulletinDetailLogined(data: { languageCode: string, id: number }) {
    return request(`/${API_MODULE_NAME.AMBIT_INFORM_WEB}/inform-web/v1/announcement/detail/${data.id}/${data.languageCode}`, {
        method: 'GET',
    });
}
// 批量已读
export function readBulletinMessageLogined(data: { ids: number[] }) {
    return request(`/${API_MODULE_NAME.AMBIT_INFORM_WEB}/inform-web/v1/announcement/detailIdList`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}
// 获取公告未读数量
export function getBulletinMessageUnreadCount() {
    return request(`/${API_MODULE_NAME.AMBIT_INFORM_WEB}/inform-web/v1/announcement/unread-count`, {
        method: 'GET',
    });
}


export function getInformClassMenuList(data: { languageCode: string }) {
    return request(`/${API_MODULE_NAME.AMBIT_INFORM_WEB}/inform-web/v1/open/class/getInformClassMenuList`, {
        method: 'POST',

    });
}
