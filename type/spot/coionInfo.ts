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
    id: string,
    coinName: string,
    fullName: string,
    name: string,
    project: string,
    marketCapRank: number,
    hotRank: number,
    marketCap: string,
    flowTotal: string,
    hisHighPrice: string,
    hisHighPriceTs: string,
    hisLowPrice: string,
    hisLowPriceTs: string,
    issuingDate: string,
    pubChain: string,
    initialPrice: string,
    maxSup: string,
    maxSupMar: string,
    selNumPer: string,
    yearReturn: string,
    threeMonthsReturn: string,
    turnOver: string,
    icon: string,
    introduce: string,
    narrativeSummary: string,
    narrativeUpdatedTime: string,
    coinAllot: string,
    members: string,
    agency: string,
    supportTokenUnlock: string,
    createTime: string,
    updateTime: string,
    cryptocurrency: string,
    marketData: string,
    officialUrl: string,
    nameDefault:string,
    iconUrl:string,
    
    socialMediaList:SocialMedia[],

    SocialMedia: {
      icon: string,
      name: string,
      title: string,
      url: string
    },
    
    CoinAllocation: {
      name: string,
      percent: string
    },
    
    Cryptocurrency: {
      blockBrowser: string,
      brief: string,
      classification: string,
      classificationId: string,
      currencyId: string,
      esgUrl: string,
      facebook: string,
      flowTotal: string,
      fullName: string,
      fullNameSeo: string,
      github: string,
      icon: string,
      introduce: string,
      introduceSeo: string,
      investor: string,
      investors: string,
      issueTime: string,
      issueTotal: string,
      members: string,
      newFlag: string,
      officialUrl: string,
      project: string,
      projectId: string,
      showEsgLink: string,
      showWarningText: string,
      status: string,
      telegram: string,
      twitter: string,
      videos: string,
      weChat: string,
      whitePaper: string
    },
    
    MarketData: {
      dayChangePercentage: string,
      dayHigh: string,
      dayLow: string,
      exchangeVol: string,
      flowTotal: string,
      fullyDilutedMC: string,
      fullyDilutedValuation: string,
      highPriceDate: string,
      high_price: string,
      historyLowPrice: string,
      historyLowPriceTime: string,
      holdTime: string,
      issuePrice: string,
      issueTime: string,
      last: string,
      marketCap: string,
      marketCapRank: string,
      maxFlowTotal: string,
      name: string,
      sevenDayChangePercentage: string,
      vol: string
    }
}

export interface introductionDataType {
    id: string;
    introduction: string;
    languageCode: string;
    content: string;
}