import { useState, useEffect, useRef, ReactNode, useCallback } from "react";

interface WaterfallItem {
  id?: string;
  columnSpan: number;
  height?: number;
  minHeight?: number;
  content: ReactNode;
}

interface WaterfallLayoutProps {
  items: WaterfallItem[];
  columns?: number;
  gap?: number;
  fadeInDuration?: number;
}

const WaterfallLayout: React.FC<WaterfallLayoutProps> = ({
  items,
  columns = 5,
  gap = 4,
  fadeInDuration = 500,
}) => {
  const [positions, setPositions] = useState<{
    [key: string]: { top: number; left: number; width: number };
  }>({});
  const [containerHeight, setContainerHeight] = useState(0);
  const [isCalculating, setIsCalculating] = useState(true);
  const [visibleItems, setVisibleItems] = useState<{ [key: string]: boolean }>(
    {}
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // 确保每个元素都有唯一ID
  const itemsWithIds = items.map((item, index) => ({
    ...item,
    id: item.id || `waterfall-item-${index}`,
    minHeight: item.minHeight || item.height || 100,
  }));

  // 瀑布流布局计算
  const calculateWaterfallLayout = useCallback(() => {
    if (!containerRef.current) return;

    setIsCalculating(true);

    void containerRef.current.offsetHeight;

    const columnHeights = new Array(columns).fill(0);
    const columnWidth = 100 / columns;
    const newPositions: {
      [key: string]: { top: number; left: number; width: number };
    } = {};

    itemsWithIds.forEach((item) => {
      let elementHeight = item.height;
      if (elementHeight === undefined) {
        const ref = itemRefs.current[item.id!];
        elementHeight = ref ? ref.offsetHeight : item.minHeight!;
      }

      let bestColumn = 0;
      let minHeight = Infinity;

      for (let col = 0; col <= columns - item.columnSpan; col++) {
        let maxHeight = 0;
        for (let i = 0; i < item.columnSpan; i++) {
          maxHeight = Math.max(maxHeight, columnHeights[col + i]);
        }
        if (maxHeight < minHeight) {
          minHeight = maxHeight;
          bestColumn = col;
        }
      }

      newPositions[item.id!] = {
        top: minHeight,
        left: bestColumn * columnWidth,
        width: item.columnSpan * columnWidth,
      };

      const totalHeight = minHeight + elementHeight + gap;
      for (let i = 0; i < item.columnSpan; i++) {
        columnHeights[bestColumn + i] = totalHeight;
      }
    });

    setPositions(newPositions);
    setContainerHeight(Math.max(...columnHeights));
    setIsCalculating(false);

    // 设置可见状态，触发渐入动画
    const newVisibleItems: { [key: string]: boolean } = {};
    itemsWithIds.forEach((item) => {
      newVisibleItems[item.id!] = true;
    });
    setVisibleItems(newVisibleItems);
  }, [itemsWithIds, columns, gap]);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      calculateWaterfallLayout();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
      requestAnimationFrame(() => {
        calculateWaterfallLayout();
      });
    }

    return () => observer.disconnect();
  }, [calculateWaterfallLayout]);

  // 容器样式
  const containerStyle = {
    position: "relative" as const,
    width: "100%",
    height: containerHeight,
    transition: "height 0.3s ease",
  };

  // 元素基础样式 - 修改为原地渐入
  const itemBaseStyle = {
    position: "absolute" as const,
    boxSizing: "border-box" as const,
    transition: `opacity ${fadeInDuration}ms ease`, // 只保留opacity过渡
    opacity: 0, // 初始透明
  };

  return (
    <div ref={containerRef} style={containerStyle}>
      {itemsWithIds.map((item) => {
        const pos = positions[item.id!];
        const isReady = !isCalculating && pos;
        const isVisible = visibleItems[item.id!];

        return (
          <div
            key={item.id}
            ref={(el) => {
              itemRefs.current[item.id!] = el;
            }}
            style={{
              ...itemBaseStyle,
              top: isReady ? pos.top : 0,
              left: isReady ? `${pos.left}%` : "0%",
              width: isReady
                ? `calc(${pos.width}% - ${gap}px)`
                : `${100 / columns}%`,
              height: item.height ? `${item.height}px` : "auto",
              minHeight: item.minHeight ? `${item.minHeight}px` : undefined,
              opacity: isVisible ? 1 : 0, // 原地渐入效果
              backgroundColor: item.height ? "transparent" : "#f0f0f0",
            }}
          >
            {item.content}
          </div>
        );
      })}
    </div>
  );
};

// 使用示例
const Demo = () => {
  const waterfallItems: WaterfallItem[] = [
    {
      columnSpan: 3,
      height: 60,
      content: (
        <div
          style={{
            backgroundColor: "#ff7675",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
          }}
        >
          1
        </div>
      ),
    },
    {
      columnSpan: 1,
      height: 380,
      content: (
        <div
          style={{
            backgroundColor: "#74b9ff",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
          }}
        >
          2
        </div>
      ),
    },
    {
      columnSpan: 1,
      height: 530,
      content: (
        <div
          style={{
            backgroundColor: "#55efc4",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
          }}
        >
          3
        </div>
      ),
    },
    {
      columnSpan: 3,
      height: 550,
      content: (
        <div
          style={{
            backgroundColor: "#a29bfe",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
          }}
        >
          4
        </div>
      ),
    },
    {
      columnSpan: 1,
      height: 230,
      content: (
        <div
          style={{
            backgroundColor: "#ffeaa7",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#333",
            fontWeight: "bold",
          }}
        >
          5
        </div>
      ),
    },
    {
      columnSpan: 1,
      height: 190,
      content: (
        <div
          style={{
            backgroundColor: "#fd79a8",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
          }}
        >
          6
        </div>
      ),
    },
    {
      columnSpan: 4,
      minHeight: 400,
      content: (
        <div
          style={{
            backgroundColor: "#81ecec",
            padding: "10px",
            height: "100%",
            overflow: "auto",
          }}
        >
          {Array.from({ length: 50 }).map((_, i) => (
            <div key={i} style={{ padding: "5px" }}>
              Item {i + 1}
            </div>
          ))}
        </div>
      ),
    },
    {
      columnSpan: 1,
      height: 300,
      content: (
        <div
          style={{
            backgroundColor: "#fab1a0",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
          }}
        >
          8
        </div>
      ),
    },
  ];

  return <WaterfallLayout items={waterfallItems} columns={5} gap={4} />;
};

export { WaterfallLayout };
export default WaterfallLayout;
