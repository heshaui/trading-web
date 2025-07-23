import React, { useRef, useState, useEffect } from 'react';
import { SvgIcon } from '@/components/icon';

interface ScrollableContainerProps {
  children: React.ReactNode[];
  itemsPerView?: number;
  className?: string;
  itemClassName?: string;
  showDots?: boolean;
}

const ScrollableContainer: React.FC<ScrollableContainerProps> = ({
  children,
  itemsPerView = 3,
  className = '',
  itemClassName = '',
  showDots = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showButtons, setShowButtons] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      if (!containerRef.current) return;
      
      const needsScroll = children.length > itemsPerView;
      setShowButtons(needsScroll);
      
      setIsAtStart(currentIndex <= 0);
      setIsAtEnd(currentIndex >= children.length - itemsPerView);
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [children.length, itemsPerView, currentIndex]);

  const scrollTo = (index: number) => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const itemWidth = container.scrollWidth / children.length;
    container.scrollTo({
      left: index * itemWidth,
      behavior: 'smooth'
    });
    setCurrentIndex(index);
  };

  const next = () => {
    if (!isAtEnd) {
      scrollTo(currentIndex + 1);
    }
  };

  const prev = () => {
    if (!isAtStart) {
      scrollTo(currentIndex - 1);
    }
  };

  const itemWidthPercent = 100 / itemsPerView;

  return (
    <div className={`relative ${className} p-[20px]`}>
      <div
        ref={containerRef}
        className="flex overflow-x-hidden scroll-smooth gap-[16px]"
        style={{ scrollBehavior: 'smooth' }}
      >
        {children.map((child, index) => (
          <div 
            key={index}
            className={`flex-none ${itemClassName}`}
            style={{ width: `30.5%` }}
          >
            {child}
          </div>
        ))}
      </div>

      {/* 左侧箭头 - 使用自定义 SVG 图标 */}
      {showButtons && !isAtStart && (
        <button
          type="button"
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2"
          aria-label="Previous"
        >
          <SvgIcon
            className="transform rotate-180"
            path="M14.536 12.707C14.7235 12.5195 14.8288 12.2652 14.8288 12C14.8288 11.7348 14.7235 11.4805 14.536 11.293L11.707 8.46401C11.5671 8.32414 11.3888 8.22891 11.1948 8.19037C11.0007 8.15184 10.7996 8.17172 10.6169 8.24752C10.4341 8.32331 10.278 8.45161 10.1682 8.61617C10.0584 8.78073 9.99984 8.97417 10 9.17201V14.828C9.99984 15.0258 10.0584 15.2193 10.1682 15.3838C10.278 15.5484 10.4341 15.6767 10.6169 15.7525C10.7996 15.8283 11.0007 15.8482 11.1948 15.8096C11.3888 15.7711 11.5671 15.6759 11.707 15.536L14.536 12.707Z"
          />
        </button>
      )}

      {/* 右侧箭头 - 使用自定义 SVG 图标 */}
      {showButtons && !isAtEnd && (
        <button
          type="button"
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2"
          aria-label="Next"
        >
          <SvgIcon
            path="M14.536 12.707C14.7235 12.5195 14.8288 12.2652 14.8288 12C14.8288 11.7348 14.7235 11.4805 14.536 11.293L11.707 8.46401C11.5671 8.32414 11.3888 8.22891 11.1948 8.19037C11.0007 8.15184 10.7996 8.17172 10.6169 8.24752C10.4341 8.32331 10.278 8.45161 10.1682 8.61617C10.0584 8.78073 9.99984 8.97417 10 9.17201V14.828C9.99984 15.0258 10.0584 15.2193 10.1682 15.3838C10.278 15.5484 10.4341 15.6767 10.6169 15.7525C10.7996 15.8283 11.0007 15.8482 11.1948 15.8096C11.3888 15.7711 11.5671 15.6759 11.707 15.536L14.536 12.707Z"
          />
        </button>
      )}

      {showButtons && showDots && children.length > itemsPerView && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: children.length - itemsPerView + 1 }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollTo(index)}
              className={`w-3 h-3 rounded-full ${
                index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ScrollableContainer;