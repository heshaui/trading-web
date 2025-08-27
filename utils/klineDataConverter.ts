export interface KlineBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface RawKlineData {
  id?: number;
  ds?: string;
  time?: number;
  open: number;
  high: number;
  low: number;
  close: number;
  vol?: number;
  volume?: number;
}

export interface WebSocketKlineData {
  event_rep: string;
  data?: RawKlineData[];
  tick?: RawKlineData;
}

export class KlineDataConverter {
  private static formatTimeValue(timeValue: any): number {
    try {
      if (timeValue === undefined || timeValue === null) {
        console.warn("⚠️ 时间值为空，使用当前时间");
        return Date.now();
      }

      if (typeof timeValue === "number") {
        if (!isFinite(timeValue) || isNaN(timeValue)) {
          console.warn("⚠️ 无效的数字时间戳:", timeValue);
          return Date.now();
        }

        const timestamp = timeValue < 10000000000 ? timeValue * 1000 : timeValue;
        const now = Date.now();
        const oneYearMs = 365 * 24 * 60 * 60 * 1000;
        const minValidTime = new Date('1970-01-01').getTime();
        const maxValidTime = now + oneYearMs;

        if (timestamp < minValidTime || timestamp > maxValidTime) {
          console.warn("⚠️ 时间戳超出有效范围:", timestamp);
          return now;
        }

        const testDate = new Date(timestamp);
        if (isNaN(testDate.getTime())) {
          console.warn("⚠️ 时间戳无法创建有效Date对象:", timestamp);
          return now;
        }

        return timestamp;
      }

      if (typeof timeValue === "string") {
        const parsedTime = new Date(timeValue).getTime();
        if (isNaN(parsedTime)) {
          console.warn("⚠️ 无法解析时间字符串:", timeValue);
          return Date.now();
        }
        return parsedTime;
      }

      console.warn("⚠️ 未知的时间值类型:", typeof timeValue, timeValue);
      return Date.now();
    } catch (error) {
      console.error("💥 时间格式化错误:", error, "原始值:", timeValue);
      return Date.now();
    }
  }

  static convertToBar(kline: any): KlineBar | null {
    try {
      if (!kline) {
        console.warn("⚠️ K线数据为空");
        return null;
      }

      let time: number;
      let open: number;
      let high: number;
      let low: number;
      let close: number;
      let volume: number;

      if (typeof kline === 'object' && !Array.isArray(kline)) {
        if (kline.time !== undefined) {
          time = Number(kline.time);
          open = Number(kline.open || 0);
          high = Number(kline.high || 0);
          low = Number(kline.low || 0);
          close = Number(kline.close || 0);
          volume = Number(kline.volume || 0);
        } else if (kline.ds !== undefined) {
          time = new Date(kline.ds).getTime();
          open = Number(kline.open || 0);
          high = Number(kline.high || 0);
          low = Number(kline.low || 0);
          close = Number(kline.close || 0);
          volume = Number(kline.vol || 0);
        } else if (kline.id !== undefined) {
          time = this.formatTimeValue(kline.id * 1000);
          open = Number(kline.open || 0);
          high = Number(kline.high || 0);
          low = Number(kline.low || 0);
          close = Number(kline.close || 0);
          volume = Number(kline.vol || 0);
        } else {
          console.warn("⚠️ 对象格式K线数据缺少时间字段:", kline);
          return null;
        }
      } else if (Array.isArray(kline) && kline.length >= 7) {
        time = this.formatTimeValue(kline[0]);
        high = Number(kline[1] || 0);
        open = Number(kline[2] || 0);
        low = Number(kline[3] || 0);
        close = Number(kline[4] || 0);
        volume = Number(kline[6] || 0);
      } else {
        console.warn("⚠️ 无法识别的K线数据格式:", kline);
        return null;
      }

      if (!isFinite(time) || !isFinite(open) || !isFinite(high) || !isFinite(low) || !isFinite(close) || !isFinite(volume)) {
        console.warn("⚠️ K线数据包含无效数值:", { time, open, high, low, close, volume });
        return null;
      }

      if (high < low || high < open || high < close || low > open || low > close) {
        console.warn("⚠️ 价格数据异常:", { time, open, high, low, close, volume });
      }

      return { time, open, high, low, close, volume };
    } catch (error) {
      console.error("💥 K线数据转换错误:", error, "原始数据:", kline);
      return null;
    }
  }

  static deduplicateAndSort(bars: KlineBar[]): KlineBar[] {
    const timeSet = new Set<number>();
    const deduplicatedBars: KlineBar[] = [];

    bars
      .sort((a, b) => a.time - b.time)
      .forEach(bar => {
        if (!timeSet.has(bar.time)) {
          timeSet.add(bar.time);
          deduplicatedBars.push(bar);
        }
      });

    return deduplicatedBars;
  }

  static extractTimeFromKline(kline: any): number {
    if (kline.time !== undefined) {
      return Number(kline.time);
    } else if (kline.ds !== undefined) {
      return new Date(kline.ds).getTime();
    } else if (kline.id !== undefined) {
      return kline.id * 1000;
    } else if (Array.isArray(kline)) {
      return this.formatTimeValue(kline[0]);
    }
    return 0;
  }
}