import type { ThemeConfig } from 'antd';
import appStore from "@/store";
import { getThemeColorFromStorage } from '@/hooks/themes';
// 默认主题配置
const defaultTheme: ThemeConfig = {
  token: {
    fontSize: 16,
    colorPrimary: getThemeColorFromStorage(),
  },
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