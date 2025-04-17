import React, { useState, useEffect, useRef } from "react";
import { widget } from "../../public/charting_library";
import "@/styles/components/Tradingview.module.css";
import WebSocketService from '@/utils/websocket';

interface TradingviewProps {
  symbol?: string;
  showLeftToolbar?: boolean;
  chartType?: number;
  klineData?: any;
  timeInterval?: string;
}

const Tradingview: React.FC<TradingviewProps> = ({ 
  symbol = "BTC_USDT_1",
  showLeftToolbar = false,
  chartType = 9,
  klineData = [],
  timeInterval = "1D"
}) => {
  console.log(klineData,'klineData');
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [tvWidget, setTvWidget] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showIntervalDialog, setShowIntervalDialog] = useState(false);
  const [tradTime, setTradTime] = useState("1D");
  const [intervals] = useState([
    "10S",
    "30S",
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
  const [target] = useState([
    { text: "EMA" },
    { text: "MACD" },
    { text: "KDJ" },
    { text: "BOLL" },
    { text: "RSI" },
  ]);
  const wsDataRef = useRef(klineData);
  const initCompletedRef = useRef(false);

  useEffect(() => {
    
    // 保存初始数据但不触发重渲染
    if (klineData && klineData.length > 0) {
      wsDataRef.current = klineData;
    }
    
    let datafeed: any = null;
    
    try {
      if (chartContainerRef.current && !initCompletedRef.current) {
        const chartSymbol = symbol || "BTC_USDT_1";
        datafeed = createDatafeed(wsDataRef.current, tradTime);
        
        // 根据父组件参数决定禁用的功能
        const disabledFeatures = [
          "header_widget",
          "use_localstorage_for_settings",
          "timeframes_toolbar",
        ];
        
        // 如果不显示左侧工具栏，则添加到禁用列表
        if (!showLeftToolbar) {
          disabledFeatures.push("left_toolbar");
        }
        
        const widgetOptions = {
          symbol: chartSymbol,
          datafeed: datafeed,
          interval: tradTime,
          container: chartContainerRef.current,
          library_path: "/charting_library/",
          locale: "en",
          charts_storage_url: "http://saveload.tradingview.com",
          charts_storage_api_version: "1.1",
          client_id: "tradingview.com",
          user_id: "public_user_id",
          fullscreen: false,
          autosize: true,
          enabled_features: ["study_templates"],
          timezone: "Asia/Shanghai",
          debug: false,
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
  }, [symbol, tradTime, showLeftToolbar, chartType]);

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

  const addIndicator = (studyName: string) => {
    if (tvWidget) {
      tvWidget.chart().createStudy(studyName, false, true, [], null, {});
    }
  };

  const setChartType = (typeCode: number) => {
    if (tvWidget) {
      tvWidget.chart().setChartType(typeCode);
      setShowModal(false);
    }
  };

  const createDatafeed = (initialData: any, timeInterval: string) => {
    const subscribers: any = {};
    
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
          supported_resolutions: intervals,
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
          supported_resolutions: intervals,
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
          const url = `http://ws81.imsaas.work/kline/BTC_USDT_1/${resolution}/range?start_time=${startTime}&end_time=${endTime}&limit=1000`;
          

          const response = await fetch(url);
          const data = await response.json();
          
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
        } catch (error) {
          console.error('获取历史数据错误:', error);
          onHistoryCallback([], { noData: true });
        }
      },
    };
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
        style={{ width: "100%", height: "500px", margin: "auto" }}
      ></div>


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

export default Tradingview;