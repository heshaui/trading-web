// 模拟历史K线数据生成函数
export const generateMockBars = (
  startTime: number, 
  count: number, 
  interval: string
): {time: number, open: number, high: number, low: number, close: number, volume: number}[] => {
  const bars = [];
  let time = startTime;
  let price = 100 + Math.random() * 50;

  // 根据不同时间间隔计算时间步长
  const getTimeStep = (interval: string): number => {
    switch(interval) {
      case '10s': return 10;
      case '30s': return 30;
      case '1m': return 60;
      case '3m': return 3 * 60;
      case '5m': return 5 * 60;
      case '15m': return 15 * 60;
      case '30m': return 30 * 60;
      case '1h': return 60 * 60;
      case '2h': return 2 * 60 * 60;
      case '4h': return 4 * 60 * 60;
      case '6h': return 6 * 60 * 60;
      case '8h': return 8 * 60 * 60;
      case '12h': return 12 * 60 * 60;
      case '1D': return 24 * 60 * 60;
      case '1W': return 7 * 24 * 60 * 60;
      case '1M': return 30 * 24 * 60 * 60;
      default: return 60;
    }
  };

  const timeStep = getTimeStep(interval);
  
  for (let i = 0; i < count; i++) {
    // 生成随机价格波动
    const change = (Math.random() * 2 - 1) * 2;
    price = Math.max(1, price + change);
    
    const open = price;
    const close = price + (Math.random() * 2 - 1) * 2;
    const high = Math.max(open, close) + Math.random() * 2;
    const low = Math.min(open, close) - Math.random() * 2;
    const volume = Math.round(Math.random() * 1000);
    
    bars.push({
      time: time,
      open,
      high,
      low,
      close,
      volume
    });
    
    time += timeStep;
  }
  
  return bars;
};

// 股票符号映射
export const symbolsData = {
  AAPL: { name: "Apple Inc", fullName: "NASDAQ:AAPL", description: "苹果公司股票" },
  GOOGL: { name: "Alphabet Inc", fullName: "NASDAQ:GOOGL", description: "谷歌母公司股票" },
  TSLA: { name: "Tesla Inc", fullName: "NASDAQ:TSLA", description: "特斯拉公司股票" },
  MSFT: { name: "Microsoft", fullName: "NASDAQ:MSFT", description: "微软公司股票" },
  BTC: { name: "Bitcoin", fullName: "CRYPTO:BTC", description: "比特币" }
};

// TradingView数据馈送模拟实现
export const mockDatafeed = {
  onReady: (callback: (configuration: any) => void) => {
    setTimeout(() => callback({
      supported_resolutions: ["10s", "30s", "1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "8h", "12h", "1D", "1W", "1M"],
      supports_marks: false,
      supports_timescale_marks: false,
      supports_time: true,
      exchanges: [
        { value: "NASDAQ", name: "NASDAQ", desc: "NASDAQ" },
        { value: "CRYPTO", name: "Crypto", desc: "加密货币" }
      ]
    }), 0);
  },
  
  searchSymbols: (
    userInput: string,
    exchange: string,
    symbolType: string,
    onResult: (result: any[]) => void
  ) => {
    const results = Object.entries(symbolsData)
      .filter(([symbol]) => symbol.toLowerCase().includes(userInput.toLowerCase()))
      .map(([symbol, details]) => ({
        symbol,
        full_name: details.fullName,
        description: details.description,
        exchange: details.fullName.split(':')[0],
        ticker: symbol,
        type: 'stock'
      }));
    
    onResult(results);
  },
  
  resolveSymbol: (
    symbolName: string,
    onResolve: (symbolInfo: any) => void,
    onError: (error: string) => void
  ) => {
    const symbol = symbolsData[symbolName as keyof typeof symbolsData] || symbolsData.AAPL;
    if (!symbol) {
      onError('找不到交易对');
      return;
    }
    
    setTimeout(() => {
      onResolve({
        name: symbolName,
        full_name: symbol.fullName,
        description: symbol.description,
        type: 'stock',
        session: '24x7',
        timezone: 'Asia/Shanghai',
        exchange: symbol.fullName.split(':')[0],
        minmov: 1,
        pricescale: 100,
        has_intraday: true,
        has_no_volume: false,
        has_weekly_and_monthly: true,
        supported_resolutions: ["10s", "30s", "1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "8h", "12h", "1D", "1W", "1M"],
        volume_precision: 0,
        data_status: 'streaming',
      });
    }, 0);
  },
  
  getBars: (
    symbolInfo: any,
    resolution: string,
    periodParams: {from: number, to: number, firstDataRequest: boolean},
    onResult: (bars: any[], meta: {noData: boolean}) => void
  ) => {
    const { from, to } = periodParams;
    const count = (to - from) / (resolution === '1D' ? 86400 : 60);
    const bars = generateMockBars(from, Math.min(1000, count), resolution);
    
    onResult(bars, { noData: bars.length === 0 });
  },
  
  subscribeBars: (
    symbolInfo: any,
    resolution: string,
    onRealtimeCallback: (bar: any) => void,
    subscriberUID: string,
    onResetCacheNeededCallback: () => void
  ) => {
    const lastBar = {
      time: Math.floor(Date.now() / 1000),
      open: 150 + Math.random() * 5,
      high: 155 + Math.random() * 5,
      low: 145 + Math.random() * 5,
      close: 152 + Math.random() * 5,
      volume: Math.round(Math.random() * 1000)
    };
    
    const intervalId = setInterval(() => {
      const change = (Math.random() * 2 - 1) * 2;
      lastBar.close = Math.max(1, lastBar.close + change);
      lastBar.high = Math.max(lastBar.high, lastBar.close);
      lastBar.low = Math.min(lastBar.low, lastBar.close);
      lastBar.time += 60; // 每分钟更新
      lastBar.volume += Math.round(Math.random() * 100);
      
      onRealtimeCallback(lastBar);
    }, 1000);
    
    return intervalId;
  },
  
  unsubscribeBars: (subscriberUID: string) => {
    clearInterval(Number(subscriberUID));
  }
}; 