import React from 'react';

interface SvgIconProps {
  path: string;                         // SVG 路径数据
  viewBox?: string;                     // SVG 视口
  className?: string;                   // CSS 类名
  style?: React.CSSProperties;          // 内联样式
  width?: number | string;              // 宽度
  height?: number | string;             // 高度
  size?: number | string;               // 同时设置宽度和高度
  fill?: string;                        // 填充颜色
  stroke?: string;                      // 描边颜色
  strokeWidth?: number | string;        // 描边宽度
  onClick?: (e: React.MouseEvent) => void; // 点击事件处理函数
}

/**
 * 通用 SVG 图标组件
 * 
 * 使用示例:
 * <SvgIcon 
 *   path="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" 
 *   size={24} 
 *   fill="currentColor" 
 * />
 */
const SvgIcon: React.FC<SvgIconProps> = ({ 
  path,
  viewBox = "0 0 24 24",
  className = '',
  style = {},
  width,
  height,
  size = 24,
  fill = "currentColor",
  stroke,
  strokeWidth,
  onClick,
  ...rest
}) => {
  const finalWidth = width || size;
  const finalHeight = height || size;
  
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg"
      width={finalWidth} 
      height={finalHeight} 
      viewBox={viewBox} 
      fill="none" 
      className={className}
      style={style}
      onClick={onClick}
      {...rest}
    >
      <path 
        d={path}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
};

export default SvgIcon;