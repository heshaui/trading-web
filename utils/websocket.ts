type MessageCallback = (message: string) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private url: string;
  private reconnectInterval: number;
  private maxReconnectAttempts: number = 5; // 最大重连次数
  private reconnectAttempts: number = 0; // 当前重连尝试次数
  private reconnectTimeout: NodeJS.Timeout | null = null; // 重连定时器引用

  constructor(url: string, reconnectInterval = 5000, maxReconnectAttempts = 5) {
    this.url = url;
    this.reconnectInterval = reconnectInterval;
    this.maxReconnectAttempts = maxReconnectAttempts;
  }

  connect(onMessage: MessageCallback, onError?: (error: Event) => void) {
    // 防止创建多个 WebSocket 实例
    if (this.socket && this.socket.readyState !== WebSocket.CLOSED) {
      console.warn("WebSocket 已在连接或已打开");
      return;
    }

    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log("WebSocket 已连接");
      this.reconnectAttempts = 0; // 成功连接后重置重连次数
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout); // 清除重连定时器
        this.reconnectTimeout = null;
      }
    };

    this.socket.onmessage = (event: MessageEvent) => {
      onMessage(event.data);
    };

    this.socket.onerror = (event: Event) => {
      console.error("WebSocket 错误", event);
      onError?.(event);
    };

    this.socket.onclose = () => {
      console.log("WebSocket 已关闭");
      this.socket = null;

      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`正在重连... 尝试 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        this.reconnectTimeout = setTimeout(() => {
          this.connect(onMessage, onError);
        }, this.reconnectInterval);
      } else {
        console.error("达到最大重连次数，放弃重连");
      }
    };
  }

  send(message: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      console.error("WebSocket 未打开");
    }
  }

  close() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout); // 清除重连定时器
      this.reconnectTimeout = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.reconnectAttempts = 0; // 重置重连次数
  }
}

export default WebSocketService;