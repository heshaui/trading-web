import { LOCAL_STORAGE_KEY, KV_KEYS } from "@/config/apiConfig";
import { getKvObject } from "@/services/kv";
import { parseJsonString } from "@/utils/parseJsonString";
import { getLoginUserInfo } from "@/services/userCenter";
import { getCountryCode } from "@/services/open";

// 国家列表
export async function getCountryCodeList() {
  try {
    const response =await getCountryCode();
    if (response.code === "0") {
      return {
        success: true,
        data: response.data || [],
      };
    }
    return {
      success: false,
      data: [],
      error: new Error("获取国家列表失败"),
    };
  } catch (error) {
    console.error("获取国家列表出错:", error);
    return {
      success: false,
      data: [],
      error,
    };
  }
}
