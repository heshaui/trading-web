import React from "react";

// 定义样式接口类型
interface ContainerStyleType extends React.CSSProperties {
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
}

interface TradeGridLayoutProps {
  children: React.ReactNode;
  containerStyle?: ContainerStyleType;
  itemStyle?: React.CSSProperties;
}

const TradeGridLayout: React.FC<TradeGridLayoutProps> = ({
  children,
  containerStyle = {},
  itemStyle = {},
}) => {
  // 定义父容器样式
  const parentStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gridAutoRows: '60px',
    gap: '4px',
    backgroundColor: 'var(--background14)',
    ...containerStyle, // 合并传入的容器样式
  };

  // 定义各个网格项的样式数组
  const gridItemStyles: React.CSSProperties[] = [
    {
      gridColumn: '1 / span 3',
      ...itemStyle,
      backgroundColor: 'var(--background9)',
    },
    {
      gridRow: 'span 6 / span 6',
      gridColumnStart: '4',
      gridRowStart: '1',
      ...itemStyle,
      backgroundColor: 'var(--background9)',
    },
    {
      gridRow: 'span 8 / span 8',
      gridColumnStart: '5',
      gridRowStart: '1',
      ...itemStyle,
      backgroundColor: 'var(--background9)',
    },
    {
      gridRow: 'span 10 / span 10',
      gridColumn: 'span 3 / span 3',
      gridColumnStart: '1',
      gridRowStart: '2',
      ...itemStyle,
      backgroundColor: 'var(--background9)',
    },
    {
      gridRow: 'span 5 / span 5',
      gridColumnStart: '4',
      gridRowStart: '7',
      ...itemStyle,
      backgroundColor: 'var(--background9)',
    },
    {
      gridRow: 'span 3 / span 3',
      gridColumnStart: '5',
      gridRowStart: '9',
      ...itemStyle, 
      backgroundColor: 'var(--background9)',
    },
    {
      gridColumn: 'span 4 / span 4',
      gridRow: 'span 7 / span 7',
      gridColumnStart: '1',
      gridRowStart: '12',
      ...itemStyle,
      backgroundColor: 'var(--background9)',
    },
    {
      gridRow: 'span 5 / span 5',
      gridColumnStart: '5',
      gridRowStart: '12',
      ...itemStyle,
      backgroundColor: 'var(--background9)',
    },
  ];

  // 将 children 转换为数组并应用对应的样式
  const childrenArray = React.Children.toArray(children);

  return (
    <div style={parentStyle}>
      {childrenArray.map((child, index) => {
        // 如果超出预定义样式的数量，使用默认样式
        const currentStyle = gridItemStyles[index] || {
          backgroundColor: '#cccccc',
          ...itemStyle,
        };

        // 如果 child 是 React 元素，克隆并添加样式
        if (React.isValidElement(child)) {
          const element = child as React.ReactElement<{ style?: React.CSSProperties }>;
          return React.cloneElement(element, {
            key: index,
            style: {
              ...currentStyle,
              ...(element.props.style || {}), // 保留原有的内联样式
            },
          });
        }

        // 如果不是 React 元素，用 div 包装
        return (
          <div key={index} style={currentStyle}>
            {child}
          </div>
        );
      })}
    </div>
  );
};

export default TradeGridLayout;
