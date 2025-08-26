import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { widget } from "@/public/charting_library/charting_library";
import "@/styles/components/Tradingview.module.css";
import { useThemeMode } from "@/hooks/useThemeMode";
import jstz from 'jstz';

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

// 时间间隔转换工具函数
const convertTimeInterval = (interval: string): string => {
  const intervalMap: Record<string, string> = {
    "1m": "1",
    "3m": "3",
    "5m": "5",
    "15m": "15",
    "30m": "30",
    "1h": "60",
    "2h": "120",
    "4h": "240",
    "6h": "360",
    "8h": "480",
    "12h": "720",
    "1D": "D",
    "1W": "W",
    "1M": "M"
  };
  return intervalMap[interval] || interval;
};

const Tradingview: React.ForwardRefRenderFunction<
  TradingviewRefHandle,
  TradingviewProps
> = (
  {
    symbol,
    showLeftToolbar = false,
    chartType = 9,
    klineData = [],
    timeInterval = "15m",
  },
  ref
) => {
    console.log("klineData___", klineData);
    const timezone = jstz.determine();
    const { isDayMode } = useThemeMode();
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [tvWidget, setTvWidget] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [showIntervalDialog, setShowIntervalDialog] = useState(false);
    const [tradTime, setTradTime] = useState("1D");

    const [intervals] = useState([
      "1", "3", "5", "15", "30", "60", "120", "240", "360", "480", "720", "D", "W", "M",
    ]);

    const [lineType] = useState([
      { text: "Line", type: 8 },
      { text: "Bar", type: 1 },
      { text: "Candlestick", type: 9 },
      { text: "Area", type: 3 },
      { text: "Heikin Ashi", type: 13 },
    ]);

    const wsDataRef = useRef(klineData);
    const initCompletedRef = useRef(false);
    const scrollContainer = useRef<HTMLUListElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);
    const prevThemeRef = useRef<boolean | null>(null);

    // 创建图表函数
    const createChart = useCallback(() => {
      if (!chartContainerRef.current || tvWidget || initCompletedRef.current) {
        console.log("创建图表被跳过:", {
          hasContainer: !!chartContainerRef.current,
          hasTvWidget: !!tvWidget,
          initCompleted: initCompletedRef.current
        });
        return;
      }

      console.log("开始创建TradingView图表");

      try {
        const tvTimeInterval = convertTimeInterval(timeInterval);
        const chartSymbol = symbol || "BTC_USDT_1";

        // 使用当前最新的klineData，如果没有数据则传null让TradingView显示"No data"
        const currentData = klineData || wsDataRef.current || null;
        console.log("🎯 创建datafeed，使用数据:", {
          hasCurrentData: !!currentData,
          dataType: typeof currentData,
          dataKeys: currentData && typeof currentData === 'object' ? Object.keys(currentData) : null,
          dataSource: currentData === klineData ? 'klineData' : (currentData === wsDataRef.current ? 'wsDataRef.current' : 'null')
        });

        const datafeed = createDatafeed(
          currentData,
          tvTimeInterval,
          chartSymbol
        );

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

        let lang = localStorage.getItem("lang") || "zh";
        if (lang == "zh_CN") {
          lang = "zh";
        } else if (lang == "en_US") {
          lang = "en";
        } else if (lang == "ko_KR") {
          lang = "ko";
        } else if (lang == "vi_VN") {
          lang = "vi";
        } else {
          lang = "en";
        }
        const widgetOptions = {
          symbol: chartSymbol,
          datafeed: datafeed,
          interval: tvTimeInterval,
          container: chartContainerRef.current,
          library_path: "/charting_library/",
          locale: lang,
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
          disabled_features: disabledFeatures,
          overrides: {
            "paneProperties.background": isDayMode ? "#ffffff" : "#000000",
            "paneProperties.backgroundType": "solid",
            toolbarBg: isDayMode ? "#ffffff" : "#000000",
          },
        };

        console.log("创建TradingView widget实例");
        const newWidget = new widget(widgetOptions as any);
        console.log("TradingView widget创建成功，设置状态");
        setTvWidget(newWidget);

        newWidget.onChartReady(() => {
          console.log("TradingView图表已准备好");
          try {
            if (newWidget && newWidget.chart && typeof newWidget.chart === 'function') {
              const chart = newWidget.chart();
              if (chart && typeof chart.setChartType === 'function' && typeof chart.createStudy === 'function') {
                chart.setChartType(chartType);
                chart.createStudy("Volume", false, false, {
                  "volume.color.0": "#00FF00",
                  "volume.color.1": "#FF0000",
                  "volume.transparency": 30,
                  "volume.width": 1,
                });
              }
            }
          } catch (error) {
            console.error("图表初始化时出错:", error);
          }
        });

        initCompletedRef.current = true;

        // 设置WebSocket更新处理
        window.__tradingViewHandlersInitialized = true;
        window.__handleTradingViewUpdate = (newData: any) => {
          if (window.__tradingViewUpdateBar) {
            window.__tradingViewUpdateBar(newData);
          }
        };

      } catch (error) {

      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [symbol, timeInterval, chartType, klineData, isDayMode]); // 移除不必要的依赖

    // 主要的初始化和依赖监听
    useEffect(() => {
      // 更新数据引用
      if (klineData && Array.isArray(klineData) && klineData.length > 0) {
        console.log("🔄 更新wsDataRef，数据长度:", klineData.length);
        console.log("🔄 第一条数据示例:", klineData[0]);
        wsDataRef.current = klineData;
      }

      // 如果主题变化，重建图表
      if (prevThemeRef.current !== null && prevThemeRef.current !== isDayMode) {
        console.log("主题变化，重建图表");
        if (tvWidget) {
          try {
            if (tvWidget.remove && typeof tvWidget.remove === 'function') {
              tvWidget.remove();
            }
            setTvWidget(null);
            initCompletedRef.current = false;
          } catch (e) {
            console.error("移除图表时出错:", e);
          }
        }
        setTimeout(() => createChart(), 100);
      } else if (!tvWidget && !initCompletedRef.current) {
        // 首次创建图表
        console.log("🎯 首次创建图表，当前数据状态:", {
          hasKlineData: !!klineData,
          klineDataType: typeof klineData,
          klineDataKeys: klineData && typeof klineData === 'object' ? Object.keys(klineData) : null,
          hasSymbol: !!symbol,
          symbol: symbol,
          timeInterval: timeInterval,
          hasContainer: !!chartContainerRef.current
        });
        // 始终创建图表，即使没有数据（TradingView会显示"no data"但至少有图表）
        setTimeout(() => {
          console.log("定时器触发，调用createChart");
          createChart();
        }, 100);
      } else {
        console.log("跳过图表创建:", {
          hasTvWidget: !!tvWidget,
          initCompleted: initCompletedRef.current
        });
      }

      prevThemeRef.current = isDayMode;

      return () => {
        if (tvWidget) {
          try {
            if (tvWidget.remove && typeof tvWidget.remove === 'function') {
              tvWidget.remove();
            }
            initCompletedRef.current = false;
          } catch (e) {
            console.error("清理图表时出错:", e);
          }
          setTvWidget(null);
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps  
    }, [symbol, timeInterval, chartType, isDayMode]); // 移除klineData依赖，避免频繁重建

    // 监听主题变化事件 - 直接处理，避免循环依赖
    useEffect(() => {
      const handleThemeChange = () => {
        if (tvWidget) {
          try {
            if (tvWidget.remove && typeof tvWidget.remove === 'function') {
              tvWidget.remove();
            }
            setTvWidget(null);
            initCompletedRef.current = false;
          } catch (e) {
            console.error("主题变化时移除图表出错:", e);
          }
        }
        setTimeout(() => createChart(), 100);
      };

      window.addEventListener("themeChange", handleThemeChange);
      return () => {
        window.removeEventListener("themeChange", handleThemeChange);
      };
    }, [tvWidget, createChart]);

    // 已在上面的初始化函数中处理了主题变化的逻辑

    // 单独处理WebSocket数据更新
    useEffect(() => {
      if (!klineData) return;

      console.log("📊 收到新的klineData:", klineData);

      // 更新引用
      wsDataRef.current = klineData;

      // 如果tvWidget不存在，说明图表还没创建，数据已经在wsDataRef中，创建时会使用
      if (!tvWidget) {
        console.log("📊 tvWidget不存在，等待图表创建");
        return;
      }

      // 处理WebSocket数据更新
      if (window.__handleTradingViewUpdate) {
        console.log("📊 调用TradingView更新函数");
        // 直接传递WebSocket数据，让datafeed处理
        window.__handleTradingViewUpdate(klineData);
      }

    }, [klineData, tvWidget]);

    const toggleModal = () => setShowModal(!showModal);

    const setChartInterval = (interval: string) => {
      if (tvWidget && tvWidget.chart && typeof tvWidget.chart === 'function') {
        try {
          const chart = tvWidget.chart();
          if (chart && typeof chart.setResolution === 'function') {
            const tvInterval = convertTimeInterval(interval);
            chart.setResolution(tvInterval);
            setTradTime(interval);
            setShowIntervalDialog(false);
          }
        } catch (error) {
          console.error("设置图表时间间隔时出错:", error);
        }
      } else {
        console.warn("设置时间间隔失败: 图表未准备好");
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
      if (tvWidget && tvWidget.chart && typeof tvWidget.chart === 'function') {
        try {
          const chart = tvWidget.chart();
          if (chart && typeof chart.executeActionById === 'function') {
            chart.executeActionById("screenshot");
          }
        } catch (error) {
          console.error("截图时出错:", error);
        }
      } else {
        console.warn("图表截图失败: 图表未准备好");
      }
    };

    const toggleFullScreen = () => {
      // const element = this.$refs.chartContainer;
      const element = chartContainerRef.current;

      // 首先检查element是否存在
      if (!element) {
        return;
      }

      // 检查浏览器支持的全屏API
      if (element.requestFullscreen) {
        element.requestFullscreen();
      }
    };

    //技术指标搜索
    const handleAddIndicator = () => {
      if (tvWidget && tvWidget.chart && typeof tvWidget.chart === 'function') {
        try {
          const chart = tvWidget.chart();
          if (chart && typeof chart.executeActionById === 'function') {
            chart.executeActionById("insertIndicator");
          }
        } catch (error) {
          console.error("添加指标时出错:", error);
        }
      } else {
        console.warn("添加指标失败: 图表未准备好");
      }
    };

    //成交量分布
    const addVolumeDistribution = () => {
      if (tvWidget && tvWidget.chart && typeof tvWidget.chart === 'function') {
        try {
          const chart = tvWidget.chart();
          if (chart && typeof chart.createStudy === 'function') {
            chart.createStudy("Volume Profile Visible Range", false, false, [
              /* ... 参数 ... */
            ]);
          }
        } catch (error) {
          console.error("添加成交量分布时出错:", error);
        }
      } else {
        console.warn("添加成交量分布失败: 图表未准备好");
      }
    };

    //重置图表
    const resetChart = () => {
      if (tvWidget && tvWidget.chart && typeof tvWidget.chart === 'function') {
        try {
          const chart = tvWidget.chart();
          if (chart && typeof chart.removeAllShapes === 'function' && typeof chart.getAllStudies === 'function') {
            chart.removeAllShapes();
            const studies = chart.getAllStudies();
            if (Array.isArray(studies)) {
              studies.forEach((study: any) => {
                // 移除指标
                if (study && study.name && study.name !== "Volume" && study.id) {
                  if (typeof chart.removeEntity === 'function') {
                    chart.removeEntity(study.id);
                  }
                }
              });
            }
          }
        } catch (error) {
          console.error("重置图表时出错:", error);
        }
      } else {
        console.warn("重置图表失败: 图表未准备好或已被销毁");
      }
    };

    // expose imperative handlers
    useImperativeHandle(ref, () => ({
      addVolumeDistribution,
      resetChart,
      handleAddIndicator,
      handleChartScreenshot,
      toggleFullScreen,
    }));

    const setChartType = (typeCode: number) => {
      if (tvWidget && tvWidget.chart && typeof tvWidget.chart === 'function') {
        try {
          const chart = tvWidget.chart();
          if (chart && typeof chart.setChartType === 'function') {
            chart.setChartType(typeCode);
            setShowModal(false);
          }
        } catch (error) {
          console.error("设置图表类型时出错:", error);
        }
      } else {
        console.warn("设置图表类型失败: 图表未准备好");
      }
    };

    const createDatafeed = (
      initialData: any,
      tvTimeInterval: string,
      symbol: string
    ) => {
      const subscribers: any = {};
      let getBarsRetryCount = 0; // 添加重试计数器
      const maxRetries = 3; // 最大重试次数

      // 清理全局状态，确保每次创建datafeed时都有干净的状态
      if (window.__tradingViewUpdateBar) {
        delete window.__tradingViewUpdateBar;
      }
      if (window.__handleTradingViewUpdate) {
        delete window.__handleTradingViewUpdate;
      }
      window.__tradingViewHandlersInitialized = false;

      // 安全的时间格式化函数，添加更严格的验证
      const formatTimeValue = (timeValue: any): number => {
        try {
          if (timeValue === undefined || timeValue === null) {
            console.warn("⚠️ 时间值为空，使用当前时间");
            return Date.now();
          }

          if (typeof timeValue === "number") {
            // 检查是否是有效数字
            if (!isFinite(timeValue) || isNaN(timeValue)) {
              console.warn("⚠️ 无效的数字时间戳:", timeValue);
              return Date.now();
            }

            // 处理秒级时间戳（小于10位数）和毫秒级时间戳
            const timestamp = timeValue < 10000000000 ? timeValue * 1000 : timeValue;

            // 验证时间戳是否在合理范围内
            const now = Date.now();
            const oneYearMs = 365 * 24 * 60 * 60 * 1000;
            const minValidTime = new Date('1970-01-01').getTime(); // 最小有效时间
            const maxValidTime = now + oneYearMs; // 最大有效时间

            if (timestamp < minValidTime || timestamp > maxValidTime) {
              console.warn("⚠️ 时间戳超出有效范围:", {
                原始值: timeValue,
                转换后: timestamp,
                最小有效时间: minValidTime,
                最大有效时间: maxValidTime
              });
              return now;
            }

            // 验证转换后的时间戳是否能创建有效的Date对象
            const testDate = new Date(timestamp);
            if (isNaN(testDate.getTime())) {
              console.warn("⚠️ 时间戳无法创建有效Date对象:", timestamp);
              return now;
            }

            return timestamp;
          }

          if (typeof timeValue === "string") {
            const parsedTime = new Date(timeValue).getTime();
            if (isNaN(parsedTime)) {
              console.warn("⚠️ 无法解析时间字符串:", timeValue);
              return Date.now();
            }

            return parsedTime;
          }

          console.warn("⚠️ 未知的时间值类型:", typeof timeValue, timeValue);
          return Date.now();
        } catch (error) {
          console.error("💥 时间格式化错误:", error, "原始值:", timeValue);
          return Date.now();
        }
      };

      // 安全的日期转换函数，避免toISOString错误
      const safeTimeToISO = (timestamp: number): string => {
        try {
          if (!isFinite(timestamp) || isNaN(timestamp)) {
            return "Invalid timestamp";
          }
          const date = new Date(timestamp);
          if (isNaN(date.getTime())) {
            return "Invalid date";
          }
          return date.toISOString();
        } catch (error) {
          return `Error: ${timestamp}`;
        }
      };

      // 预处理初始数据
      const bars: any[] = [];

      // 处理初始K线数据 - 预处理已转换的数据格式
      if (Array.isArray(initialData) && initialData.length > 0) {
        console.log("📊 预处理初始数据:", initialData.length, "条");
        console.log("📊 初始数据示例:", initialData[0]);

        // 检查是否是已转换的格式 {time, open, high, low, close, volume}
        const firstItem = initialData[0];
        if (firstItem && typeof firstItem === 'object' && 'time' in firstItem) {
          console.log("📊 检测到已转换格式的初始数据，直接使用");
        } else {
          console.log("📊 检测到原始格式的初始数据");
        }
      }

      // 统一的K线数据转换函数 - 支持新的对象格式，增强错误处理
      const convertKlineToBar = (kline: any): any => {
        try {
          if (!kline) {
            console.warn("⚠️ K线数据为空");
            return null;
          }

          // 处理对象格式的K线数据
          if (typeof kline === 'object' && !Array.isArray(kline)) {
            let time: number;
            let open: number;
            let high: number;
            let low: number;
            let close: number;
            let volume: number;

            // 检查是否是已转换的格式 {time, open, high, low, close, volume}
            if (kline.time !== undefined && kline.time !== null) {
              console.log("📊 检测到已转换的数据格式");
              time = Number(kline.time);
              open = Number(kline.open || 0);
              high = Number(kline.high || 0);
              low = Number(kline.low || 0);
              close = Number(kline.close || 0);
              volume = Number(kline.volume || 0);
            }
            // 检查是否是从API来的格式 {ds, open, high, low, close, vol}
            else if (kline.ds !== undefined && kline.ds !== null) {
              console.log("📊 检测到API数据格式:", {
                ds: kline.ds,
                dsType: typeof kline.ds,
                convertedTime: new Date(kline.ds).getTime()
              });
              time = new Date(kline.ds).getTime(); // ds 是日期字符串，转换为毫秒时间戳
              open = Number(kline.open || 0);
              high = Number(kline.high || 0);
              low = Number(kline.low || 0);
              close = Number(kline.close || 0);
              volume = Number(kline.vol || 0);
              console.log("📊 API数据转换后的数值:", { time, open, high, low, close, volume });
            }
            // 检查是否是原始WebSocket格式 {id, open, high, low, close, vol}
            else if (kline.id !== undefined && kline.id !== null) {
              console.log("📊 检测到原始WebSocket数据格式:", {
                id: kline.id,
                rawTime: kline.id * 1000,
                formattedTime: new Date(kline.id * 1000).toISOString()
              });
              time = formatTimeValue(kline.id * 1000); // id 是秒级时间戳，转换为毫秒
              open = Number(kline.open || 0);
              high = Number(kline.high || 0);
              low = Number(kline.low || 0);
              close = Number(kline.close || 0);
              volume = Number(kline.vol || 0);
              console.log("📊 转换后的数值:", { time, open, high, low, close, volume });
            }
            else {
              console.warn("⚠️ 对象格式K线数据缺少时间字段 (time 或 id):", kline);
              return null;
            }

            // 验证数值是否有效
            if (!isFinite(time) || !isFinite(open) || !isFinite(high) || !isFinite(low) || !isFinite(close) || !isFinite(volume)) {
              console.warn("⚠️ 对象格式K线数据包含无效数值:", { time, open, high, low, close, volume });
              return null;
            }

            // 验证价格数据的合理性
            if (high < low || high < open || high < close || low > open || low > close) {
              console.warn("⚠️ 对象格式价格数据异常:", { time: safeTimeToISO(time), open, high, low, close, volume });
            }

            return {
              time,
              open,
              high,
              low,
              close,
              volume,
            };
          }

          // 处理旧的数组格式（向后兼容）
          if (Array.isArray(kline) && kline.length >= 7) {
            const time = formatTimeValue(kline[0]);
            const open = Number(kline[2] || 0);
            const high = Number(kline[1] || 0);
            const low = Number(kline[3] || 0);
            const close = Number(kline[4] || 0);
            const volume = Number(kline[6] || 0);

            // 验证数值是否有效
            if (!isFinite(open) || !isFinite(high) || !isFinite(low) || !isFinite(close) || !isFinite(volume)) {
              console.warn("⚠️ 数组格式K线数据包含无效数值:", { open, high, low, close, volume });
              return null;
            }

            // 验证价格数据的合理性
            if (high < low || high < open || high < close || low > open || low > close) {
              console.warn("⚠️ 数组格式价格数据异常:", { time: safeTimeToISO(time), open, high, low, close, volume });
            }

            return {
              time,
              open,
              high,
              low,
              close,
              volume,
            };
          }

          console.warn("⚠️ 无法识别的K线数据格式:", kline);
          return null;
        } catch (error) {
          console.error("💥 K线数据转换错误:", error, "原始数据:", kline);
          return null;
        }
      };

      // 跟踪最后一个K线的时间，防止时间倒序
      const timeTracker = { lastBarTime: 0 };

      // 更新实时数据处理函数 - 支持新的WebSocket数据格式
      window.__tradingViewUpdateBar = (data: any) => {
        if (!data) return;

        try {
          console.log("📊 接收到WebSocket数据:", data);

          // 处理新的WebSocket数据格式
          // 格式1: 历史数据 - { event_rep: "rep", data: [...], tick: null }
          // 格式2: 实时数据 - { event_rep: "", data: null, tick: {...} }

          if (data.event_rep === "rep" && Array.isArray(data.data) && data.data.length > 0) {
            // 处理历史数据格式
            console.log("📊 处理历史数据格式:", data.data.length, "条");

            data.data.forEach((klineItem: any, index: number) => {
              const bar = convertKlineToBar(klineItem);
              if (bar) {
                console.log(`📈 处理历史数据 ${index + 1}:`, bar);

                // 检查时间顺序，防止时间倒序
                if (timeTracker.lastBarTime > 0 && bar.time < timeTracker.lastBarTime) {
                  console.warn("⚠️ 时间倒序，跳过数据点:", safeTimeToISO(bar.time));
                  return;
                }

                // 检查是否是重复的时间戳
                if (timeTracker.lastBarTime > 0 && bar.time === timeTracker.lastBarTime) {
                  console.warn("⚠️ 重复时间戳，跳过数据点:", safeTimeToISO(bar.time));
                  return;
                }

                timeTracker.lastBarTime = bar.time;

                // 将每个数据点传给所有订阅者
                Object.keys(subscribers).forEach((key) => {
                  const callback = subscribers[key];
                  if (typeof callback === "function") {
                    setTimeout(() => callback(bar), 0);
                  }
                });
              } else {
                console.error("❌ 转换历史K线数据失败:", klineItem);
              }
            });
          } else if (data.tick && typeof data.tick === 'object') {
            // 处理实时数据格式
            console.log("📊 处理实时数据格式:", data.tick);
            console.log("📊 当前订阅者数量:", Object.keys(subscribers).length);
            console.log("📊 当前时间追踪器:", safeTimeToISO(timeTracker.lastBarTime));

            const bar = convertKlineToBar(data.tick);
            if (bar) {
              console.log("📈 转换后的实时数据:", bar);
              console.log("📈 数据时间:", safeTimeToISO(bar.time));

              // 检查时间顺序
              if (timeTracker.lastBarTime > 0 && bar.time < timeTracker.lastBarTime) {
                console.warn("⚠️ 实时数据时间倒序，跳过:", {
                  新数据时间: safeTimeToISO(bar.time),
                  最后时间: safeTimeToISO(timeTracker.lastBarTime)
                });
                return;
              }

              // 对于实时数据，允许相同时间戳的更新（同一K线的更新）
              timeTracker.lastBarTime = bar.time;
              console.log("✅ 更新时间追踪器:", safeTimeToISO(timeTracker.lastBarTime));

              Object.keys(subscribers).forEach((key) => {
                const callback = subscribers[key];
                console.log(`📡 调用订阅者 ${key}:`, typeof callback);
                if (typeof callback === "function") {
                  setTimeout(() => {
                    console.log(`🎯 执行回调 ${key} 数据:`, bar);
                    callback(bar);
                  }, 0);
                }
              });
            } else {
              console.error("❌ 转换实时K线数据失败:", data.tick);
            }
          } else if (
            // 兼容旧格式: data.type === "kline"
            data.type === "kline" &&
            Array.isArray(data.data) &&
            data.data.length > 0
          ) {
            console.log("📊 处理旧格式type=kline数据:", data.data.length, "条");

            data.data.forEach((klineItem: any, index: number) => {
              const bar = convertKlineToBar(klineItem);
              if (bar) {
                console.log(`📈 处理旧格式数据 ${index + 1}:`, bar);

                if (timeTracker.lastBarTime > 0 && bar.time < timeTracker.lastBarTime) {
                  return;
                }

                if (timeTracker.lastBarTime > 0 && bar.time === timeTracker.lastBarTime) {
                  return;
                }

                timeTracker.lastBarTime = bar.time;

                Object.keys(subscribers).forEach((key) => {
                  const callback = subscribers[key];
                  if (typeof callback === "function") {
                    setTimeout(() => callback(bar), 0);
                  }
                });
              }
            });
          } else if (Array.isArray(data)) {
            // 处理直接数组格式（向后兼容）
            console.log("📊 处理直接数组格式:", data.length, "条");

            data.forEach((item: any) => {
              const bar = convertKlineToBar(item);
              if (bar) {
                if (timeTracker.lastBarTime > 0 && bar.time <= timeTracker.lastBarTime) {
                  return;
                }

                timeTracker.lastBarTime = bar.time;

                Object.keys(subscribers).forEach((key) => {
                  const callback = subscribers[key];
                  if (typeof callback === "function") {
                    setTimeout(() => callback(bar), 0);
                  }
                });
              }
            });
          } else {
            // 处理单个数据对象格式（向后兼容）
            console.log("📊 处理单个对象格式:", data);

            const bar = convertKlineToBar(data);
            if (bar) {
              if (timeTracker.lastBarTime > 0 && bar.time < timeTracker.lastBarTime) {
                return;
              }

              timeTracker.lastBarTime = bar.time;

              Object.keys(subscribers).forEach((key) => {
                const callback = subscribers[key];
                if (typeof callback === "function") {
                  setTimeout(() => callback(bar), 0);
                }
              });
            }
          }
        } catch (error) {
          console.error("💥 更新数据错误:", error);
          console.error("错误数据:", data);
        }
      };

      return {
        onReady: (cb: any) => {
          setTimeout(
            () =>
              cb({
                supported_resolutions: [
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
                  "M",
                ],
                supports_marks: false,
                supports_timescale_marks: false,
                supports_time: true,
              }),
            0
          );
        },

        subscribeBars: (
          symbolInfo: any,
          resolution: any,
          onRealtimeCallback: any,
          listenerGUID: any
        ) => {

          subscribers[listenerGUID] = onRealtimeCallback;

          // 处理初始K线数据 - 支持WebSocket数据格式
          if (initialData && initialData.event_rep === "rep" && Array.isArray(initialData.data) && initialData.data.length > 0) {
            console.log("📊 处理WebSocket历史数据格式:", initialData.data.length, "条");

            const wsKlineData = initialData.data;

            // 处理WebSocket数据格式的初始数据
            const sortedData = [...wsKlineData].sort((a, b) => {
              let timeA: number;
              let timeB: number;

              // 判断数据格式并提取时间
              if (a.time !== undefined) {
                // 已转换格式 {time, open, high, low, close, volume}
                timeA = Number(a.time);
              } else if (a.ds !== undefined) {
                // API格式 {ds, open, high, low, close, vol}
                timeA = new Date(a.ds).getTime();
              } else if (a.id !== undefined) {
                // 原始WebSocket格式 {id, open, high, low, close, vol}
                timeA = a.id * 1000;
              } else if (Array.isArray(a)) {
                // 旧的数组格式 [timestamp, ...]
                timeA = formatTimeValue(a[0]);
              } else {
                timeA = 0;
              }

              if (b.time !== undefined) {
                timeB = Number(b.time);
              } else if (b.ds !== undefined) {
                timeB = new Date(b.ds).getTime();
              } else if (b.id !== undefined) {
                timeB = b.id * 1000;
              } else if (Array.isArray(b)) {
                timeB = formatTimeValue(b[0]);
              } else {
                timeB = 0;
              }

              return timeA - timeB;
            });

            console.log("📊 排序后的初始数据:", sortedData.length, "条");

            // 重置时间追踪器
            timeTracker.lastBarTime = 0;

            // 去重处理：移除相同时间戳的重复数据
            const deduplicatedData: any[] = [];
            const timeSet = new Set<number>();

            sortedData.forEach((kline: any) => {
              let time: number;

              // 根据数据格式提取时间
              if (kline.time !== undefined) {
                // 已转换格式
                time = Number(kline.time);
              } else if (kline.ds !== undefined) {
                // API格式
                time = new Date(kline.ds).getTime();
              } else if (kline.id !== undefined) {
                // 原始WebSocket格式
                time = kline.id * 1000;
              } else if (Array.isArray(kline)) {
                // 旧的数组格式
                time = formatTimeValue(kline[0]);
              } else {
                console.warn("⚠️ 无法提取时间戳的数据格式:", kline);
                return;
              }

              if (!timeSet.has(time)) {
                timeSet.add(time);
                deduplicatedData.push(kline);
              } else {
                console.warn("⚠️ 发现重复时间戳，跳过:", {
                  原始数据: kline,
                  格式化时间: safeTimeToISO(time)
                });
              }
            });

            console.log("📊 去重后的初始数据:", deduplicatedData.length, "条");

            deduplicatedData.forEach((kline: any, index: number) => {
              const bar = convertKlineToBar(kline);
              if (bar) {
                console.log(`📈 处理初始数据 ${index + 1}:`, bar);

                // 更新时间追踪器，确保历史数据的最后时间被记录
                timeTracker.lastBarTime = Math.max(timeTracker.lastBarTime, bar.time);

                // 将处理后的数据传递给TradingView
                onRealtimeCallback(bar);
              }
            });

            console.log("✅ WebSocket初始数据处理完成，时间追踪器:", safeTimeToISO(timeTracker.lastBarTime));
          } else if (initialData && Array.isArray(initialData) && initialData.length > 0) {
            // 处理传统数组格式的初始数据
            console.log("📊 处理传统数组格式的初始数据:", initialData.length, "条");

            const sortedData = [...initialData].sort((a, b) => {
              let timeA: number;
              let timeB: number;

              // 判断数据格式并提取时间
              if (a.time !== undefined) {
                timeA = Number(a.time);
              } else if (a.ds !== undefined) {
                timeA = new Date(a.ds).getTime();
              } else if (a.id !== undefined) {
                timeA = a.id * 1000;
              } else if (Array.isArray(a)) {
                timeA = formatTimeValue(a[0]);
              } else {
                timeA = 0;
              }

              if (b.time !== undefined) {
                timeB = Number(b.time);
              } else if (b.ds !== undefined) {
                timeB = new Date(b.ds).getTime();
              } else if (b.id !== undefined) {
                timeB = b.id * 1000;
              } else if (Array.isArray(b)) {
                timeB = formatTimeValue(b[0]);
              } else {
                timeB = 0;
              }

              return timeA - timeB;
            });

            console.log("📊 排序后的传统数组数据:", sortedData.length, "条");

            // 重置时间追踪器
            timeTracker.lastBarTime = 0;

            // 去重处理
            const deduplicatedData: any[] = [];
            const timeSet = new Set<number>();

            sortedData.forEach((kline: any) => {
              let time: number;

              if (kline.time !== undefined) {
                time = Number(kline.time);
              } else if (kline.ds !== undefined) {
                time = new Date(kline.ds).getTime();
              } else if (kline.id !== undefined) {
                time = kline.id * 1000;
              } else if (Array.isArray(kline)) {
                time = formatTimeValue(kline[0]);
              } else {
                console.warn("⚠️ 无法提取时间戳的数据格式:", kline);
                return;
              }

              if (!timeSet.has(time)) {
                timeSet.add(time);
                deduplicatedData.push(kline);
              } else {
                console.warn("⚠️ 发现重复时间戳，跳过:", {
                  原始数据: kline,
                  格式化时间: safeTimeToISO(time)
                });
              }
            });

            console.log("📊 去重后的传统数组数据:", deduplicatedData.length, "条");

            deduplicatedData.forEach((kline: any, index: number) => {
              const bar = convertKlineToBar(kline);
              if (bar) {
                console.log(`📈 处理传统数组数据 ${index + 1}:`, bar);

                timeTracker.lastBarTime = Math.max(timeTracker.lastBarTime, bar.time);
                onRealtimeCallback(bar);
              }
            });

            console.log("✅ 传统数组初始数据处理完成，时间追踪器:", safeTimeToISO(timeTracker.lastBarTime));
          } else if (
            // 兼容旧格式: initialData.type === "kline"
            initialData &&
            initialData.type === "kline" &&
            initialData.data &&
            initialData.data.length > 0
          ) {
            console.log("📊 处理旧格式type=kline初始数据:", initialData.data.length, "条");

            const sortedData = [...initialData.data].sort((a, b) => {
              let timeA: number;
              let timeB: number;

              // 判断数据格式并提取时间
              if (a.time !== undefined) {
                timeA = Number(a.time);
              } else if (a.ds !== undefined) {
                timeA = new Date(a.ds).getTime();
              } else if (a.id !== undefined) {
                timeA = a.id * 1000;
              } else if (Array.isArray(a)) {
                timeA = formatTimeValue(a[0]);
              } else {
                timeA = 0;
              }

              if (b.time !== undefined) {
                timeB = Number(b.time);
              } else if (b.ds !== undefined) {
                timeB = new Date(b.ds).getTime();
              } else if (b.id !== undefined) {
                timeB = b.id * 1000;
              } else if (Array.isArray(b)) {
                timeB = formatTimeValue(b[0]);
              } else {
                timeB = 0;
              }

              return timeA - timeB;
            });

            timeTracker.lastBarTime = 0;

            const deduplicatedData: any[] = [];
            const timeSet = new Set<number>();

            sortedData.forEach((kline: any) => {
              let time: number;

              // 根据数据格式提取时间
              if (kline.time !== undefined) {
                time = Number(kline.time);
              } else if (kline.ds !== undefined) {
                time = new Date(kline.ds).getTime();
              } else if (kline.id !== undefined) {
                time = kline.id * 1000;
              } else if (Array.isArray(kline)) {
                time = formatTimeValue(kline[0]);
              } else {
                console.warn("⚠️ 无法提取时间戳的数据格式:", kline);
                return;
              }

              if (!timeSet.has(time)) {
                timeSet.add(time);
                deduplicatedData.push(kline);
              }
            });

            deduplicatedData.forEach((kline: any) => {
              const bar = convertKlineToBar(kline);
              if (bar) {
                timeTracker.lastBarTime = Math.max(timeTracker.lastBarTime, bar.time);
                onRealtimeCallback(bar);
              }
            });
          } else {
            console.log("⚠️ subscribeBars: 没有初始历史数据，等待实时数据");
            // 没有初始数据时，不需要处理，等待实时数据通过WebSocket更新
          }
        },

        unsubscribeBars: (listenerGUID: any) => {
          delete subscribers[listenerGUID];
        },

        searchSymbols: (
          userInput: any,
          exchange: any,
          symbolType: any,
          onResultReadyCallback: any
        ) => {
          onResultReadyCallback([]);
        },

        resolveSymbol: (
          symbolName: any,
          onSymbolResolvedCallback: any,
          onResolveErrorCallback: any
        ) => {
          const symbolParts = symbolName.split("_");
          const baseSymbol = symbolParts[0] || "BTC";

          setTimeout(
            () =>
              onSymbolResolvedCallback({
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
                supported_resolutions: [
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
                  "M",
                ],
                volume_precision: 8,
                data_status: "streaming",
              }),
            0
          );
        },

        getBars: async (
          symbolInfo: any,
          resolution: any,
          periodParams: any,
          onHistoryCallback: any,
          onErrorCallback: any
        ) => {
          console.log("📊 getBars被调用:", {
            symbol: symbolInfo.name,
            resolution,
            from: new Date(periodParams.from * 1000).toISOString(),
            to: new Date(periodParams.to * 1000).toISOString(),
            hasInitialData: !!initialData && Array.isArray(initialData) && initialData.length > 0,
            initialDataLength: Array.isArray(initialData) ? initialData.length : 0,
            initialDataSample: Array.isArray(initialData) && initialData.length > 0 ? initialData[0] : null
          });

          // 处理WebSocket历史数据格式
          if (initialData && initialData.event_rep === "rep" && Array.isArray(initialData.data) && initialData.data.length > 0) {
            getBarsRetryCount = 0; // 有数据时重置重试计数器
            console.log("📊 使用WebSocket历史数据提供K线:", initialData.data.length, "条");
            console.log("📊 WebSocket数据示例:", initialData.data.slice(0, 2));

            const bars: any[] = [];
            initialData.data.forEach((kline: any, index: number) => {
              const bar = convertKlineToBar(kline);
              if (bar) {
                // 检查时间范围
                const barTime = bar.time / 1000; // 转换为秒
                if (barTime >= periodParams.from && barTime <= periodParams.to) {
                  bars.push(bar);
                }

                // 调试前几条数据
                if (index < 3) {
                  console.log(`📊 转换WebSocket数据 ${index + 1}:`, {
                    原始: kline,
                    转换后: bar,
                    时间范围检查: {
                      barTime,
                      from: periodParams.from,
                      to: periodParams.to,
                      inRange: barTime >= periodParams.from && barTime <= periodParams.to
                    }
                  });
                }
              } else {
                console.warn(`⚠️ 转换WebSocket第${index + 1}条数据失败:`, kline);
              }
            });

            // 按时间排序
            bars.sort((a, b) => a.time - b.time);

            console.log("📊 返回WebSocket历史数据:", bars.length, "条");
            console.log("📊 返回数据示例:", bars.slice(0, 2));

            // 如果有数据则正常返回，如果没有数据则标记为noData避免重复请求
            onHistoryCallback(bars, { noData: bars.length === 0 });
          }
          // 处理传统数组格式
          else if (initialData && Array.isArray(initialData) && initialData.length > 0) {
            getBarsRetryCount = 0; // 有数据时重置重试计数器
            console.log("📊 使用传统数组数据提供历史K线:", initialData.length, "条");
            console.log("📊 传统数组数据示例:", initialData.slice(0, 2));

            const bars: any[] = [];
            initialData.forEach((kline: any, index: number) => {
              const bar = convertKlineToBar(kline);
              if (bar) {
                // 检查时间范围
                const barTime = bar.time / 1000; // 转换为秒
                if (barTime >= periodParams.from && barTime <= periodParams.to) {
                  bars.push(bar);
                }

                // 调试前几条数据
                if (index < 3) {
                  console.log(`📊 转换数据 ${index + 1}:`, {
                    原始: kline,
                    转换后: bar,
                    时间范围检查: {
                      barTime,
                      from: periodParams.from,
                      to: periodParams.to,
                      inRange: barTime >= periodParams.from && barTime <= periodParams.to
                    }
                  });
                }
              } else {
                console.warn(`⚠️ 转换第${index + 1}条数据失败:`, kline);
              }
            });

            // 按时间排序
            bars.sort((a, b) => a.time - b.time);

            console.log("📊 返回传统数组历史数据:", bars.length, "条");
            console.log("📊 返回数据示例:", bars.slice(0, 2));

            // 如果有数据则正常返回，如果没有数据则标记为noData避免重复请求
            onHistoryCallback(bars, { noData: bars.length === 0 });
          } else {
            getBarsRetryCount++;
            console.log(`📊 没有初始数据，重试次数: ${getBarsRetryCount}/${maxRetries}`);

            // 如果还在重试范围内，返回空数据但允许重试
            if (getBarsRetryCount < maxRetries) {
              console.log("📊 允许继续重试获取数据");
              onHistoryCallback([], { noData: false });
            } else {
              console.log("📊 达到最大重试次数，停止请求");
              // 达到最大重试次数后，标记为noData停止请求
              onHistoryCallback([], { noData: true });
            }
          }
        },
      };
    };

    const scroll = (direction: "left" | "right") => {
      if (scrollContainer.current) {
        const scrollAmount = 200; // 可以根据需要调整滚动距离
        const newScrollLeft =
          direction === "left"
            ? scrollContainer.current.scrollLeft - scrollAmount
            : scrollContainer.current.scrollLeft + scrollAmount;

        scrollContainer.current.scrollTo({
          left: newScrollLeft,
          behavior: "smooth",
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
            <div className="interval-dialog" onClick={(e) => e.stopPropagation()}>
              {intervals.map((interval) => (
                <div
                  key={interval}
                  className={`interval-option ${interval === tradTime ? "active" : ""
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
          style={{ width: "100%", height: "548px", margin: "auto" }}
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

export default forwardRef(Tradingview);
