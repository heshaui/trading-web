# 下单确认模态框 (OrderConfirmModal)

## 功能描述

这是一个用于合约交易下单确认的模态框组件，当用户点击下单按钮时会弹出确认框，显示订单详情并让用户确认是否执行下单操作。

## 主要特性

- ✅ 显示订单类型（买入开多/卖出开空）
- ✅ 显示保证金模式和杠杆倍数
- ✅ 显示价格和数量信息
- ✅ 支持"不再提醒"选项
- ✅ 响应式设计，支持移动端
- ✅ 与现有设计风格保持一致

## 使用方法

### 1. 导入组件

```tsx
import OrderConfirmModal from '@/components/myModal/orderConfirmModal';
```

### 2. 在组件中使用

```tsx
const [showOrderConfirmModal, setShowOrderConfirmModal] = useState(false);
const [confirmData, setConfirmData] = useState({
  side: 'BUY',
  symbol: 'BTCUSDT',
  marginMode: 1,
  leverage: 5,
  price: '50000',
  quantity: '100',
  orderType: 'limit'
});

// 处理确认下单
const handleConfirmOrder = (orderData: any, dontRemind: boolean) => {
  // 执行下单逻辑
  console.log('确认下单:', orderData);
  
  // 如果用户选择不再提醒，保存设置
  if (dontRemind) {
    localStorage.setItem('dontShowOrderConfirm', 'true');
  }
  
  setShowOrderConfirmModal(false);
};

// 在JSX中渲染
<OrderConfirmModal
  visible={showOrderConfirmModal}
  onClose={() => setShowOrderConfirmModal(false)}
  onConfirm={handleConfirmOrder}
  orderData={confirmData}
/>
```

## Props 说明

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `visible` | `boolean` | ✅ | 控制模态框显示/隐藏 |
| `onClose` | `() => void` | ✅ | 关闭模态框的回调函数 |
| `onConfirm` | `(data: any, dontRemind: boolean) => void` | ✅ | 确认下单的回调函数 |
| `orderData` | `OrderData` | ✅ | 订单数据对象 |

### OrderData 类型定义

```tsx
interface OrderData {
  side: string;           // 买卖方向: 'BUY' | 'SELL'
  symbol: string;         // 交易对: 'BTCUSDT'
  marginMode: number;     // 保证金模式: 1(全仓) | 2(逐仓)
  leverage: number;       // 杠杆倍数: 5
  price: string | number; // 价格
  quantity: string | number; // 数量
  orderType: string;      // 订单类型: 'limit' | 'market' | 'conditional'
}
```

## 样式定制

组件使用CSS Modules，主要样式类：

- `.modalBox` - 模态框容器
- `.orderTitle` - 订单标题区域
- `.orderDetails` - 订单详情区域
- `.reminderOption` - 不再提醒选项
- `.modalFooter` - 底部按钮区域

## 注意事项

1. 确保传入的 `orderData` 包含所有必需字段
2. `onConfirm` 回调函数会接收两个参数：订单数据和是否不再提醒
3. 组件会自动处理"不再提醒"选项的本地存储
4. 样式遵循项目的设计规范，支持深色/浅色主题

## 示例效果

模态框会显示如下内容：
- 标题：下单确认
- 订单类型：买入开多BTCUSDT
- 保证金信息：逐仓 50x
- 价格：市价（或具体价格）
- 数量：20 USDT
- 不再提醒选项
- 取消/确定按钮 