export interface SocialMedia {
    icon:string ,
    name:string ,
    title:string ,
    url:string ,
}

export interface CoinAllocation {
    name: string;
    percent: number;
}
export interface infoDataType {
    id: number;
    coinName: string;
    fullName: string; //币种简称
    name: string; //币种简称
    project: string; //项目名称
    marketCapRank: number; //市值排行
    hotRank: number; //热度排行
    marketCap: number; //市值
    flowTotal: number; //流通量
    hisHighPrice: number; //历史最高价
    hisHighPriceTs: number; //历史最高价时间戳
    hisLowPrice: number; //历史最低价
    hisLowPriceTs: number; //历史最低价时间戳
    issuingDate: string; //发行日期
    pubChain: string[]; //所属公链
    initialPrice: number; //首次发行价
    maxSup: number; //最大供应量
    maxSupMar: number; //最大供应市值
    selNumPer: number; //流通率
    yearReturn: number; //年化收益率
    threeMonthsReturn: number; //三个月收益率
    turnOver: number; //成交量
    icon: string; //币种图标
    introduce: string; //简介
    narrativeSummary: string; //叙事摘要
    narrativeUpdatedTime: string; //叙事更新时间
    socialMediaList: SocialMedia[]; //社交媒体列表
    coinAllot: CoinAllocation[]; //币种分配
    members: string[]; //成员列表
    agency: string[]; //机构列表
    supportTokenUnlock: boolean; //是否支持代币解锁
    createTime: number; //创建时间
    updateTime: number; //更新时间
}

export interface introductionDataType {
    id: string;
    introduction: string;
    languageCode: string;
    content: string;
}