import React, { useState, useEffect, useRef } from "react";
import { widget } from "../public/charting_library";
import "@/styles/components/Tradingview.module.css";
const TVChartContainer: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [tvWidget, setTvWidget] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showIntervalDialog, setShowIntervalDialog] = useState(false);
  const [tradTime, setTradTime] = useState("1D");
  const [intervals] = useState([
    "10s",
    "30s",
    "1m",
    "3m",
    "5m",
    "15m",
    "30m",
    "1h",
    "2h",
    "4h",
    "6h",
    "8h",
    "12h",
    "1D",
    "1W",
    "1M",
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
    if (chartContainerRef.current) {
      const widgetOptions = {
        symbol: "AAPL",
        datafeed: {}, // Replace with your datafeed implementation
        interval: "D",
        container: chartContainerRef.current,
        library_path: "/charting_library/",
        locale: "en",
        charts_storage_url: "http://saveload.tradingview.com",
        charts_storage_api_version: "1.1",
        client_id: "tradingview.com",
        user_id: "public_user_id",
        fullscreen: false,
        autosize: true,
      };

      const newWidget = new widget(widgetOptions);
      setTvWidget(newWidget);
    }

    return () => {
      if (tvWidget) {
        tvWidget.remove();
        setTvWidget(null);
      }
    };
  }, []);

  const toggleModal = () => setShowModal(!showModal);

  const setChartInterval = (interval: string) => {
    if (tvWidget) {
      tvWidget.chart().setResolution(interval);
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

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {/* 模态框 */}
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

      {/* 时间间隔弹窗 */}
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

      {/* 图表容器 */}
      <div
        className="TVChartContainer"
        ref={chartContainerRef}
        style={{ width: "100%", height: "560px", margin: "auto" }}
      ></div>

      {/* 指标按钮 */}
      <div className="indicator-buttons">
        <button onClick={() => addIndicator("Moving Average")}>MA</button>
        {target.map((item, index) => (
          <button key={index} onClick={() => addIndicator(item.text)}>
            {item.text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TVChartContainer;