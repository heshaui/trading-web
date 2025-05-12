import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { widget } from "../../public/charting_library";
import "@/styles/components/Tradingview.module.css";
import WebSocketService from '@/utils/websocket';
import { useThemeMode } from "@/hooks/useThemeMode";
export interface TradingviewProps {
  symbol?: string;
  showLeftToolbar?: boolean;
  chartType?: number;
  klineData?: any;
  timeInterval?: string;
  isDayMode?: boolean;
}

export interface TradingviewRefHandle {
  addVolumeDistribution: () => void;
  resetChart: () => void;
  handleAddIndicator: () => void;
  handleChartScreenshot: () => void;
  toggleFullScreen: () => void;
}

const Tradingview: React.ForwardRefRenderFunction<
  TradingviewRefHandle,
  TradingviewProps
> = (
  {
    symbol,
    showLeftToolbar = false,
    chartType = 9,
    klineData = [],
    timeInterval = "15m"
  },
  ref
) => {
    const { isDayMode } = useThemeMode();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [tvWidget, setTvWidget] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showIntervalDialog, setShowIntervalDialog] = useState(false);
  const [tradTime, setTradTime] = useState("1D");
  const [intervals] = useState([
    "1",
    "3",
    "5",
    "15",
    "30",
    "60",
    "120",
    "240",
    "360",
    "480",
    "720",
    "D",
    "W",
    "M"
  ]);
  const [lineType] = useState([
    { text: "Line", type: 8 },
    { text: "Bar", type: 1 },
    { text: "Candlestick", type: 9 },
    { text: "Area", type: 3 },
    { text: "Heikin Ashi", type: 13 },
  ]);
 
  const [target, setTarget] = useState<any[]>([
    { text: "EMA" },
    { text: "MACD" },
    { text: "KDJ" },
    { text: "BOLL" },
    { text: "RSI-S-I" },
    { text: "Stochastic" },
    { text: "S-RSI" },
    { text: "TRIX" },
    { text: "PO" },
    { text: "PC" },
    { text: "PVT" },
    { text: "CC" },
    { text: "KST" },
    { text: "Momentum" },
    { text: "DM" },
    { text: "AO" },
  ]);
  const wsDataRef = useRef(klineData);
  const initCompletedRef = useRef(false);
  const scrollContainer = useRef<HTMLUListElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isLeftHovered, setIsLeftHovered] = useState(false);
  const [isRightHovered, setIsRightHovered] = useState(false);
  const [hoveredItemIndex, setHoveredItemIndex] = useState<number | null>(null);

  // 假设主题色，如果项目中已有变量请使用已有的
  const themeColor = 'var(--theme-color, #1890ff)'; // 使用CSS变量或者默认为蓝色

  useEffect(() => {
    console.log(timeInterval)
    
    // 添加这段代码：将timeInterval转换为TradingView格式
    let tvTimeInterval = timeInterval;
    if (timeInterval === "1m") tvTimeInterval = "1";
    if (timeInterval === "3m") tvTimeInterval = "3";
    if (timeInterval === "5m") tvTimeInterval = "5";
    if (timeInterval === "15m") tvTimeInterval = "15";
    if (timeInterval === "30m") tvTimeInterval = "30";
    if (timeInterval === "1h") tvTimeInterval = "60";
    if (timeInterval === "2h") tvTimeInterval = "120";
    if (timeInterval === "4h") tvTimeInterval = "240";
    if (timeInterval === "6h") tvTimeInterval = "360";
    if (timeInterval === "8h") tvTimeInterval = "480";
    if (timeInterval === "12h") tvTimeInterval = "720";
    if (timeInterval === "1D") tvTimeInterval = "D";
    if (timeInterval === "1W") tvTimeInterval = "W";
    if (timeInterval === "1M") tvTimeInterval = "M";
    
    // 保存初始数据但不触发重渲染
    if (klineData && klineData.length > 0) {
      wsDataRef.current = klineData;
    }
    
    let datafeed: any = null;
    
    try {
      if (chartContainerRef.current && !initCompletedRef.current) {
        const chartSymbol = symbol || "BTC_USDT_1";
        datafeed = createDatafeed(wsDataRef.current, tvTimeInterval, symbol || "BTC_USDT_1", timeInterval);
        
        // 根据父组件参数决定禁用的功能
        const disabledFeatures = [
          "header_widget",
          "use_localstorage_for_settings",
          "timeframes_toolbar",
          "symbol_search",
          "symbol_info",
          "header_symbol_search",
          "header_compare",
          "compare_symbol", 
          "display_market_status",
          "symbol_change",
        ];
        
        
        
        const widgetOptions = {
          symbol: chartSymbol,
          datafeed: datafeed,
          interval: tvTimeInterval,
          container: chartContainerRef.current,
          library_path: "/charting_library/",
          locale: "zh",
          charts_storage_url: "http://saveload.tradingview.com",
          charts_storage_api_version: "1.1",
          client_id: "tradingview.com",
          user_id: "public_user_id",
          fullscreen: false,
          autosize: true,
          enabled_features: ["study_templates"],
          timezone: "Asia/Shanghai",
          debug: false,
          theme: isDayMode ? "light" : "dark",
          disabled_features: disabledFeatures,
        };

        const newWidget = new widget(widgetOptions as any);
        setTvWidget(newWidget);
        
        // 设置图表类型
        newWidget.onChartReady(() => {
          newWidget.chart().setChartType(chartType);
        });
        
        // 标记初始化已完成
        initCompletedRef.current = true;
        
        // 设置WebSocket更新处理
        window.__tradingViewHandlersInitialized = true;
        
        window.__handleTradingViewUpdate = (newData: any) => {
          if (window.__tradingViewUpdateBar) {
            window.__tradingViewUpdateBar(newData);
          }
        };
      }
    } catch (error) {
      console.error("TradingView 初始化错误:", error);
    }

    return () => {
      if (tvWidget) {
        try {
          tvWidget.remove();
          initCompletedRef.current = false;
        } catch (e) {
          console.error("移除图表错误:", e);
        }
        setTvWidget(null);
      }
    };
  }, [symbol, timeInterval, showLeftToolbar, chartType, isDayMode]);

  // 单独处理WebSocket数据更新
  useEffect(() => {
    if (!tvWidget || !klineData || klineData.length === 0) return;
    
    // 更新引用但不重新初始化图表
    wsDataRef.current = klineData;

    
    // 如果需要，这里可以手动调用更新函数
    if (window.__handleTradingViewUpdate && klineData) {
      window.__handleTradingViewUpdate(klineData);
    }
  }, [klineData, tvWidget]);

  const toggleModal = () => setShowModal(!showModal);

  const setChartInterval = (interval: string) => {
    if (tvWidget) {
      let tvInterval = interval || "1";
      
      if (interval === "1m") tvInterval = "1";
      if (interval === "3m") tvInterval = "3";
      if (interval === "5m") tvInterval = "5";
      if (interval === "15m") tvInterval = "15";
      if (interval === "30m") tvInterval = "30";
      if (interval === "1h") tvInterval = "60";
      if (interval === "2h") tvInterval = "120";
      if (interval === "4h") tvInterval = "240";
      if (interval === "6h") tvInterval = "360";
      if (interval === "8h") tvInterval = "480";
      if (interval === "12h") tvInterval = "720";
      if (interval === "1D") tvInterval = "D";
      if (interval === "1W") tvInterval = "W";
      if (interval === "1M") tvInterval = "M";
      
      tvWidget.chart().setResolution(tvInterval);
      setTradTime(interval);
      setShowIntervalDialog(false);
    }
  };
  //手动添加指标
  const addIndicator = (studyName: string) => {
    const studyMappings: any = {
      "Moving Average": { name: "Moving Average" },
      EMA: { name: "Moving Average Exponential" },
      MACD: { name: "MACD" },
      KDJ: { name: "Stochastic" }, // 更正为 Stochastic
      BOLL: { name: "Bollinger Bands" },
      "TD Sequential": { name: "TD Sequential" },
      "RSI-S-I": { name: "Relative Strength Index" },
      Stochastic: { name: "Stochastic" },
      "S-RSI": { name: "Stochastic RSI" },
      SMI: { name: "SMI" },
      TRIX: { name: "TRIX" },
      PO: { name: "Price Oscillator" },
      PC: { name: "Price Channel" },
      PVT: { name: "Price Volume Trend" },
      CC: { name: "Commodity Channel Index" },
      KST: { name: "Know Sure Thing" },
      NV: { name: "Negative Volume Index" },
      Momentum: { name: "Momentum" },
      DM: { name: "Directional Movement" },
      AO: { name: "Awesome Oscillator" },
    };

    if (tvWidget && studyMappings[studyName]) {
      const chart = tvWidget.chart();
      chart.createStudy(
        studyMappings[studyName].name,
        false,
        true,
        [], // Params depending on the study
        {}, // Overrides depending on the study
        {} // Inputs depending on the study
      );
    }
  };

  //图表截图
  const handleChartScreenshot = () => {
    if (tvWidget) {
      tvWidget.chart().executeActionById('screenshot');
    }
  };


  const toggleFullScreen = () => {
    // const element = this.$refs.chartContainer;
    const element = chartContainerRef.current;

    // 首先检查element是否存在
    if (!element) {
      console.error("Element is undefined.");
      return;
    }

    // 检查浏览器支持的全屏API
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } 
  }


  //技术指标搜索
  const handleAddIndicator = () => {
    if (tvWidget) {
      tvWidget.chart().executeActionById('insertIndicator');
    }
  };

  //成交量分布
  const addVolumeDistribution = () => {
    if (tvWidget) {
      tvWidget
        .chart()
        .createStudy("Volume Profile Visible Range", false, false, [
          /* ... 参数 ... */
        ]);
    }
  };

  //重置图表
  const resetChart = () => {
    if (tvWidget) {
      tvWidget.chart().removeAllShapes();
      tvWidget
        .chart()
        .getAllStudies()
        .forEach((study: any) => {
          // 移除指标
          if (study.name != "Volume") {
            tvWidget.chart().removeEntity(study.id);
          }
        });
    }
  };

  // expose imperative handlers
  useImperativeHandle(ref, () => ({
    addVolumeDistribution,
    resetChart,
    handleAddIndicator,
    handleChartScreenshot,
    toggleFullScreen
  }));

  const setChartType = (typeCode: number) => {
    if (tvWidget) {
      tvWidget.chart().setChartType(typeCode);
      setShowModal(false);
    }
  };

  const createDatafeed = (initialData: any, tvTimeInterval: string, symbol: string, originalInterval: string) => {
    const subscribers: any = {};
    // 添加请求缓存对象
    const requestCache: {[key: string]: {timestamp: number, data: any}} = {};
    // 缓存过期时间(毫秒)
    const CACHE_EXPIRY = 30000; // 30秒
    
    // 先定义时间格式化函数
    const formatTimeValue = (timeValue: any): number => {
      try {
        if (timeValue === undefined || timeValue === null) {
          return Date.now();
        }
        
        if (typeof timeValue === 'number') {
          return timeValue < 10000000000 ? timeValue * 1000 : timeValue;
        } 
        
        if (typeof timeValue === 'string') {
          const parsedTime = new Date(timeValue).getTime();
          return isNaN(parsedTime) ? Date.now() : parsedTime;
        }
        
        return Date.now();
      } catch (error) {
        return Date.now();
      }
    };
    
    // 预处理初始数据
    const bars: any[] = [];
    
    // 处理初始K线数据
    if (Array.isArray(initialData) && initialData.length > 0) {
      // 这里可以添加对初始数据的处理
    }
    
    // 更新实时数据处理函数
    window.__tradingViewUpdateBar = (data: any) => {
      if (!data) return;
      
      try {
        let bar;
        
        // 处理不同格式的数据
        if (Array.isArray(data)) {
          // 处理数组格式
          bar = {
            time: formatTimeValue(data[0]),
            open: Number(data[1] || 0),
            high: Number(data[2] || 0),
            low: Number(data[3] || 0),
            close: Number(data[4] || 0),
            volume: Number(data[5] || 0)
          };
        } else if (data.data && Array.isArray(data.data)) {
          // 处理{type: 'kline', data: [...]}格式
          const klineData = data.data[data.data.length - 1];
          if (Array.isArray(klineData)) {
            bar = {
              time: formatTimeValue(klineData[0]),
              open: Number(klineData[1] || 0),
              high: Number(klineData[2] || 0),
              low: Number(klineData[3] || 0),
              close: Number(klineData[4] || 0),
              volume: Number(klineData[5] || 0)
            };
          } else {
            bar = {
              time: formatTimeValue(data.timestamp || data.time),
              open: Number(data.open || 0),
              high: Number(data.high || 0),
              low: Number(data.low || 0),
              close: Number(data.close || 0),
              volume: Number(data.volume || 0)
            };
          }
        } else {
          // 处理对象格式
          bar = {
            time: formatTimeValue(data.timestamp || data.time),
            open: Number(data.open || 0),
            high: Number(data.high || 0),
            low: Number(data.low || 0),
            close: Number(data.close || 0),
            volume: Number(data.volume || 0)
          };
        }
        
        // 通知所有订阅者
        Object.values(subscribers).forEach((callback: any) => {
          if (typeof callback === 'function') {
            callback(bar);
          }
        });
      } catch (error) {
        console.error('更新数据错误:', error);
      }
    };
    
    return {
      onReady: (cb: any) => {
        setTimeout(() => cb({
          supported_resolutions: ["1", "3", "5", "15", "30", "60", "120", "240", "360", "480", "720", "D", "W", "M"],
          supports_marks: false,
          supports_timescale_marks: false,
          supports_time: true
        }), 0);
      },
      
      subscribeBars: (
        symbolInfo: any,
        resolution: any,
        onRealtimeCallback: any,
        listenerGUID: any
      ) => {
        console.log("订阅K线数据, 当前数据:", initialData);
        subscribers[listenerGUID] = onRealtimeCallback;
        
        // 处理K线数据 
        if (initialData && initialData.type === 'kline' && initialData.data && initialData.data.length > 0) {
          // 遍历所有K线数据
          initialData.data.forEach((kline: any) => {
              if (Array.isArray(kline) && kline.length >= 6) {
                  // 将数组格式转换为对象格式
                  const bar = {
                      time: kline[0],  // 时间戳
                      open: parseFloat(kline[1]),  // 开盘价
                      high: parseFloat(kline[2]),  // 最高价
                      low: parseFloat(kline[3]),   // 最低价
                      close: parseFloat(kline[4]), // 收盘价
                      volume: parseFloat(kline[5]) // 成交量
                  };
                  
                  // 将处理后的数据传递给TradingView
                  onRealtimeCallback(bar);
              }
          });
        }
      },
      
      unsubscribeBars: (listenerGUID: any) => {
        delete subscribers[listenerGUID];
      },
      
      searchSymbols: (userInput: any, exchange: any, symbolType: any, onResultReadyCallback: any) => {
        onResultReadyCallback([]);
      },
      
      resolveSymbol: (
        symbolName: any,
        onSymbolResolvedCallback: any,
        onResolveErrorCallback: any
      ) => {
        const symbolParts = symbolName.split('_');
        const baseSymbol = symbolParts[0] || 'BTC';
        
        setTimeout(() => onSymbolResolvedCallback({
          name: symbolName,
          description: `${baseSymbol}/USDT`,
          type: "crypto",
          session: "24x7",
          timezone: "Etc/UTC",
          exchange: "",
          minmov: 1,
          pricescale: 100000,
          has_intraday: true,
          has_no_volume: false,
          has_weekly_and_monthly: true,
          supported_resolutions: ["1", "3", "5", "15", "30", "60", "120", "240", "360", "480", "720", "D", "W", "M"],
          volume_precision: 8,
          data_status: "streaming",
        }), 0);
      },
      
      getBars: async (
        symbolInfo: any,
        resolution: any,
        periodParams: any,
        onHistoryCallback: any,
        onErrorCallback: any
      ) => {
        try {
          const startTime = periodParams.from * 1000;
          const endTime = periodParams.to * 1000;
          
          // 创建缓存键，使用原始格式
          const cacheKey = `${symbol}_${originalInterval}_${startTime}_${endTime}`;
          
          // 检查缓存中是否有有效数据
          const now = Date.now();
          if (requestCache[cacheKey] && 
              now - requestCache[cacheKey].timestamp < CACHE_EXPIRY) {
            console.log("使用缓存数据:", cacheKey);
            const cachedData = requestCache[cacheKey].data;
            
            if(cachedData.type === 'kline' && Array.isArray(cachedData.data)) {
              const formattedBars = cachedData.data.map((kline: any) => ({
                time: kline[0],
                open: parseFloat(kline[1]),
                high: parseFloat(kline[2]),
                low: parseFloat(kline[3]),
                close: parseFloat(kline[4]),
                volume: parseFloat(kline[5])
              }));
              
              onHistoryCallback(formattedBars, { noData: formattedBars.length === 0 });
              return;
            }
          }
          console.log('请求的',originalInterval)
          // 使用原始的时间间隔格式构建URL
          const url = `${process.env.NEXT_PUBLIC_WEB_API_BASE}/kline/${symbol}/${originalInterval}/range?start_time=${startTime}&end_time=${endTime}&limit=1000`;
          
          console.log("获取图表数据:", url);
          const response = await fetch(url);
          
          if(response.status === 200) {
            const data = await response.json();
            
            // 将结果存入缓存
            requestCache[cacheKey] = {
              timestamp: now,
              data: data
            };
            
            if(data.type === 'kline' && Array.isArray(data.data)) {
              const formattedBars = data.data.map((kline: any) => ({
                time: kline[0],
                open: parseFloat(kline[1]),
                high: parseFloat(kline[2]),
                low: parseFloat(kline[3]),
                close: parseFloat(kline[4]),
                volume: parseFloat(kline[5])
              }));
              
              onHistoryCallback(formattedBars, { noData: formattedBars.length === 0 });
            } else {
              console.error('获取历史数据格式错误:', data);
              onHistoryCallback([], { noData: true });
            }
          } else {
            console.error('API请求失败:', response.status);
            onHistoryCallback([], { noData: true });
          }
        } catch (error) {
          console.error('获取历史数据错误:', error);
          onHistoryCallback([], { noData: true });
        }
      },
    };
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainer.current) {
      const scrollAmount = 200; // 可以根据需要调整滚动距离
      const newScrollLeft = direction === 'left' 
        ? scrollContainer.current.scrollLeft - scrollAmount
        : scrollContainer.current.scrollLeft + scrollAmount;
      
      scrollContainer.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (scrollContainer.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5); // 5px 容差
    }
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <ul>
              {lineType.map((item, index) => (
                <li key={index} onClick={() => setChartType(item.type)}>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {showIntervalDialog && (
        <div
          className="interval-dialog-overlay"
          onClick={() => setShowIntervalDialog(false)}
        >
          <div
            className="interval-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            {intervals.map((interval) => (
              <div
                key={interval}
                className={`interval-option ${
                  interval === tradTime ? "active" : ""
                }`}
                onClick={() => setChartInterval(interval)}
              >
                {interval}
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        className="TVChartContainer"
        ref={chartContainerRef}
        style={{ width: "100%", height: "550px", margin: "auto"}}
      ></div>
      <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
        {showLeftArrow && (
          <button 
            onClick={() => scroll('left')}
          
            style={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              // background: isLeftHovered ? themeColor : 'rgba(255,255,255,0.9)',
              color: isLeftHovered ? '#fff' : isDayMode ? '#333' : '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            &lt;
          </button>
        )}
        
        <div style={{ overflow: 'hidden', margin: '0 35px' }}>
          <ul 
            ref={scrollContainer}
            onScroll={handleScroll}
            style={{ 
              display: "flex", 
              overflow: "auto",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              whiteSpace: "nowrap",
              padding: "10px 0",
              margin: 0,
              listStyle: "none",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            {target.map((item, index) => (
              <li 
                key={index} 
                style={{ 
                  marginRight: index === target.length - 1 ? 0 : "20px",
                  padding: "0 5px",
                  color: hoveredItemIndex === index ? themeColor : 'inherit',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={() => setHoveredItemIndex(index)}
                onMouseLeave={() => setHoveredItemIndex(null)}
                onClick={() => addIndicator(item.text)}
              >
                {item.text}
              </li>
            ))}
          </ul>
        </div>
        
        {showRightArrow && (
          <button 
            onClick={() => scroll('right')}
            // onMouseEnter={() => setIsRightHovered(true)}
            // onMouseLeave={() => setIsRightHovered(false)}
            style={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              // background: isRightHovered ? themeColor : 'rgba(255,255,255,0.9)',
              color: isRightHovered ? '#fff' : isDayMode ? '#333' : '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            &gt;
          </button>
        )}
      </div>
    </div>
  );
};

declare global {
  interface Window {
    __tradingViewUpdateBar: any;
    __handleTradingViewUpdate: any;
    __tradingViewHandlersInitialized: boolean;
  }
}

export default forwardRef(Tradingview);