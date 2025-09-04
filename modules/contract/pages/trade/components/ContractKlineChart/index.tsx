import { Button, Dropdown, Space, Tooltip, MenuProps } from "antd";
import { useState, useRef, useEffect, useCallback } from "react";
import { Iconify } from "@/components/icon";
import { FullscreenOutlined } from "@ant-design/icons";
import { Image } from "antd";
import { useTranslation } from "react-i18next";
import TradingView from "../Tradingview";
import DepthChart from "../DepthChart";
import { getDepthMap } from "@/services/contract";

interface TradingviewRefHandle {
  handleAddIndicator: () => void;
  resetChart: () => void;
  toggleFullScreen: () => void;
  addVolumeDistribution: () => void;
  handleChartScreenshot: () => void;
}

const KLINE_TIME_INTERVAL_KEY = 'contract_kline_time_interval';

const ContractKlineChart = ({
  currentContractInfo,
  klineData,
  onTimeIntervalChange,
  style
}: {
  currentContractInfo: any;
  klineData?: any[];
  onTimeIntervalChange?: (interval: string) => void;
  style?: React.CSSProperties;
}) => {
  const { t } = useTranslation(["contract", "spot", "common"]);
  const tradingviewRef = useRef<TradingviewRefHandle>(null);

  const [currentPair, setCurrentPair] = useState<any>(null);
  // 从 localStorage 读取缓存的时间间隔，如果没有则使用默认值 "1D"
  const [timeInterval, setTimeInterval] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(KLINE_TIME_INTERVAL_KEY);
      // 确保缓存的值是有效的，如果不是则使用默认值
      const validIntervals = ["1m", "5m", "15m", "30m", "1h", "1D", "1W", "1M"];
      return (cached && validIntervals.includes(cached)) ? cached : "1D";
    }
    return "1D";
  });
  const [chartDisplayType, setChartDisplayType] = useState<number>(1);
  const [activeChartType, setActiveChartType] = useState<string>("basic");
  const [chartType, setChartType] = useState<any[]>([]);
  // 根据缓存的时间间隔初始化 dayData
  const [dayData, setDayData] = useState<any[]>(() => {
    const defaultData = ["5m", "15m", "1h", "1D"];
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(KLINE_TIME_INTERVAL_KEY);
      if (cached && !defaultData.includes(cached)) {
        return [...defaultData.slice(0, 3), cached];
      }
    }
    return defaultData;
  });
  const [timeIntervalOptions, setTimeIntervalOptions] = useState<any[]>([
    "1m",
    "5m",
    "15m",
    "30m",
    "1h",
    "1D",
    "1W",
    "1M",
  ]);
  const [defaultDayData] = useState<any[]>(["5m", "15m", "1h", "1D"]);


  const [depthData, setDepthData] = useState<any>(null);
  const chartTypeItems: MenuProps["items"] = [
    {
      key: 1,
      label: (
        <span style={{ fontSize: "12px" }}>
          {/* K线图 */}
          {t("spot:spot.exchange.kLine")}
        </span>
      ),
    },
    {
      key: 8,
      label: (
        <span style={{ fontSize: "12px" }}>
          {/* 美国线 */}
          {t("spot:spot.exchange.usdLine")}
        </span>
      ),
    },
    {
      key: 13,
      label: (
        <span style={{ fontSize: "12px" }}>
          {/* 面积图 */}
          {t("spot:spot.exchange.areaLine")}
        </span>
      ),
    },
    {
      key: 3,
      label: (
        <span style={{ fontSize: "12px" }}>
          {/* 线型图 */}
          {t("spot:spot.exchange.lineType")}
        </span>
      ),
    },
  ];

  const handleChartTypeChange = (e: { key: string }) => {
    setChartDisplayType(Number(e.key));
  };

  const handleTimeIntervalChange = (interval: string) => {
    setTimeInterval(interval);
    
    // 保存到 localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(KLINE_TIME_INTERVAL_KEY, interval);
    }

    // 如果选择的时间间隔不在默认的dayData中，则替换最后一个元素
    if (!defaultDayData.includes(interval)) {
      const newDayData = [...defaultDayData.slice(0, 3), interval];
      setDayData(newDayData);
    } else {
      // 如果选择的是默认值，恢复原始的dayData
      setDayData([...defaultDayData]);
    }

    // 通知父组件时间间隔变化
    if (onTimeIntervalChange) {
      onTimeIntervalChange(interval);
    }
  };

  const getDepthMapData = useCallback(async () => {
    if (!currentContractInfo.symbol) return;
    const res = await getDepthMap({
      symbol: currentContractInfo.symbol,
      contractId: currentContractInfo.id,
    });

    setDepthData(res.data);
  }, [currentContractInfo.symbol, currentContractInfo.id]);

  // 初始化图表类型选项
  useEffect(() => {
    setChartType([
      { label: t("spot:spot.label.kline"), value: "basic" },
      // { label: 'TradingView', value: 'tradingview' },
      { label: t("spot:spot.label.depth"), value: "depth" },
    ]);
  }, [t]);

  // 组件挂载时，通知父组件当前的时间间隔（从缓存读取的值）
  // 父组件已经从 localStorage 读取了初始值，这里不需要再次通知
  // 避免触发不必要的订阅
  // useEffect(() => {
  //   if (onTimeIntervalChange && timeInterval) {
  //     onTimeIntervalChange(timeInterval);
  //   }
  // }, []); // 只在组件挂载时执行一次

  useEffect(() => {
    getDepthMapData();
  }, [getDepthMapData]);

  // 监听合约变化，重置图表
  useEffect(() => {
    if (currentContractInfo && currentContractInfo.id) {

      setCurrentPair(currentContractInfo);

      // 如果TradingView组件存在且有resetChart方法，调用它来重置图表
      if (tradingviewRef.current && typeof tradingviewRef.current.resetChart === 'function') {
        try {
          tradingviewRef.current.resetChart();
        } catch (error) {

        }
      }
    }
  }, [currentContractInfo.id, currentContractInfo.contractName]); // 使用contractName判断合约切换

  return (
    <div className="bg-[var(--background9)] h-[100%]" style={style}>
      <div className="flex-1 00%]">
        <div className="flex justify-between items-center p-[8px_16px] border-b-[1px_solid_var(--border-color1)]">
          <div className="flex items-center">
            {dayData.map((item, index) => (
              <Button
                key={index}
                type={timeInterval === item ? "primary" : "text"}
                onClick={() => handleTimeIntervalChange(item)}
                style={{
                  fontSize: "12px",
                  background:
                    timeInterval === item ? "rgba(0,0,0,0.05)" : "transparent",
                  color:
                    timeInterval === item
                      ? "var(--text-color5)"
                      : "var(--text-color6)",
                }}
              >
                {item}
                {index === dayData.length - 1 && (
                  <Dropdown
                    trigger={["hover"]}
                    placement="bottomRight"
                    dropdownRender={() => (
                      <div className="bg-[#fff] rounded-[8px] shadow-[0_2px_8px_rgba(0,0,0,0.15)] p-[10px] grid grid-cols-3 gap-[10px] w-[320px]">
                        {timeIntervalOptions.map((option) => (
                          <div
                            key={option}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTimeIntervalChange(option);
                            }}
                            className="p-[10px] text-center rounded-[5px] cursor-pointer text-[12px]"
                            style={{
                              background:
                                timeInterval === option
                                  ? "var(--theme-color)"
                                  : "#f0f0f0",
                              color: timeInterval === option ? "#fff" : "#000",
                            }}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    )}
                  >
                    <Iconify
                      icon="eva:arrow-down-fill"
                      style={{
                        fontSize: "12px",
                        marginLeft: "4px",
                        cursor: "pointer",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Dropdown>
                )}
              </Button>
            ))}

            <Space size="small" style={{ marginLeft: "16px" }}>
              <Dropdown
                menu={{
                  items: chartTypeItems,
                  onClick: handleChartTypeChange,
                  selectedKeys: [String(chartDisplayType)],
                }}
                trigger={["hover"]}
                placement="bottom"
              >
                <Image
                  src="/images/exchange/icon_stock.png"
                  alt="exchange"
                  width={20}
                  height={20}
                  preview={false}
                  style={{ cursor: "pointer" }}
                />
              </Dropdown>
              <Tooltip title={t("spot:spot.exchange.technicalIndicators")}>
                <Image
                  src="/images/exchange/icon_chart.png"
                  alt="exchange"
                  width={20}
                  height={20}
                  preview={false}
                  onClick={() => tradingviewRef.current?.handleAddIndicator()}
                  style={{ cursor: "pointer" }}
                />
              </Tooltip>
              <Tooltip title={t("spot:spot.exchange.resetChart")}>
                <Image
                  src="/images/exchange/icon_delete.png"
                  alt="exchange"
                  width={20}
                  height={20}
                  preview={false}
                  onClick={() => tradingviewRef.current?.resetChart()}
                  style={{ cursor: "pointer" }}
                />
              </Tooltip>
              {/* <Tooltip title="图表截图">
              <Image src="/images/exchange/icon_camera.png" alt="exchange" width={20} height={20}  onClick={() => tradingviewRef.current?.handleChartScreenshot()}/>
            </Tooltip> 暂时注释 ---2025。04.28 -zyj */}
              <Tooltip title={t("spot:spot.exchange.volumeDistribution")}>
                <Image
                  src="/images/exchange/icon_value.png"
                  alt="exchange"
                  width={20}
                  height={20}
                  preview={false}
                  onClick={() =>
                    tradingviewRef.current?.addVolumeDistribution()
                  }
                  style={{ cursor: "pointer" }}
                />
              </Tooltip>
            </Space>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            {chartType.map((item, index) => (
              <Button
                key={index}
                type={activeChartType === item.value ? "primary" : "text"}
                onClick={() => setActiveChartType(item.value)}
                style={{
                  fontSize: "12px",
                  background:
                    activeChartType === item.value
                      ? "rgba(0,0,0,0.05)"
                      : "transparent",
                  color:
                    activeChartType === item.value
                      ? "var(--text-color5)"
                      : "var(--text-color6)",
                }}
              >
                {item.label}
              </Button>
            ))}

            <Tooltip title={t("spot:spot.exchange.fullscreen")}>
              <Button
                type="text"
                icon={<FullscreenOutlined />}
                onClick={() => tradingviewRef.current?.toggleFullScreen()}
              />
            </Tooltip>
          </div>
        </div>

        {/* K线图容器 */}
        {activeChartType === "basic" && (
          <>
            <TradingView
              ref={tradingviewRef}
              symbol={currentContractInfo?.symbol || currentPair?.symbol}
              showLeftToolbar={false}
              chartType={chartDisplayType}
              timeInterval={timeInterval}
              klineData={klineData}
            />
          </>
        )}
        {activeChartType === "depth" && <DepthChart data={depthData} />}
      </div>
    </div>
  );
};

export default ContractKlineChart;
