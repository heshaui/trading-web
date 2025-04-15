import React, { useState, useEffect, useRef } from "react";
import { widget } from "../../public/charting_library";
import "@/styles/components/Tradingview.module.css";

interface TradingviewProps {
  data: any;
  symbol?: string;
}

const Tradingview: React.FC<TradingviewProps> = ({ data, symbol = "BTC_USDT_1" }) => {
  console.log("data", data);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [tvWidget, setTvWidget] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showIntervalDialog, setShowIntervalDialog] = useState(false);
  const [tradTime, setTradTime] = useState("1D");
  const latestDataRef = useRef(data);
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

  useEffect(() => {
    latestDataRef.current = data;
  }, [data]);

  useEffect(() => {
    console.log("useEffect triggered, symbol:", symbol, "tradTime:", tradTime);
    console.log("Current data from props:", data);
    let datafeed: any = null;
    
    try {
      if (chartContainerRef.current) {
        const chartSymbol = symbol || "BTC_USDT_1";
        console.log("Creating datafeed with data:", latestDataRef.current);
        
        // 检查数据是否有效
        if (!latestDataRef.current || !Array.isArray(latestDataRef.current) || latestDataRef.current.length === 0) {
          console.warn("数据无效或为空，使用空数据初始化图表");
          datafeed = createDatafeed([]);
        } else {
          datafeed = createDatafeed(latestDataRef.current);
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
          disabled_features: [
            "header_widget",
            "use_localstorage_for_settings",
            "timeframes_toolbar",
           
          ],
        };

        const newWidget = new widget(widgetOptions as any);
        setTvWidget(newWidget);
        
        if (!window.__tradingViewHandlersInitialized) {
          window.__tradingViewHandlersInitialized = true;
          
          window.__handleTradingViewUpdate = (newData: any) => {
            if (window.__tradingViewUpdateBar) {
              window.__tradingViewUpdateBar(newData);
            }
          };
        }
      }
    } catch (error) {
      console.error("TradingView 初始化错误:", error);
    }

    return () => {
      if (tvWidget) {
        try {
          tvWidget.remove();
        } catch (e) {
          console.error("移除图表错误:", e);
        }
        setTvWidget(null);
      }
    };
  }, [symbol, tradTime]);

  // 处理数据更新的useEffect
  useEffect(() => {
    console.log("数据已更新:", data);
    if (tvWidget && window.__handleTradingViewUpdate && data && Array.isArray(data)) {
      // 处理每个数据项
      data.forEach(item => {
        try {
          if (item.data && typeof item.data === 'string') {
            // 解析数据字符串 - 格式: [symbol, interval, time, open, high, low, close, volume]
            const parsedData = JSON.parse(item.data);
            if (Array.isArray(parsedData) && parsedData.length >= 8) {
              const formattedData = {
                symbol: parsedData[0],
                interval: parsedData[1],
                time: parsedData[2],
                open: parseFloat(parsedData[3]),
                high: parseFloat(parsedData[4]),
                low: parseFloat(parsedData[5]),
                close: parseFloat(parsedData[6]),
                volume: parseFloat(parsedData[7])
              };
              
              if (window.__handleTradingViewUpdate) {
                window.__handleTradingViewUpdate(formattedData);
              }
            }
          }
        } catch (error) {
          console.error("解析数据错误:", error, item);
        }
      });
    }
  }, [data, tvWidget]);

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

  const createDatafeed = (initialData: any) => {
    console.log("getBars 初始数据:", initialData);
    let lastBar = null;
    const subscribers: any = {};
    
    // 预处理初始数据
    const processedInitialData = (initialData || []).map((item: any) => {
      try {
        if (item.data && typeof item.data === 'string') {
          // 解析数据字符串
          const parsedData = JSON.parse(item.data);
          if (Array.isArray(parsedData) && parsedData.length >= 8) {
            return {
              symbol: parsedData[0],
              interval: parsedData[1],
              time: parsedData[2],
              open: parseFloat(parsedData[3]),
              high: parseFloat(parsedData[4]),
              low: parseFloat(parsedData[5]),
              close: parseFloat(parsedData[6]),
              volume: parseFloat(parsedData[7])
            };
          }
        }
        return null;
      } catch (error) {
        console.error("预处理数据错误:", error, item);
        return null;
      }
    }).filter((item: any) => item !== null);
    
    window.__tradingViewUpdateBar = (data: any) => {
      try {
        // 确保数据格式正确
        if (!data || typeof data !== 'object') {
          console.warn('无效的数据格式:', data);
          return;
        }
        
        Object.keys(subscribers).forEach(listenerGUID => {
          const callback = subscribers[listenerGUID];
          if (callback && typeof callback === 'function') {
            // 格式化并传递数据
            const formattedData = formatBarData(data);
            callback(formattedData);
          }
        });
      } catch (error) {
        console.error('更新数据错误:', error);
      }
    };
    
    // 辅助函数：格式化K线数据
    const formatBarData = (item: any) => {
      let timeValue = item.time;
      
      if (typeof timeValue === 'number') {
        if (timeValue < 10000000000) {
          timeValue = timeValue * 1000;
        }
      } else if (typeof timeValue === 'string') {
        timeValue = new Date(timeValue).getTime();
      }
      
      return {
        time: timeValue,
        open: parseFloat(item.open || 0),
        high: parseFloat(item.high || 0),
        low: parseFloat(item.low || 0),
        close: parseFloat(item.close || 0),
        volume: parseFloat(item.volume || 0)
      };
    };
    
    return {
      onReady: (cb: any) => {
        setTimeout(() => {
          cb({
            supported_resolutions: intervals,
            supports_marks: false,
            supports_timescale_marks: false,
            supports_time: true
          });
        }, 0);
      },
      
      subscribeBars: (
        symbolInfo: any,
        resolution: any,
        onRealtimeCallback: any,
        listenerGUID: any,
        onResetCacheNeededCallback: any
      ) => {
        console.log('订阅实时数据', symbolInfo, resolution);
        subscribers[listenerGUID] = onRealtimeCallback;
      },
      
      unsubscribeBars(listenerGUID: any) {
        console.log('取消订阅', listenerGUID);
        if (subscribers[listenerGUID]) {
          delete subscribers[listenerGUID];
        }
      },
      
      searchSymbols: (
        userInput: any,
        exchange: any,
        symbolType: any,
        onResultReadyCallback: any
      ) => {
        // 简单返回空结果
        onResultReadyCallback([]);
      },
      
      resolveSymbol: (
        symbolName: any,
        onSymbolResolvedCallback: any,
        onResolveErrorCallback: any
      ) => {
        // 解析符号的逻辑
        const symbolParts = symbolName.split('_');
        const baseSymbol = symbolParts[0] || 'BTC';
        
        const data = {
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
        };
        
        setTimeout(function () {
          onSymbolResolvedCallback(data);
        }, 0);
      },
      
      getBars: (
        symbolInfo: any,
        resolution: any,
        periodParams: any,
        onHistoryCallback: any,
        onErrorCallback: any
      ) => {
        console.log('获取历史数据', symbolInfo, resolution, periodParams);
        
        const { from, to, firstDataRequest } = periodParams;
        
        // 使用处理过的初始数据
        if (processedInitialData && processedInitialData.length > 0) {
          // 格式化数据为TradingView所需格式
          const bars = processedInitialData.map((item: any) => {
            // 确保时间戳格式正确
            let timeValue = item.time;
            
            // 检查时间戳长度，确定是秒还是毫秒
            if (typeof timeValue === 'number') {
              // 如果时间戳是10位数（秒），转换为毫秒
              if (timeValue < 10000000000) {
                timeValue = timeValue * 1000;
              }
            } else if (typeof timeValue === 'string') {
              // 如果是字符串，尝试解析
              timeValue = new Date(timeValue).getTime();
            }
            
            return {
              time: timeValue,
              open: parseFloat(item.open),
              high: parseFloat(item.high),
              low: parseFloat(item.low),
              close: parseFloat(item.close),
              volume: parseFloat(item.volume || 0)
            };
          });
          
          // 确保时间戳按顺序排列
          bars.sort((a: any, b: any) => a.time - b.time);
          
          // 缓存最后一个bar用于实时更新
          if (bars.length > 0) {
            lastBar = bars[bars.length - 1];
          }
          
          console.log('处理后的数据：', bars);
          onHistoryCallback(bars, { noData: bars.length === 0 });
        } else {
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