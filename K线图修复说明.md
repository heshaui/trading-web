# K 线图显示问题修复说明

## 问题描述

K 线图显示空白，虽然 WebSocket 数据格式正确，但图表没有显示数据。

## 问题分析

### 1. 数据流程

```
WebSocket -> index.tsx (setKlineData) -> ContractKlineChart -> TradingView组件
```

### 2. 可能的问题点

#### A. WebSocket 数据接收问题

- 检查 WebSocket 连接是否正常
- 检查 K 线数据订阅 channel 是否正确
- 检查数据是否真正被接收和解析

#### B. 数据传递问题

- `klineData`状态是否正确更新
- 数据是否正确传递到`ContractKlineChart`组件
- `TradingView`组件是否接收到数据

#### C. TradingView 配置问题

- datafeed 是否正确配置
- 时间间隔转换是否正确
- 数据格式转换是否正确

## 调试步骤

### 1. 添加调试日志

在 `modules/contract/pages/trade/index.tsx` 中添加：

```javascript
// 第559行附近，处理K线数据时
if (data.channel && data.channel.includes("_kline_")) {
  console.log("🔴 收到K线数据:", data);
  console.log("🔴 K线数据类型:", typeof data);
  console.log("🔴 K线数据结构:", {
    hasEventRep: !!data.event_rep,
    hasData: !!data.data,
    hasTick: !!data.tick,
    dataLength: data.data ? data.data.length : 0,
  });

  // 检查数据是否有效
  if (data.event_rep === "rep" && data.data && data.data.length > 0) {
    console.log("🟢 K线历史数据有效，第一条:", data.data[0]);
    console.log(
      "🟢 K线历史数据有效，最后一条:",
      data.data[data.data.length - 1]
    );
  } else if (data.tick) {
    console.log("🟢 K线实时数据有效:", data.tick);
  } else {
    console.log("🔴 K线数据格式异常!");
  }

  setKlineData(data);
}
```

### 2. 检查组件接收

在 `modules/contract/pages/trade/components/ContractKlineChart/index.tsx` 中添加：

```javascript
// 第26行附近，组件接收props时
const ContractKlineChart = ({
  currentContractInfo,
  klineData,
  onTimeIntervalChange,
  style,
}: {
  // ...
}) => {
  console.log("🔵 ContractKlineChart收到数据:", {
    hasKlineData: !!klineData,
    klineDataType: typeof klineData,
    currentContractInfo: currentContractInfo,
  });

  // 在传递给TradingView前
  console.log("🔵 传递给TradingView的数据:", klineData);
  // ...
};
```

### 3. 检查 TradingView 接收

在 `modules/contract/pages/trade/components/Tradingview/index.tsx` 中：

```javascript
// 第65行附近
console.log("🟡 TradingView收到klineData:", {
  hasData: !!klineData,
  dataType: typeof klineData,
  isArray: Array.isArray(klineData),
  dataKeys:
    klineData && typeof klineData === "object" ? Object.keys(klineData) : null,
});
```

## 快速修复方案

### 方案 1：确保数据正确传递

修改 `modules/contract/pages/trade/index.tsx` 第 559-561 行：

```javascript
if (data.channel && data.channel.includes("_kline_")) {
  console.log("收到K线数据:", data);

  // 确保数据格式正确
  if (data && (data.data || data.tick)) {
    setKlineData(data);
    console.log("✅ K线数据已更新到state");
  } else {
    console.error("❌ K线数据格式错误:", data);
  }
}
```

### 方案 2：检查 WebSocket 订阅

确保 K 线订阅 channel 格式正确：

```javascript
// 第368-376行
const klineReqEvent = {
  event: "req",
  params: {
    channel: `market_${contractInfo.contractType.toLowerCase()}_${contractInfo.symbol
      .replace("-", "")
      .toLowerCase()}_kline_${wsTimeInterval}`,
    cb_id: contractInfo.symbol.toLowerCase(),
  },
};

console.log("📤 发送K线订阅请求:", klineReqEvent);
```

### 方案 3：强制刷新 TradingView

在数据更新时强制刷新图表：

```javascript
// 在ContractKlineChart组件中
useEffect(() => {
  if (klineData && tradingviewRef.current) {
    console.log("🔄 K线数据变化，重置图表");
    tradingviewRef.current.resetChart();
  }
}, [klineData]);
```

## 常见问题

1. **WebSocket 连接但没有数据**

   - 检查订阅的 channel 名称是否正确
   - 检查合约 symbol 格式（是否需要去掉"-"）
   - 检查时间间隔格式转换是否正确

2. **数据接收但图表不显示**

   - 检查 TradingView 的 datafeed 配置
   - 检查数据格式转换是否正确
   - 检查时间戳是否正确（秒 vs 毫秒）

3. **图表显示"No data"**
   - 确认数据确实传递到了 TradingView 组件
   - 检查 convertKlineToBar 函数是否正确转换数据
   - 检查 subscribeBars 回调是否被正确调用

## 建议的调试顺序

1. 首先在浏览器控制台查看是否有 K 线相关的 console.log
2. 检查 Network 标签中 WebSocket 消息，确认 K 线数据订阅和接收
3. 在 React DevTools 中检查 klineData 状态是否更新
4. 检查 TradingView 组件是否重新渲染
5. 查看是否有 JavaScript 错误阻止了数据处理
