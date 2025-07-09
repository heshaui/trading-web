import { request } from "@/request/index";
import { API_MODULE_NAME } from "@/config/apiConfig";

const fixUrl2 = `/${API_MODULE_NAME.AMBIT_ASSETS_WEB}`;
const fixUrl = `/${API_MODULE_NAME.AMBIT_HOME_WEB}`;

// 请求返回参数
interface RequestParams<T> {
  code: string;
  message: string;
  reqNo: string;
  data: T;
}

// 0否，1是
export enum OpenStatusEnum {
  NO = 0, //否
  YES = 1, //是
}

// 定期/活期
export enum FinancialType {
  FIXED = 1, //定期
  CURRENT = 2, //活期
}

/*-----------------功能配置start------------------*/
// 1开启，2关闭
export enum FunctionEnabledStatusEnum {
  OPEN = "1",
  CLOSE = "2",
}

interface FinancialConfiItem {
  id: number; //功能配置id
  financialSwitch: FunctionEnabledStatusEnum; //理财开关：1开启，2关闭
  isRealname: FunctionEnabledStatusEnum; //是否需要实名:1是，2否
  isDisplayAssets: FunctionEnabledStatusEnum; //是否显示资产：1是，2否
  isDisplayBackground: FunctionEnabledStatusEnum; //是否显示背景：1是，2否
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
  accumulateRevenue: number; //30日累计收益
}
export function getMyPosition(): Promise<RequestParams<MyPositionItem>> {
  return request(`${fixUrl2}/assets-web/v1/user-project/holdAssets`, {
    method: "POST",
  });
}
/*-----------------我的持仓end--------------------*/

/*-----------------理财订单start------------------*/
// 1.成功 2.失败 3.进行中
export enum FinancialOrderStatusEnum {
  SUCCESS = 1, //成功
  FAIL = 2, //失败
  PROCESSING = 3, //进行中
}

