import type { ThemeConfig } from 'antd';
import appStore from "@/store";
import { getThemeColorFromStorage } from '@/hooks/themes';
// 默认主题配置
const defaultTheme: ThemeConfig = {
  token: {
    fontSize: 16,
    colorPrimary: getThemeColorFromStorage(),
    colorBgElevated: 'var(--background3)', //浮层容器背景色
    colorText: 'var(--text-color5)', // 最深的文本色-默认的文本颜色
    colorTextQuaternary: 'var(--text-color6)', // 最浅的文本色-表单的输入提示文本、禁用色文本
    // colorSplit: 'var(--background14)', // 分割线颜色
    colorIconHover: 'var(--text-color6)',
    colorIcon: 'var(--text-color6)',
    colorBgContainer: 'transparent', //组件的容器背景色-默认按钮、输入框、单选框、复选框
  },
  components: {
    Breadcrumb: {
      separatorColor: 'var(--text-color6)', // 分隔符颜色
    },
    Steps: {
      navArrowColor: 'var(--text-color6)', // 可跳转步骤条箭头颜色
    },
    Select: {
      optionSelectedColor: 'rgba(0,0,0,0.88)', //选中选项字体颜色

    },
    Input: {
      activeShadow: 'none', //激活态阴影
      // errorActiveShadow: 'none', //错误态激活态阴影
    }
    // Tabs: {
    //   itemActiveColor: "var(--tip-color)", //激活态颜色  
    //   itemSelectedColor: "var(--text-color5)", //选中态颜色
    //   horizontalMargin: "0 0 0 0",
    //   itemColor: "var(--text-color6)",
    //   inkBarColor: "var(--text-color5)", //指示条颜色
    //   horizontalItemPaddingLG: "24px 8px",
    //   horizontalItemPadding: "24px 8px",
    //   horizontalItemPaddingSM: "24px 8px",
    // },
  }
};

// 获取动态主题颜色
// export const getThemeConfig = async (): Promise<ThemeConfig> => {
//   try {
//     // 如果在服务器端渲染，直接返回默认主题
//     if (typeof window === 'undefined') {
//       return defaultTheme;
//     }

//     // 从接口获取主题颜色
//     const response = await getThemeColor('theme') as { code: string; data: any };

//     if (response && response.code === '0' && response.data) {
//       // 检查返回的数据是否为字符串
//       if (typeof response.data === 'string') {
//         try {
//           // 处理返回的数据字符串，确保是有效的 JSON 格式
//           const dataStr = response.data
//             .replace(/'/g, '"')       // 替换单引号为双引号
//             .replace(/([{,])\s*([a-zA-Z0-9_]+):/g, '$1"$2":'); // 确保属性名有引号
//           const themeData = JSON.parse(dataStr);
//           console.log('themeData:', themeData);

//           if (themeData.color) {
//             // 返回更新后的主题配置
//             return {
//               token: {
//                 ...defaultTheme.token,
//                 colorPrimary: themeData.color,
//               },
//             };
//           }
//         } catch (parseError) {
//           console.error('解析主题数据失败:', parseError);
//         }
//       }
//     }

//     // 如果获取失败或解析失败，返回默认主题
//     return defaultTheme;
//   } catch (error) {
//     console.error('获取主题颜色失败:', error);
//     return defaultTheme;
//   }
// };

// 获取主题配置
export default defaultTheme;