export const API_MODULE_NAME = {
  AMBIT_HOME_WEB: "ambit-home-web",
  AMBIT_INFORM_WEB: "ambit-inform-web",
  AMBIT_AUTH: "ambit-auth", //认证接口/用户登录注册相关
  AMBIT_USER_WEB: "ambit-user-web", //用户接口
  AMBIT_OSS: "ambit-oss",
  AMBIT_ASSETS_WEB: "ambit-assets-web", //资产接口
};
// 本地存储key
export const LOCAL_STORAGE_KEY = {
  USER_INFO: "imbit_userInfo", // 用户信息
  USER_TOKEN: "imbit_userToken", // 用户token
  INVITE_INFO: "imbit_invite_info", // 邀请信息
  OUT_MONEY: "imbit_out_money", // 提现数据
  CURRENCY_PAIRS: "currency_pairs", // 币对数据
  CURRENT_PAIR: "current_pair", // 当前币对
  CURRENT_COIN: "current_coin", // 币种数据
  RATE_DATA: "rate_data", //汇率数据
  PATH_FORBIDDEN: "path_forbidden", // 禁止路径
  RATE_KEY: "rate_key", // 汇率key
  CACHED_RATE_DATA: "cachedRateData", // 缓存汇率数据
  LANG: "lang", // 当前语言
  LANGUAGE_LIST: "cachedLanguageList", //语言列表
  KV_CONFIG: "kv_config", // kv配置
  FLASH_CONFIG: "flash_config", // 闪兑配置
  USDT_RATE: "usdt_rate", // USDT汇率
  PUBLIC_INFO: "public_info", // 公共信息
  USER_CONFIG: "user_config", // 用户合约配置
  CONTRACT_ASSETS: "contract_assets", // 合约资产
  CURRENT_CONTRACT_INFO: "current_contract_info", // 当前合约信息
  MARKET_INFO: "market_info", // 市场信息
  FINANCIAL_CONFIG: "financial_config", // 理财配置
  COUNTRY_LIST: "country_list", // 国家列表
};

export const KV_KEYS = [
  "theme", //主题色
  "logo", //logo
  "footer_setting", //底部设置
  "fee_direction", //手续费方向
  "out_money", //提现配置
  "tenant_cache_name", //商户名称
  "account_configuration", //邀请开关
  "nickname_modify_time", //昵称修改时间
  "flash_img", //闪兑配置
  "user_agreement", //用户协议
  "privacy_policy", //隐私政策
  "financial", //理财配置
  // 可以根据需要添加更多配置项
];

export const ROUTER_KEY_ASSETS = {
  WITHDRAW_MONEY: "/assets/spot/withdrawMoney", //提现页面
  TOP_UP: "/assets/spot/topUp", //现货充值页面
  ADDADRESS: "/assets/address", //添加地址页面
  CONTRACT_TOP_UP: "/assets/contract/topUp", //合约充值页面

  FINANCIAL_ACCOUNT: "/assets/financial", //理财账户
  CONTRACT_ACCOUNT: "/assets/contract", //合约账户
  SPOT_ACCOUNT: "/assets/spot", //现货账户
};
export const ROUTER_KEY_SPOT = {
  INDEX: "/exchange", //现货交易页面
  SPOT_ORDER: "/spotOrder", //现货订单
  FLASH_ORDER: "/flashOrder", //闪兑订单
  FINANCIAL_ORDER: "/financialOrder", //理财订单
  CONTRACT_ORDER: "/contractOrder", //合约订单
  BILL: "/billDetails", //账单页面
};
export const ROUTER_KEY_OPEN = {
  LOGIN: "/login", //登录页面
  REGISTER: "/register", //注册页面
};
export const ROUTER_KEY_USERCENTER = {
  USERCENTER: "/userCenter", //用户中心
  IDENTITY: "/userCenter/identity", //身份认证
};