// 1.申购 2.赎回 3.利息
export enum FinancialOrderTypeEnum {
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
  type: FinancialOrderTypeEnum; // 1.申购 2.赎回
  resultStatusMap: FinancialOrderStatusEnum; // 1成功，2失败，3进行中
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
export enum RedemptionStatusEnum {
  FAIL = 0, //失败
  HOLDING = 1, //持仓中
  SUCCESS = 2, //成功赎回
}

export interface UserFinancialAccountParams {
  coinId?: number | null; //币种ID
  type: FinancialType; // 1定期 2活期
}
export interface UserFinancialAccountItem {
  id: number; //用户理财记录id
  projectId: number;
  coinId: number; //币种ID
  coinName: string; //币种名称
  iconUrl: string; //币种图标
  type: FinancialType; // 1定期 2活期
  minAnnualInterestRate: number; //最小年化利率
  maxAnnualInterestRate: number; //最大年化利率
  autoPurchase: OpenStatusEnum; //是否自动申购 0否，1是
  purchaseAmount: number; //申购金额
  usdPurchaseAmount: string; //USD申购金额
  accruedInterest: number; //累计收益
  usdAccruedInterest: string; //USD累计收益
  purchaseStatus: RedemptionStatusEnum; // 0失败，1持仓中，2成功赎回
}
export function getUserFinancialAccount(
  params: UserFinancialAccountParams
): Promise<RequestParams<UserFinancialAccountItem[]>> {
  return request(
    `${fixUrl2}/assets-web/v1/user-project/userFinancialProductList?type=${
      params.type
    }${params.coinId ? `&coinId=${params.coinId}` : ""}`,
    { method: "POST" }
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

//0未发布，1进行中，2待开始，3暂停，4下架，5售罄，6结束
export enum FinancialPageTokenStatusEnum {
  NOT_RELEASE = 0,
  IN_PROGRESS = 1,
  WAIT_START = 2,
  SUSPEND = 3,
  OFF_SHELF = 4,
  SOLD_OUT = 5,
  END = 6,
}

// 1按日付息，2到期还本利息
export enum SettlementInterestEnum {
  DAILY = 1,
  END = 2,
}

export interface FinancialPageTokenParams {
  coinId?: number;
  type?: FinancialType;
  status?: string;
  term?: string;
}

export interface FinancialPageTokenProductItem {
  id?: number; //项目ID
  projectName?: string; //项目名称
  interestRate?: string; //年化利率
  minAnnualInterestRate?: number; //最小年化利率
  maxAnnualInterestRate?: number; //最大年化利率
  type?: FinancialType; //类型
  typeText?: string; //类型文本
  term?: string; //期限
  termText?: string; //期限文本
  minPurchaseAmount?: number; //最小申购金额
  maxPurchaseAmount?: number; //最大申购金额
  totalQuota?: number; //总配额
  redemptionAmount?: number; //赎回金额
  isRedemption?: OpenStatusEnum; //是否赎回
  purchaseStartTime?: number; //申购开始时间
  purchaseEndTime?: number; //申购结束时间
  endCoinId?: number; //结束币种ID
  endCoinName?: string; //结束币种名称
  settlementInterest?: SettlementInterestEnum; //结算利息 1按日付息，2到期还本利息
  status?: FinancialPageTokenStatusEnum; //状态 0未发布，1进行中，2待开始，3暂停，4下架，5售罄，6结束
  statusText?: string; //状态文本
  assetBoundary?: number; //资产边界
}

export interface FinancialPageTokenItem {
  coinId?: number; //币种ID
  coinName?: string; //币种名称
  iconUrl?: string; //币种图标
  minInterestRate?: string; //最小年化利率
  maxInterestRate?: string; //最大年化利率
  termType?: string; //期限类型
  products?: FinancialPageTokenProductItem[]; //产品列表
}

export function getFinancialPageToken(
  params?: FinancialPageTokenParams
): Promise<RequestParams<FinancialPageTokenItem[]>> {
  return request(`${fixUrl}/home-web/v1/open/manageMoney/groupedProductList`, {
    method: "POST",
    body: JSON.stringify(params),
  });
}
/*-----------------理财页面tokenend--------------------*/

/*-----------------预估每日收益start------------------*/
export interface EstimateDailyIncomeParams {
  projectId: number;
  amount: number;
}

export function getEstimateDailyIncome(
  params: EstimateDailyIncomeParams
): Promise<RequestParams<number>> {
  return request(`${fixUrl2}/assets-web/v1/user-project/estimatedInterest`, {
    method: "POST",
    body: JSON.stringify(params),
  });
}
/*-----------------预估每日收益end--------------------*/

/*-----------------理财申购start------------------*/
export interface FinancialSubscribeParams {
  projectId: number;
  financialAmount: number;
  autoPurchase: OpenStatusEnum;
}

export function financialSubscribe(
  params: FinancialSubscribeParams
): Promise<RequestParams<boolean>> {
  return request(`${fixUrl2}/assets-web/v1/user-project/purchaseProject`, {
    method: "POST",
    body: JSON.stringify(params),
  });
}
/*-----------------理财申购end--------------------*/

/*-----------------理财页面-筛选下拉框start--------------------*/

export interface ProductFilterOptionsItem {
  term: string;
  type: number;
}
export function getProductFilterOptions(): Promise<
  RequestParams<ProductFilterOptionsItem[]>
> {
  return request(
    `${fixUrl}/home-web/v1/open/manageMoney/getProductFilterOptions`,
    {
      method: "POST",
    }
  );
}
/*-----------------理财页面-筛选下拉框end--------------------*/

export interface CoinFilterOptionsItem {
  id: number;
  coinId: number;
  coinName: string;
  iconUrl: string;
  canAutoWithdraw: number;
  canRecharge: number;
  canTransfer: number;
  canWithdraw: number;
  isPlatformCoin: number;
  minWithdrawAmount: number;
  nameDefault: string;
  sort: number;
  status: number;
  unit: string;
  unitScale: number;
  tenantId: string;
  createTime: number;
  updateTime: number;
  mianChain: number;
  maxWithdrawAmount: number;
  minTopUp: number;
  memoTag: number;
  issuingDate: string;
  transactionNum: number;
  maxSupplyQuantity: number;
  introduction: string;
  isTradeConvert: number;
  introductionVoList: [
    {
      id: string;
      languageCode: string;
      content: string;
    }
  ];
}
export function getCoinFilterOptions(): Promise<
  RequestParams<CoinFilterOptionsItem[]>
> {
  return request(`${fixUrl}/home-web/v1/exchange-coin/tenantCurrencyCoinList`, {
    method: "POST",
  });
}

/*-----------------理财账户-赎回显示start 活期------------------*/
export interface FinancialAccountRedemptionShowParams {
  id: number; //用户理财记录id
  projectId: number; // 项目id
  coinId: number; // 币种id
  type: FinancialType; // 1定期 2活期
}

export interface FinancialAccountRedemptionShowItem {
  totalAssets: number; // 今日资产
  redeemLimit: number; // 今日赎回上限
}
export function getFinancialAccountRedemptionShow(
  params: FinancialAccountRedemptionShowParams
): Promise<RequestParams<FinancialAccountRedemptionShowItem>> {
  return request(
    `${
      params.type === FinancialType.CURRENT
        ? `${fixUrl2}/assets-web/v1/user-project/redeemDisplay`
        : `${fixUrl2}/assets-web/v1/user-project/regularRedeemDisplay`
    }`,
    {
      method: "POST",
      body: JSON.stringify(params),
    }
  );
}

/*-----------------理财账户-赎回显示end 定期--------------------*/

/*-----------------理财账户-赎回start------------------*/

export interface FinancialAccountRedemptionParams {
  id: number; //用户理财记录id
  projectId: number; // 项目id
  coinId: number; // 币种id
  redeemMoney: number; // 赎回金额
}

export function financialAccountRedemption(
  params: FinancialAccountRedemptionParams
): Promise<RequestParams<boolean>> {
  return request(`${fixUrl2}/assets-web/v1/user-project/redeem`, {
    method: "POST",
    body: JSON.stringify(params),
  });
}
/*-----------------理财账户-赎回end--------------------*/

/*-----------------账单明细-start------------------*/

export enum FinancialAccountBillDetailsStatusEnum {
  PURCHASE = 1, //申购
  REDEEM = 2, //赎回
  INTEREST = 3, //利息
}

export interface FinancialAccountBillDetailsParams {
  pageNo?: number; //页码
  pageSize?: number; //每页条数
  coinId?: number | null; //币种ID
  type?: FinancialType | null; //1定期 2活期
  status?: FinancialAccountBillDetailsStatusEnum | null; //1申购，2赎回，3利息
  startTime?: number | null; //开始时间
  endTime?: number | null; //结束时间
}

export interface FinancialAccountBillDetailsItem {
  id: number; //id
  userId: number; //用户ID
  status: FinancialAccountBillDetailsStatusEnum; //1申购，2赎回，3利息
  coinId: number; //币种ID
  coinName: string; //币种名称
  amount: number; //金额
  endAmount: number; //结束金额
  createTime: number; //创建时间
  updateTime: number; //更新时间
  tenantId: string; //商户ID
  projectId: number; //项目ID
  type: FinancialType; //1定期 2活期
  usdtAmount: number; //usdt金额
  resultStatus: RedemptionStatusEnum; //1申购，2赎回，3利息
}

export function getFinancialAccountBillDetails(
  params: FinancialAccountBillDetailsParams
): Promise<RequestParams<FinancialAccountBillDetailsItem[]>> {
  return request(
    `${fixUrl2}/assets-web/v1/user-project/accountBillDetailList`,
    {
      method: "POST",
      body: JSON.stringify(params),
    }
  );
}

/*-----------------账单明细-end--------------------*/

/*-----------------开启自动申购start------------------*/

export interface FinancialAccountAutoPurchaseParams {
  id: number;
  autoPurchase: OpenStatusEnum;
}

export function financialAccountAutoPurchase(
  params: FinancialAccountAutoPurchaseParams
): Promise<RequestParams<boolean>> {
  return request(`${fixUrl2}/assets-web/v1/user-project/adjustAutoPurchase`, {
    method: "POST",
    body: JSON.stringify(params),
  });
}

/*-----------------开启自动申购end--------------------*/
