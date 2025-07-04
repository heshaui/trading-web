import { request } from "@/request/index";
import { API_MODULE_NAME } from "@/config/apiConfig";

const fixUrl2 = `/${API_MODULE_NAME.AMBIT_ASSETS_WEB}`;

// 请求返回参数
interface RequestParams<T> {
  code: string;
  message: string;
  reqNo: string;
  data: T;
}

// 定期/活期
export enum FinancialType {
  FIXED = 1, //定期
  CURRENT = 2, //活期
}

/*-----------------功能配置start------------------*/
// 1开启，2关闭
export enum StatusEnum {
  OPEN = "1",
  CLOSE = "2",
}
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
export function getFinancialConfig(): Promise<
  RequestParams<FinancialConfiItem>
> {
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

export function getBackgroundImageConfig(): Promise<
  RequestParams<BackgroundImageConfigItem>
> {
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
  return request(`${fixUrl2}/assets-web/v1/user-project/holdAssets`, {
    method: "POST",
  });
}
/*-----------------我的持仓end--------------------*/

/*-----------------理财订单start------------------*/
// 1申购，2赎回，3利息
export enum FinancialOrderStatusEnum {
  PURCHASE = 1, //申购
  REDEEM = 2, //赎回
  INTEREST = 3, //利息
}
export interface FinancialOrderListParams {
  coinId?: number | null; //币种ID
  type: FinancialType; // 1定期 2活期
  operationType?: string | null; //申购/赎回
  startTime?: number | null; //开始时间
  endTime?: number | null; //结束时间
}

export interface FinancialOrderItem {
  projectId: number; //项目id
  coinId: number; //币种id
  coinName: string; //币种名称
  iconUrl: string; //币种图标
  createTime: number; //日期
  type: FinancialType; // 1定期 2活期
  status: FinancialOrderStatusEnum; // 1申购，2赎回，3利息
  amount: number; //金额
  usdAmount: number; //usd折算价格
}

export function getFinancialOrderList(
  params: FinancialOrderListParams
): Promise<RequestParams<FinancialOrderItem[]>> {
  return request(`${fixUrl2}/assets-web/v1/user-project/financialOrderList`, {
    method: "POST",
    body: JSON.stringify(params),
  });
}
/*-----------------理财订单end--------------------*/

/*-----------------用户理财账户start------------------*/
// 0失败，1持仓中，2成功赎回
export enum PurchaseStatusEnum {
  FAIL = 0, //失败
  HOLDING = 1, //持仓中
  SUCCESS = 2, //成功赎回
}

// 0否，1是
export enum AutoPurchaseEnum {
  NO = 0, //否
  YES = 1, //是
}

export interface UserFinancialAccountParams {
  coinId?: number | null; //币种ID
  type: FinancialType; // 1定期 2活期
}
export interface UserFinancialAccountItem {
  projectId: number;
  coinId: number; //币种ID
  coinName: string; //币种名称
  iconUrl: string; //币种图标
  type: FinancialType; // 1定期 2活期
  minAnnualInterestRate: number; //最小年化利率
  maxAnnualInterestRate: number; //最大年化利率
  autoPurchase: AutoPurchaseEnum; //是否自动申购 0否，1是
  purchaseAmount: number; //申购金额
  usdPurchaseAmount: string; //USD申购金额
  accruedInterest: number; //累计收益
  usdAccruedInterest: string; //USD累计收益
  purchaseStatus: PurchaseStatusEnum; // 0失败，1持仓中，2成功赎回
}
export function getUserFinancialAccount(
  params: UserFinancialAccountParams
): Promise<RequestParams<UserFinancialAccountItem[]>> {
  return request(
    `${fixUrl2}/assets-web/v1/user-project/userFinancialProductList`,
    { method: "POST", body: JSON.stringify(params) }
  );
}

/*-----------------用户理财账户end--------------------*/

/*-----------------理财账单明细start------------------*/
export interface FinancialBillDetailsParams {
  coinId?: number | null; //币种ID
  type: FinancialType; // 1定期 2活期
  operationType?: string | null; //申购/赎回
  startTime?: number | null; //开始时间
  endTime?: number | null; //结束时间
}

export interface FinancialBillDetailsItem {
  coinId: number; //币种ID
  coinName: string; //币种名称
  iconUrl: string; //币种图标
  type: FinancialType; // 1定期 2活期
}

export function getFinancialBillDetails(
  params: FinancialBillDetailsParams
): Promise<RequestParams<FinancialBillDetailsItem[]>> {
  return request(`${fixUrl2}/assets-web/v1/user-project/financialBillDetails`, {
    method: "POST",
    body: JSON.stringify(params),
  });
}
/*-----------------理财账单明细end--------------------*/


/*-----------------理财页面tokenstart------------------*/
export interface FinancialPageTokenParams {
  coinId?: number | null; //币种ID
  type: FinancialType; // 1定期 2活期
}


export interface FinancialPageTokenItem {
  list: any[]; //token
  count:number; //总数
}

export function getFinancialPageToken(
  params: FinancialPageTokenParams
): Promise<RequestParams<FinancialPageTokenItem>> {
  return request(`${fixUrl2}/assets-web/v1/user-project/financialPageToken`, {
    method: "POST",
    body: JSON.stringify(params),
  });
}
/*-----------------理财页面tokenend--------------------*/