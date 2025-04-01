import { LOCAL_STORAGE_KEY } from "@/config/apiConfig";
// 安全地从 localStorage 获取用户信息
// 安全地从 localStorage 获取用户信息
import {getLoginUserInfo} from "@/services/userCenter"
import { toast } from "sonner";
export const getUserInfo = (): any => {
    if (typeof window !== 'undefined') {
        const userInfoString = window.localStorage.getItem(LOCAL_STORAGE_KEY.USER_INFO);
        if (userInfoString) {
            try {
                return JSON.parse(userInfoString); // 解析成功时返回对象
            } catch (error) {
                console.error('解析用户信息失败:', error);
                return null; // 解析失败时返回 null
            }
        }
    }
    return null; // 如果 localStorage 中没有值或者不在浏览器环境，返回 null
};
