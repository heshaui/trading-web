import { request } from "@/request/index";
import { API_MODULE_NAME } from "@/config/apiConfig";

const fixUrl2 = `/${API_MODULE_NAME.AMBIT_ASSETS_WEB}`;

interface RequestParams<T> {
  code: string;
  message: string;
  reqNo: string;
  data: T;
}

export enum StatusEnum {
  OPEN = '1',
  CLOSE = '2',
}
/*-----------------功能配置start------------------*/
interface FinancialConfiItem {
  id: number; //功能配置id
  financialSwitch: StatusEnum; //理财开关：1开启，2关闭
  isRealname: StatusEnum; //是否需要实名:1是，2否
  isDisplayAssets: StatusEnum; //是否显示资产：1是，2否
  isDisplayBackground: StatusEnum; //是否显示背景：1是，2否
  createTime: number; //创建时间
  updateTime: number; //更新时间
  tenantId: string; //商户ID，用于分区和区分不同的商户
}
export function getFinancialConfig(): Promise<RequestParams<FinancialConfiItem>> {
  return request(
    `${fixUrl2}/assets-web/v1/user-project/getFunctionalConfiguration`,
    { method: "POST" }
  );
}
/*-----------------功能配置end------------------*/


/*-----------------背景图片配置start------------------*/
interface BackgroundImageConfigItem {
  id: number; //背景图片id
  languageCode: string; //语言代码
  mainTitle: string; //主标题
  subTitle: string; //副标题
  backgroundImage: string; //背景图片
  createTime: number; //创建时间
  updateTime: number; //更新时间
  tenantId: string; //商户ID，用于分区和区分不同的商户
}

export function getBackgroundImageConfig(): Promise<RequestParams<BackgroundImageConfigItem>> {
  return request(
    `${fixUrl2}/assets-web/v1/user-project/getBackgroundImageConfiguration`,
    { method: "POST" }
  );
}
/*-----------------背景图片配置end------------------*/


/*-----------------我的持仓start------------------*/
interface MyPositionItem {
  holdings: number; //持仓
  totalRevenue: number; //总收益
  lastRevenue: number; //昨日收益
}
export function getMyPosition(): Promise<RequestParams<MyPositionItem>> {
  return request(
    `${fixUrl2}/assets-web/v1/user-project/holdAssets`,
    { method: "POST" }
  );
}
/*-----------------我的持仓end--------------------*/


/*-----------------用户理财产品列表start------------------*/
interface UserFinancialProductItem {
  id: number;
  name: string;
  value: string;
  type: string;
  status: string;
  createTime: string;
  updateTime: string;
}
export function getUserFinancialProductList(): Promise<RequestParams<UserFinancialProductItem>> {
  return request(
    `${fixUrl2}/assets-web/v1/user-project/userFinancialProductList`,
    { method: "POST" }
  );
}

/*-----------------用户理财产品列表end--------------------*/