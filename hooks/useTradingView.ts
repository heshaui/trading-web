import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { widget } from "@/public/charting_library/charting_library";
import { KlineDataConverter, KlineBar } from '@/utils/klineDataConverter';
import jstz from 'jstz';

export interface UseTradingViewOptions {
  symbol?: string;
  chartType?: number;
  timeInterval?: string;
  klineData?: any;
  isDayMode?: boolean;
}

export interface TradingViewActions {
  addVolumeDistribution: () => void;
  resetChart: () => void;
  handleAddIndicator: () => void;
  handleChartScreenshot: () => void;
  toggleFullScreen: () => void;
}

export const useTradingView = (
  containerRef: React.RefObject<HTMLDivElement>,
  options: UseTradingViewOptions
) => {
  const {
    symbol = "BTC_USDT_1",
    chartType = 9,
    timeInterval = "15m",
    klineData,
    isDayMode = false
  } = options;

  const [tvWidget, setTvWidget] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const wsDataRef = useRef(klineData);
  const timeTrackerRef = useRef({ lastBarTime: 0 });
  const subscribersRef = useRef<{ [key: string]: any }>({});

  const timezone = useMemo(() => jstz.determine(), []);

  const convertTimeInterval = useCallback((interval: string): string => {
    const intervalMap: Record<string, string> = {
      "1m": "1", "3m": "3", "5m": "5", "15m": "15", "30m": "30",
      "1h": "60", "2h": "120", "4h": "240", "6h": "360", 
      "8h": "480", "12h": "720", "1D": "D", "1W": "W", "1M": "M"
    };
    return intervalMap[interval] || interval;
  }, []);

  const getLanguage = useCallback(() => {
    const lang = localStorage.getItem("lang") || "zh";
    const langMap: Record<string, string> = {
      "zh_CN": "zh",
      "en_US": "en", 
      "ko_KR": "ko",
      "vi_VN": "vi"
    };
    return langMap[lang] || "en";
  }, []);

  const createDatafeed = useCallback((initialData: any, tvTimeInterval: string, symbol: string) => {
    const subscribers: { [key: string]: any } = {};
    subscribersRef.current = subscribers;

    window.__tradingViewUpdateBar = (data: any) => {
      if (!data) return;

      try {
        let processedData: any[] = [];

        if (data.event_rep === "rep" && Array.isArray(data.data)) {
          processedData = data.data;
        } else if (data.tick) {
          processedData = [data.tick];
        } else if (data.type === "kline" && Array.isArray(data.data)) {
          processedData = data.data;
        } else if (Array.isArray(data)) {
          processedData = data;
        } else {
          processedData = [data];
        }

        processedData.forEach(item => {
          const bar = KlineDataConverter.convertToBar(item);
          if (bar) {
            if (timeTrackerRef.current.lastBarTime > 0 && bar.time <= timeTrackerRef.current.lastBarTime) {
              return;
            }
            
            timeTrackerRef.current.lastBarTime = bar.time;
            
            Object.values(subscribers).forEach(callback => {
              if (typeof callback === "function") {
                setTimeout(() => callback(bar), 0);
              }
            });
          }
        });
      } catch (error) {
        console.error("💥 更新数据错误:", error);
      }
    };

    return {
      onReady: (cb: any) => {
        setTimeout(() => cb({
          supported_resolutions: ["1", "3", "5", "15", "30", "60", "120", "240", "360", "480", "720", "D", "W", "M"],
          supports_marks: false,
          supports_timescale_marks: false,
          supports_time: true,
        }), 0);
      },

      subscribeBars: (symbolInfo: any, resolution: any, onRealtimeCallback: any, listenerGUID: any) => {
        subscribers[listenerGUID] = onRealtimeCallback;

        if (initialData) {
          let dataToProcess: any[] = [];
          
          if (initialData.event_rep === "rep" && Array.isArray(initialData.data)) {
            dataToProcess = initialData.data;
          } else if (Array.isArray(initialData)) {
            dataToProcess = initialData;
          } else if (initialData.type === "kline" && Array.isArray(initialData.data)) {
            dataToProcess = initialData.data;
          }

          if (dataToProcess.length > 0) {
            const sortedData = dataToProcess.sort((a, b) => 
              KlineDataConverter.extractTimeFromKline(a) - KlineDataConverter.extractTimeFromKline(b)
            );

            const bars = sortedData
              .map(kline => KlineDataConverter.convertToBar(kline))
              .filter((bar): bar is KlineBar => bar !== null);

            const deduplicatedBars = KlineDataConverter.deduplicateAndSort(bars);

            timeTrackerRef.current.lastBarTime = 0;
            deduplicatedBars.forEach(bar => {
              timeTrackerRef.current.lastBarTime = Math.max(timeTrackerRef.current.lastBarTime, bar.time);
              onRealtimeCallback(bar);
            });
          }
        }
      },

      unsubscribeBars: (listenerGUID: any) => {
        delete subscribers[listenerGUID];
      },

      searchSymbols: (userInput: any, exchange: any, symbolType: any, onResultReadyCallback: any) => {
        onResultReadyCallback([]);
      },

      resolveSymbol: (symbolName: any, onSymbolResolvedCallback: any, onResolveErrorCallback: any) => {
        const symbolParts = symbolName.split("_");
        const baseSymbol = symbolParts[0] || "BTC";

        setTimeout(() => onSymbolResolvedCallback({
          name: symbolName,
          description: `${baseSymbol}/USDT`,
          type: "crypto",
          session: "24x7",
          timezone: timezone.name(),
          exchange: "",
          minmov: 1,
          pricescale: 100000,
          has_intraday: true,
          has_no_volume: true,
          has_weekly_and_monthly: true,
          supported_resolutions: ["1", "3", "5", "15", "30", "60", "120", "240", "360", "480", "720", "D", "W", "M"],
          volume_precision: 8,
          data_status: "streaming",
        }), 0);
      },

      getBars: async (symbolInfo: any, resolution: any, periodParams: any, onHistoryCallback: any, onErrorCallback: any) => {
        try {
          if (initialData) {
            let dataToProcess: any[] = [];
            
            if (initialData.event_rep === "rep" && Array.isArray(initialData.data)) {
              dataToProcess = initialData.data;
            } else if (Array.isArray(initialData)) {
              dataToProcess = initialData;
            }

            if (dataToProcess.length > 0) {
              const bars = dataToProcess
                .map(kline => KlineDataConverter.convertToBar(kline))
                .filter((bar): bar is KlineBar => bar !== null)
                .filter(bar => {
                  const barTime = bar.time / 1000;
                  return barTime >= periodParams.from && barTime <= periodParams.to;
                })
                .sort((a, b) => a.time - b.time);

              onHistoryCallback(bars, { noData: bars.length === 0 });
              return;
            }
          }
          
          onHistoryCallback([], { noData: true });
        } catch (error) {
          console.error("获取历史数据错误:", error);
          onHistoryCallback([], { noData: true });
        }
      },
    };
  }, [timezone]);

  const widgetOptions = useMemo(() => ({
    symbol,
    interval: convertTimeInterval(timeInterval),
    container: containerRef.current,
    library_path: "/charting_library/",
    locale: getLanguage(),
    charts_storage_url: "http://saveload.tradingview.com",
    charts_storage_api_version: "1.1",
    client_id: "tradingview.com",
    user_id: "public_user_id",
    fullscreen: false,
    autosize: true,
    enabled_features: ["study_templates"],
    timezone: timezone.name(),
    debug: false,
    theme: isDayMode ? "light" : "dark",
    disabled_features: [
      "header_widget", "use_localstorage_for_settings", "timeframes_toolbar",
      "symbol_search", "symbol_info", "header_symbol_search", "header_compare",
      "compare_symbol", "display_market_status", "symbol_change",
    ],
    overrides: {
      "paneProperties.background": isDayMode ? "#ffffff" : "#000000",
      "paneProperties.backgroundType": "solid",
      toolbarBg: isDayMode ? "#ffffff" : "#000000",
    },
  }), [symbol, timeInterval, isDayMode, containerRef, convertTimeInterval, getLanguage, timezone]);

  const createChart = useCallback(() => {
    if (!containerRef.current || tvWidget || isInitialized) {
      return;
    }

    try {
      const currentData = klineData || wsDataRef.current;
      const datafeed = createDatafeed(currentData, convertTimeInterval(timeInterval), symbol);

      const newWidget = new widget({
        ...widgetOptions,
        datafeed,
      } as any);

      setTvWidget(newWidget);

      newWidget.onChartReady(() => {
        try {
          if (newWidget?.chart) {
            const chart = newWidget.chart();
            chart.setChartType(chartType);
            chart.createStudy("Volume", false, false, {
              "volume.color.0": "#00FF00",
              "volume.color.1": "#FF0000",
              "volume.transparency": 30,
              "volume.width": 1,
            });
          }
        } catch (error) {
          console.error("图表初始化时出错:", error);
        }
      });

      setIsInitialized(true);

      window.__tradingViewHandlersInitialized = true;
      window.__handleTradingViewUpdate = (newData: any) => {
        if (window.__tradingViewUpdateBar) {
          window.__tradingViewUpdateBar(newData);
        }
      };
    } catch (error) {
      console.error("创建TradingView图表错误:", error);
    }
  }, [containerRef, tvWidget, isInitialized, klineData, createDatafeed, convertTimeInterval, timeInterval, symbol, widgetOptions, chartType]);

  const recreateChart = useCallback(() => {
    if (tvWidget) {
      try {
        tvWidget.remove();
        setTvWidget(null);
        setIsInitialized(false);
        setTimeout(createChart, 100);
      } catch (e) {
        console.error("重建图表时出错:", e);
      }
    } else {
      createChart();
    }
  }, [tvWidget, createChart]);

  useEffect(() => {
    wsDataRef.current = klineData;
  }, [klineData]);

  useEffect(() => {
    if (!tvWidget && containerRef.current && !isInitialized) {
      setTimeout(createChart, 100);
    }

    return () => {
      if (tvWidget) {
        try {
          tvWidget.remove();
          setIsInitialized(false);
        } catch (e) {
          console.error("清理图表时出错:", e);
        }
        setTvWidget(null);
      }
    };
  }, [symbol, timeInterval, chartType, isDayMode]);

  useEffect(() => {
    if (!tvWidget || !klineData) return;
    
    wsDataRef.current = klineData;
    
    if (window.__handleTradingViewUpdate) {
      window.__handleTradingViewUpdate(klineData);
    }
  }, [klineData, tvWidget]);

  const actions: TradingViewActions = useMemo(() => ({
    addVolumeDistribution: () => {
      if (tvWidget?.chart) {
        try {
          tvWidget.chart().createStudy("Volume Profile Visible Range", false, false);
        } catch (error) {
          console.error("添加成交量分布时出错:", error);
        }
      }
    },

    resetChart: () => {
      if (tvWidget?.chart) {
        try {
          const chart = tvWidget.chart();
          chart.removeAllShapes();
          chart.getAllStudies()?.forEach((study: any) => {
            if (study.name !== "Volume") {
              chart.removeEntity(study.id);
            }
          });
        } catch (error) {
          console.error("重置图表时出错:", error);
        }
      }
    },

    handleAddIndicator: () => {
      if (tvWidget?.chart) {
        try {
          tvWidget.chart().executeActionById("insertIndicator");
        } catch (error) {
          console.error("添加指标时出错:", error);
        }
      }
    },

    handleChartScreenshot: () => {
      if (tvWidget?.chart) {
        try {
          tvWidget.chart().executeActionById("screenshot");
        } catch (error) {
          console.error("截图时出错:", error);
        }
      }
    },

    toggleFullScreen: () => {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    },
  }), [tvWidget, containerRef]);

  return {
    tvWidget,
    isInitialized,
    recreateChart,
    actions,
  };
};