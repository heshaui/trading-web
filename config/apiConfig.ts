export const API_MODULE_NAME = {
	AMBIT_HOME_WEB:'ambit-home-web' , 
	AMBIT_INFORM_WEB:"ambit-inform-web",
	AMBIT_AUTH:"ambit-auth",//认证接口/用户登录注册相关
	AMBIT_USER_WEB:"ambit-user-web",//用户接口
	AMBIT_OSS:"ambit-oss",
	AMBIT_ASSETS_WEB:"ambit-assets-web",//资产接口
};

export interface identityInfoType {
	id: number;
    userId: number;
    surname: string;
    firstName: string;
    countryId: number;
    cardType: number;
    cardCode: string;
    cardName: string;
    birthday: string;
    currentLanguage: string;
    firstCheckTime: number;
    currentCheckTime: number;
    authStatus: number;
    frontUrl: string;
    backUrl: string;
    selfieUrl: string;
    createTime: number;
    updateTime: number;
    tenantId: string;
}

export const LOCAL_STORAGE_KEY = {
	USER_INFO:'imbit_userInfo' , 
	USER_TOKEN:"imbit_userToken",
    OUT_MONEY:"imbit_out_money",
};

export const ROUTER_KEY_ASSETS = {
    ACCOUNT:"/assets/assetsAccount", //资产页面/现货账户
	WITHDRAW_MONEY:"/assets/assetsAccount/withdrawMoney", //提现页面
	TOP_UP:"/assets/assetsAccount/topUp", //充值页面
    BILL:"/assets/billDetails", //账单页面
    ADDADRESS:"/assets/assetsAccount/addAddress", //添加地址页面

    FUTURE_ACCOUNT:"/assets/futureAccount", //合约账户
};
export const ROUTER_KEY_SPOT = {
    INDEX:"/exchange", //首页
};