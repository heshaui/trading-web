
export interface CryptoItem {
    id: number;
    pair: string;
    price: number;
    change24h: number;
  }
  
  export interface CryptoRanking {
    title: string;
    data: CryptoItem[];
  }
  // 获取热门榜
  export interface HotMarketSymbol {
  id?: number;
  symbol?: string;
  symbolId?: number;
  sort?: string;
  tenantId?: string;
  createTime?: number;
  updateTime?: number;
  basesymbol?: string;
  coinSymbol?: string;
  iconUrl?: string;
}

export interface HotMarketResponse {
  code?: string;
  message?: string;
  reqNo?: string;
  data?: HotMarketSymbol[];
}

export interface HotMarketRequest {
  reqNo?: string;
}

// 现货市场
export interface CoinPriceResp {
  baseSymbol?: string;
  coinSymbol?: string;
  price?: string;
  yesterdayPrice?: string;
  quantity?: string;
  yesterdayQuantity?: string;
  turnover?: string;
  yesterdayTurnover?: string;
  height?: string;
  lower?: string;
}

export interface SpotMarketResponse {
  code?: string;
  message?: string;
  reqNo?: string;
  data?: CoinPriceResp[];
}

// 所有币种