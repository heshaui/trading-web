import type { ThemeConfig } from "antd";
import { createStyles } from "antd-style";
const financialThemeConfig: ThemeConfig = {
  components: {
    Table: {
      headerBg: "transparent", // 表头背景色
      headerSplitColor: "transparent", // 表头分割线颜色
      borderColor: "transparent", // 表格边框颜色
      rowExpandedBg: "var(--background10)", // 表格行展开背景色
      headerColor: "var(--text-color6)", // 表头颜色
      fontWeightStrong: 400, // 表头字体粗细
      headerBorderRadius: 0, // 表头圆角
      rowSelectedBg: "transparent", // 表格行选中背景色
      rowHoverBg: "var(--theme-005)", // 悬停背景色
    },
    Tabs: {
      fontSize: 16, // 标签字体大小
      horizontalMargin: "0px", 
      inkBarColor: "var(--text-color5)", // 指示条颜色
      itemSelectedColor: "var(--text-color5)", // 选中文本颜色
      itemColor: "var(--text-color6)", // 文本颜色
      itemHoverColor: "var(--text-color5)", // 悬停文本颜色
    },
    Select: {
      optionSelectedBg: "var(--background-menu-item)", // 选中背景色
      optionSelectedColor: "var(--text-color5)", // 选中文本颜色
    },
    DatePicker: {
      activeShadow: "none", // 激活状态阴影
    },
    Switch: {
      colorTextQuaternary: "var(--switch-color)", // 关闭状态背景色
      colorTextTertiary: "var(--switch-color)", // 悬停背景颜色
    },
    Pagination: {
      itemActiveBg: "transparent", // 激活状态背景色
      itemBg: "transparent", // 背景色
    },
    Modal: { titleLineHeight: "60px", margin: 0 },
    Button: {
      borderColorDisabled: "transparent", // 禁用状态边框颜色
      defaultHoverBg: "var(--cancel-btn)", // 默认按钮悬停背景色
    },
    Segmented: {
      fontSize: 12, // 分段器字体大小 
      borderRadius: 50, // 分段器圆角
      borderRadiusSM: 50, // 分段器圆角
      itemSelectedBg: "var(--segmented-item-active-bg2)", // 选中背景色
      trackBg: "var(--background12)", // 轨道背景色
    },
  },
  token: {
    colorSplit: "var(--border-color4)", // 分割线颜色
    colorBgContainerDisabled: "var(--theme-05)", // 禁用状态背景色
  },
};

const useStyle = createStyles(() => ({
  "my-modal-header": {
    height: "60px !important",
    padding: "0 20px !important",
    borderRadius: "10px 10px 0px 0px",
    background: "#fff",
    margin: "0 !important",
    boxShadow: "0px -0.5px 0px 0px var(--border-color4) inset",
  },
  "my-modal-footer": {
    width: "100%",
    marginTop: "0 !important",
    borderRadius: "0 0 10px 10px !important",
  },
  "my-modal-content": {
    padding: "0 !important",
  },
}));

export { financialThemeConfig, useStyle };
