# ImageSelect 组件

一个功能强大的币种选择器组件，支持搜索、历史记录和价格显示。

## 功能特性

- ✅ 支持搜索功能
- ✅ 显示搜索历史
- ✅ 实时价格显示
- ✅ 响应式设计
- ✅ 支持暗色主题
- ✅ TypeScript 支持
- ✅ 优化的用户界面

## 使用方法

```tsx
import ImageSelect from '@/components/ImageSelect';

const options = [
  {
    value: 'BTC',
    label: 'Bitcoin',
    coinName: 'BTC',
    nameDefault: 'Bitcoin',
    iconUrl: '/images/coins/btc.png',
    price: 50000
  },
  // 更多选项...
];

function MyComponent() {
  const [selectedValue, setSelectedValue] = useState('');
  
  const handleChange = (value: string, option: ImageSelectOption) => {
    setSelectedValue(value);
    console.log('选择的币种:', option);
  };

  return (
    <ImageSelect
      options={options}
      value={selectedValue}
      onChange={handleChange}
      placeholder="选择币种"
      showPrice={true}
      showSearch={true}
      showHistory={true}
    />
  );
}
```

## 属性说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| options | ImageSelectOption[] | [] | 选项数据数组 |
| value | string | - | 当前选中的值 |
| placeholder | string | "请选择币种" | 占位符文本 |
| onChange | (value: string, option: ImageSelectOption) => void | - | 选择改变时的回调 |
| onFocus | () => void | - | 获得焦点时的回调 |
| loading | boolean | false | 是否显示加载状态 |
| className | string | "" | 自定义样式类名 |
| searchHistory | ImageSelectOption[] | [] | 搜索历史数据 |
| showSearch | boolean | true | 是否显示搜索框 |
| showHistory | boolean | true | 是否显示搜索历史 |
| maxHistory | number | 4 | 最大历史记录数量 |
| showPrice | boolean | true | 是否显示价格信息 |
| defaultOpen | boolean | false | 是否默认打开 |

## ImageSelectOption 接口

```tsx
interface ImageSelectOption {
  value: string;          // 选项值
  label: string;          // 显示标签
  coinName?: string;      // 币种名称
  nameDefault?: string;   // 默认名称
  iconUrl: string;        // 图标URL
  sort?: number;          // 排序权重
  price?: number;         // 价格
  localPrice?: string;    // 本地价格
}
```

## 样式定制

组件使用 CSS Modules，可以通过以下 CSS 变量进行主题定制：

```css
:root {
  --theme-color: #1890ff;
  --text-color5: #333;
  --text-color6: #666;
  --background7: #ffffff;
  --background9: rgba(0, 0, 0, 0.02);
  --background10: #f8f9fa;
  --border-color2: #e9ecef;
}
```

## 最新优化

### v1.1.0 更新内容
- 🎨 优化了弹框的视觉设计，增加了圆角和更好的间距
- 🔧 修复了TypeScript类型错误
- ✨ 改进了搜索框的交互体验
- 📱 优化了移动端适配
- 🎯 增强了价格显示的可读性
- 🔍 改进了币种列表的布局和hover效果

### 主要改进点
1. **标题显示**: 添加了"选择币种"标题
2. **搜索体验**: 优化了搜索框的样式和交互
3. **价格显示**: 改进了价格信息的布局和样式
4. **类型安全**: 修复了所有TypeScript类型错误
5. **视觉效果**: 优化了整体的视觉层次和间距

## 浏览器支持

- Chrome >= 60
- Firefox >= 60
- Safari >= 12
- Edge >= 79 