import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { Button } from "antd";

dayjs.extend(duration);

interface CountdownProps {
  value: number; // 剩余时间（毫秒）
  onEnd?: (isEnd: boolean) => void; // 倒计时结束回调
  btn?: React.ReactNode; // 按钮
}

const Countdown: React.FC<CountdownProps> = ({ value, onEnd, btn }) => {
  const [remaining, setRemaining] = useState(value);

  useEffect(() => {
    // 如果传入进来是大于0 
    if (value > 0) {
      // 设置剩余时间
      setRemaining(value);

      // 则开始倒计时
      const timer = setInterval(() => {
        setRemaining((prev) => {
          const newRemaining = prev - 1000;

          if (newRemaining <= 0) {
            onEnd?.(true);
            return 0;
          }

          return newRemaining;
        });
      }, 1000);

      // 清除定时器
      return () => clearInterval(timer);
    } else {
      onEnd?.(true);
    }
  }, [value, onEnd]);

  // 格式化显示时间
  const formatTime = (ms: number) => {
    if (ms <= 0) {
      return "0d 00h 00m 00s";
    }

    const d = dayjs.duration(ms);
    return `${d.days()}d ${d.hours().toString().padStart(2, "0")}h ${d
      .minutes()
      .toString()
      .padStart(2, "0")}m ${d.seconds().toString().padStart(2, "0")}s`;
  };

  return (
    <div>
      {remaining > 0 ? (
        <Button type="primary" shape="round" disabled={true}>
          {formatTime(remaining)}
        </Button>
      ) : (
        btn
      )}
    </div>
  );
};

export default Countdown;
