// components/toast/Toaster.tsx
import { useState, useEffect } from "react";
import { Toaster as SonnerToaster } from "sonner";
import styled from "styled-components";
import { Iconify } from "../icon";

// 辅助函数，生成 rgba 颜色
const rgbAlpha = (r: number, g: number, b: number, alpha: number) => `rgba(${r}, ${g}, ${b}, ${alpha})`;

const ToasterStyleWrapper = styled.div`
  [data-sonner-toast] {
    font-weight: 600;
    font-size: 14px;

    [data-cancel] {
      color: "#FFFFFF";
      background-color: transparent;
      &:hover {
        background-color: ${rgbAlpha(51, 51, 51, 0.08)};
      }
    }

    [data-action] {
      color: #007BFF;
      background-color: transparent;
      &:hover {
        background-color: ${rgbAlpha(0, 123, 255, 0.08)};
      }
    }

    &[data-type="info"] [data-action] {
      color: #17A2B8;
      background-color: transparent;
      &:hover {
        background-color: ${rgbAlpha(23, 162, 184, 0.08)};
      }
    }

    &[data-type="error"] [data-action] {
      color: #DC3545;
      background-color: transparent;
      &:hover {
        background-color: ${rgbAlpha(220, 53, 69, 0.08)};
      }
    }

    &[data-type="success"] [data-action] {
      color: #28A745;
      background-color: transparent;
      &:hover {
        background-color: ${rgbAlpha(40, 167, 69, 0.08)};
      }
    }

    &[data-type="warning"] [data-action] {
      color: #FFC107;
      background-color: transparent;
      &:hover {
        background-color: ${rgbAlpha(255, 193, 7, 0.08)};
      }
    }

    [data-close-button] {
      top: 0;
      right: 0;
      left: auto;
      border-width: 1px;
      border-style: dashed;
      background-color: #FFFFFF;
      border-color: #E0E0E0;
    }
  }
`;

interface ToastProps {
  isDarkMode?: boolean;
}

const Toast: React.FC<ToastProps> = ({ isDarkMode }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // 仅在客户端设置为 true
  }, []);

  if (!isMounted) return null; // 服务器端不渲染

  return (
    <ToasterStyleWrapper>
      <SonnerToaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            backgroundColor: isDarkMode ? "var(--background3-dark)" : "var(--background3)",
            color: isDarkMode ? "var(--text-color2-dark)" : "var(--text-color2)",
          },
          classNames: {
            toast: "rounded-lg border-0",
            description: "text-xs text-current/45",
            content: "flex-1 ml-2",
            icon: "flex items-center justify-center px-4 rounded-lg",
            success: "bg-success/10",
            error: "bg-error/10",
            warning: "bg-warning/10",
            info: "bg-info/10",
          },
        }}
        icons={{
          success: (
            <div className="p-2 bg-success/10 rounded-lg">
              <Iconify icon="carbon:checkmark-filled" size={24} color="#36B37E" />
            </div>
          ),
          error: (
            <div className="p-2 bg-error/10 rounded-lg">
              <Iconify icon="carbon:warning-hex-filled" size={24} color="#FF5630" />
            </div>
          ),
          warning: (
            <div className="p-2 bg-warning/10 rounded-lg">
              <Iconify icon="carbon:warning-alt-filled" size={24} color="#FFAB00" />
            </div>
          ),
          info: (
            <div className="p-2 bg-info/10 rounded-lg">
              <Iconify icon="carbon:information-filled" size={24} color="#00B8D9" />
            </div>
          ),
          loading: (
            <div className="p-2 bg-gray-400/10 text-gray-400 rounded-lg">
              <Iconify icon="svg-spinners:6-dots-scale-middle" size={24} speed={3} />
            </div>
          ),
        }}
        expand
      />
    </ToasterStyleWrapper>
  );
};

export default Toast;