import appStore from "@/store";
import {LOCAL_STORAGE_KEY} from "@/config/apiConfig";
// 从本地存储获取主题色
export const getThemeColorFromStorage = (): string => {
  if (typeof window !== 'undefined') {
    try {
      const themeData = appStore.getKvConfigAll() || localStorage.getItem(LOCAL_STORAGE_KEY.KV_CONFIG)
      if (themeData) {
        const parsedTheme = themeData
        if (parsedTheme && parsedTheme.theme && parsedTheme.theme.color) {
          return parsedTheme.theme.color as string;
        }
      }
    } catch (error) {
        console.error('获取主题色失败,使用默认主题色:', error);
        return '#FF5F1F'; // 默认主题色
    }
  }
  return '#FF5F1F'; // 默认主题色
};

// 生成带有透明度的颜色
export const getColorWithOpacity = (color: string, opacity: number): string => {
  // 如果是十六进制颜色
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  // 如果已经是 rgba 格式
  if (color.startsWith('rgba')) {
    return color.replace(/[\d\.]+\)$/, `${opacity})`); 
  }
  // 如果是 rgb 格式
  if (color.startsWith('rgb')) {
    return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
  }
  return color;
};

// 定义主题变量映射
export const getThemeVariables = () => {
  const themeColor = getThemeColorFromStorage();
  const themeColorWithOpacity = getColorWithOpacity(themeColor, 0.3); // 30% 透明度
  const warningColor = '#FF8A26'; // 警告色
  const warningBgColor = getColorWithOpacity(warningColor, 0.08); // 8% 透明度的警告色背景
  
  return {
    light: {
        '--background': '#ffffff',
        '--theme-color': themeColor,
        '--theme-shadow': themeColorWithOpacity,
        '--background2': 'rgb(245, 245, 245)',
        '--background3': '#ffffff',
        '--background4': '#0a0a0a',
        '--background5': '#ffffff',
        '--background6': '#F3F3F3',
        '--background7': '#FFFFFF',
        '--background8': '#FFFFFF',
        '--background9': '#FFFFFF',
        '--background10': '#F5F5F5',
        '--background11': '#ffffff',
        '--background12': '#ffffff',
        '--background13': '#0C0D0C',
        '--background14': '#F5F5F5',
        '--background15': '#ffffff',
        '--background16': '#EBEBEC',
        '--foreground': '#171717',
        '--homeground': '#000000',
        '--homeground2': '#FFFFFF',
        '--btnbgcolor': themeColor,
        '--btnbgcolor1': getColorWithOpacity(themeColor, 0.5),
        '--btnbgcolor2': '#FFFFFF',
        '--btnbgcolor3': '#F5F5F5',
        '--textcolor': '#0a0a0a',
        '--btncolor1': '#979897',
        '--hometext': '#ffffff',
        '--hometext2': '#979897',
        '--hometext3': '#0C0D0C',
        '--btncolor': '#FFFFFF',
        '--btncolor2': '#000317',
        '--btncolor3': '#E1E1E4',
        '--btncolor4': 'linear-gradient(90deg, #00EEFF 0%, #1F40FF 100%)',
        '--btncolor5': themeColor,
        '--btncolor6': '#F3F3F3',
        '--btncolor7': '#FFFFFF',
        '--btncolor8': '#E6E6E6',
        '--btncolor9': '#E1E1E4',
        '--tip-color1': '#6D6F7A',
        '--tip-color2': '#A4A5AC',
        '--text-color': '#1F40FF',
        '--text-color2': '#373949',
        '--text-color3': themeColor,
        '--text-color4': '#9E9E9E',
        '--text-color5': '#0C0D0C',
        '--text-color6': '#676867',
        '--text-color7': '#0C0D0C',
        '--text-color8': '#ffffff',
        '--waring-color': warningColor,
        '--waring-bg': warningBgColor,
        '--cancel-btn': '#F3F3F3',
        '--cancel-color': '#0C0D0C',
        '--cancel-btn2': '#F3F3F3',
        '--border-color': '#DCDCDC',
        '--border-color2': '#FFFFFF1A',
        '--border-color3': '#0C0D0C',
        '--border-color4': '#DCDCDC',
        '--border-color5': '#E5E5E5',
        '--border-color6': '#E5E5E5',
        '--bgc-color': '#FFF5F1',
        '--help-center-banner': 'url("/images/help_center/banner.png")',
        '--help-center-input-text': '#9E9E9E',
        '--help-center-card-bg': '#FFFFFF',
        '--help-center-card-shadow': '0px 0px 36px 0px #A5A5A533',
        '--segmented-item-active-bg': '#FFFFFF',
        '--segmented-item-bgc': '#F6F7FB',
        '--background-menu': '#FFFFFF',
        '--background-menu-item': '#F4F4F4',
        '--card-shadow': '#A5A5A533'
    },
    dark: {
        '--background': '#0a0a0a',
        '--theme-color': themeColor,
        '--theme-shadow': getColorWithOpacity(themeColor, 0.3),
        '--background2': '#0C0B19',
        '--background3': '#333333',
        '--background4': '#0a0a0a',
        '--background5': '#29292F',
        '--background6': 'rgb(20, 20, 20)',
        '--background7': '#FFFFFF14',
        '--background8': '#262626',
        '--background9': '#0C0D0C',
        '--background10': '#202020',
        '--background11': '#111212',
        '--background12': '#232328',
        '--background13': '#232328',
        '--background14': '#333333',
        '--background15': '#37373A',
        '--background16': '#4F4F4F',
        '--foreground': '#ededed',
        '--homeground': '#000000',
        '--homeground2': '#000000',
        '--btnbgcolor': themeColor,
        '--btnbgcolor1': getColorWithOpacity(themeColor, 0.5),
        '--btnbgcolor2': '#1a1a1a',
        '--btnbgcolor3': '#141414',
        '--textcolor': '#ffffff',
        '--btncolor1': '#979897',
        '--hometext': '#ffffff',
        '--hometext2': '#979897',
        '--hometext3': '#FFFFFF',
        '--btncolor': '#373949',
        '--btncolor2': '#ffffff',
        '--btncolor3': '#1E1E20',
        '--btncolor4': 'linear-gradient(90deg, #00EEFF 0%, #1F40FF 100%)',
        '--btncolor5': themeColor,
        '--btncolor6': '#333333',
        '--btncolor7': '#272727',
        '--btncolor8': '#333333',
        '--btncolor9': '#1E1E20',
        '--tip-color1': '#FFFFFFB2',
        '--tip-color2': '#979897',
        '--text-color': '#1F40FF',
        '--text-color2': '#ededed',
        '--text-color3': themeColor,
        '--text-color4': '#9E9E9E',
        '--text-color5': '#ffffff',
        '--text-color6': '#A4A5AC',
        '--text-color7': '#A4A5AC',
        '--text-color8': '#0C0D0C',
        '--waring-color': warningColor,
        '--waring-bg': warningBgColor,
        '--cancel-btn': '#3D3D3F',
        '--cancel-color': '#ffffff',
        '--cancel-btn2': '#333333',
        '--border-color': '#FFFFFF33',
        '--border-color2': '#DCDCDC',
        '--border-color3': '#FFFFFF',
        '--border-color4': '#37373A',
        '--border-color5': '#29292F',
        '--border-color6': '#37373A',
        '--bgc-color': '#281D1A',
        '--help-center-banner': 'url("/images/help_center/banner_dark.png")',
        '--help-center-input-text': '#979897',
        '--help-center-card-bg': '#232328',
        '--help-center-card-shadow': '0px 0px 36px 0px #A5A5A533',
        '--segmented-item-active-bg': '#272727',
        '--segmented-item-bgc': '#141414',
        '--background-menu': '#232328',
        '--background-menu-item': '#0C0D0C',
        '--card-shadow': '#01367433'
    }
  };
}