import type { ThemeConfig } from "antd";
import { createStyles } from "antd-style";

type TableThemeConfig = NonNullable<ThemeConfig["components"]>["Table"];
export const TableTheme: TableThemeConfig = {
  headerBg: "transparent", // 表头背景色
  headerSplitColor: "transparent", // 表头分割线颜色
  borderColor: "transparent", // 表格边框颜色
  rowExpandedBg: "var(--background10)", // 表格行展开背景色
  headerColor: "var(--text-color6)", // 表头颜色
  fontWeightStrong: 400, // 表头字体粗细
  headerBorderRadius: 0, // 表头圆角
  rowSelectedBg: "transparent", // 表格行选中背景色
  rowHoverBg: "var(--theme-005)", // 悬停背景色
};

type TabsThemeConfig = NonNullable<ThemeConfig["components"]>["Tabs"];
export const TabsTheme: TabsThemeConfig = {
  fontSize: 16, // 标签字体大小
  horizontalMargin: "0px",
  inkBarColor: "var(--text-color5)", // 指示条颜色
  itemSelectedColor: "var(--text-color5)", // 选中文本颜色
  itemColor: "var(--text-color6)", // 文本颜色
  itemHoverColor: "var(--text-color5)", // 悬停文本颜色
  colorBorderSecondary: "transparent", //
};

type SelectThemeConfig = NonNullable<ThemeConfig["components"]>["Select"];
export const SelectTheme: SelectThemeConfig = {
  optionSelectedBg: "var(--background-menu-item)", // 选中背景色
  optionSelectedColor: "var(--text-color5)", // 选中文本颜色
};

type DatePickerThemeConfig = NonNullable<
  ThemeConfig["components"]
>["DatePicker"];
export const DatePickerTheme: DatePickerThemeConfig = {
  activeShadow: "none", // 激活状态阴影
};

type SwitchThemeConfig = NonNullable<ThemeConfig["components"]>["Switch"];
export const SwitchTheme: SwitchThemeConfig = {
  colorTextQuaternary: "var(--switch-color)", // 关闭状态背景色
  colorTextTertiary: "var(--switch-color)", // 悬停背景颜色
};

type PaginationThemeConfig = NonNullable<
  ThemeConfig["components"]
>["Pagination"];
export const PaginationTheme: PaginationThemeConfig = {
  itemActiveBg: "transparent", // 激活状态背景色
  itemBg: "transparent", // 背景色
};

type ModalThemeConfig = NonNullable<ThemeConfig["components"]>["Modal"];
export const ModalTheme: ModalThemeConfig = {
  titleLineHeight: "60px", // 标题行高
  margin: 0, // 外边距
};

type ButtonThemeConfig = NonNullable<ThemeConfig["components"]>["Button"];
export const ButtonTheme: ButtonThemeConfig = {
  borderColorDisabled: "transparent", // 禁用状态边框颜色
  defaultHoverBg: "var(--cancel-btn)", // 默认按钮悬停背景色
};

type SegmentedThemeConfig = NonNullable<ThemeConfig["components"]>["Segmented"];
export const SegmentedTheme: SegmentedThemeConfig = {
  fontSize: 12, // 分段器字体大小
  borderRadius: 50, // 分段器圆角
  borderRadiusSM: 50, // 分段器圆角
  itemSelectedBg: "var(--segmented-item-active-bg2)", // 选中背景色
  trackBg: "var(--background12)", // 轨道背景色
};

type TokenThemeConfig = NonNullable<ThemeConfig["token"]>;
export const TokenTheme: TokenThemeConfig = {
  colorSplit: "var(--border-color4)", // 分割线颜色
  colorBgContainerDisabled: "var(--theme-05)", // 禁用状态背景色
};

export const modalStyle = createStyles(() => ({
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
