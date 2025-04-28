type MessageCallback = (message: string) => void;
type ErrorCallback = (error: Event) => void;

enum ConnectionState {
  CONNECTING,
  OPEN,
  CLOSED,
  RECONNECTING
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private readonly url: string;
  private readonly pingInterval: number;
  private readonly pongTimeout: number;
  private readonly maxReconnectAttempts: number;
  
  private reconnectAttempts: number = 0;
  private pingTimer?: NodeJS.Timeout;
  private pongWaitTimer?: NodeJS.Timeout;
  private reconnectTimer?: NodeJS.Timeout;
  
  private state: ConnectionState = ConnectionState.CLOSED;
  private messageCallback?: MessageCallback;
  private errorCallback?: ErrorCallback;
  private useProtocolPing: boolean = true; // 是否使用协议层心跳

  constructor(
    url: string,
    options: {
      pingInterval?: number;    // 心跳间隔（毫秒），默认 25000
      pongTimeout?: number;     // pong响应超时（毫秒），默认 5000
      maxReconnectAttempts?: number; // 最大重试次数，默认 Infinity
    } = {}
  ) {
    this.url = url;
    this.pingInterval = options.pingInterval || 2000;
    this.pongTimeout = options.pongTimeout || 10000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || Infinity;
  }

  connect(onMessage: MessageCallback, onError?: ErrorCallback): void {
    if (this.state !== ConnectionState.CLOSED) {
      console.warn(`连接已存在，当前状态: ${ConnectionState[this.state]}`);
      return;
    }

    this.messageCallback = onMessage;
    this.errorCallback = onError;
    this.state = ConnectionState.CONNECTING;

    this.socket = new WebSocket(this.url);
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // 检测浏览器是否支持协议层 ping
    this.useProtocolPing = typeof (this.socket as any).ping === 'function';

    this.socket.onopen = () => {
      this.state = ConnectionState.OPEN;
      this.reconnectAttempts = 0;
      this.clearTimers();
      this.startHeartbeat();
      console.log(`WebSocket 连接成功: ${this.url}`);
      console.log(`心跳模式: ${this.useProtocolPing ? '协议层' : '应用层'}`);
    };

    // 协议层 pong 监听
    this.socket.addEventListener('pong', () => {
      this.handlePong();
    });

    this.socket.onmessage = (event: MessageEvent) => {
      // 处理应用层回退 pong
      if (!this.useProtocolPing && event.data === '{"type":"__pong__"}') {
        this.handlePong();
        return;
      }

      if (this.messageCallback) this.messageCallback(event.data);
    };

    this.socket.onerror = (event: Event) => {
      console.error('WebSocket 错误:', event);
      this.errorCallback?.(event);
    };

    this.socket.onclose = (event: CloseEvent) => {
      this.state = ConnectionState.CLOSED;
      this.clearTimers();
      this.socket = null;

      if (!event.wasClean && this.shouldReconnect()) {
        this.handleReconnect();
      }
    };
  }

  private startHeartbeat(): void {
    this.pingTimer = setInterval(() => {
      this.sendPing();
      this.pongWaitTimer = setTimeout(
        () => this.handlePongTimeout(),
        this.pongTimeout
      );
    }, this.pingInterval);
  }

  private sendPing(): void {
    if (!this.socket) return;

    try {
      if (this.useProtocolPing) {
        // 协议层 ping（带时间戳 payload）
        const timestamp = Buffer.from(Date.now().toString());
        (this.socket as any).ping(timestamp);
      } else {
        // 应用层回退 ping
        this.socket.send(JSON.stringify({ 
          type: '__ping__',
          timestamp: Date.now()
        }));
      }
    } catch (err) {
      console.error('发送 ping 失败:', err);
    }
  }

  private handlePong(): void {
    clearTimeout(this.pongWaitTimer);
  }

  private handlePongTimeout(): void {
    console.error('心跳响应超时，主动断开连接');
    this.socket?.close();
    this.handleReconnect();
  }

  private shouldReconnect(): boolean {
    return this.reconnectAttempts < this.maxReconnectAttempts;
  }

  private handleReconnect(): void {
    this.state = ConnectionState.RECONNECTING;
    this.reconnectAttempts++;
    
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`将在 ${delay}ms 后尝试第 ${this.reconnectAttempts} 次重连`);

    this.reconnectTimer = setTimeout(() => {
      if (this.messageCallback) {
        this.connect(this.messageCallback, this.errorCallback);
      }
    }, delay);
  }

  send(message: string): boolean {
    if (this.state === ConnectionState.OPEN && this.socket) {
      try {
        this.socket.send(message);
        return true;
      } catch (err) {
        console.error('消息发送失败:', err);
        return false;
      }
    }
    console.warn('消息发送失败: 连接未就绪');
    return false;
  }

  close(): void {
    this.state = ConnectionState.CLOSED;
    this.clearTimers();
    this.socket?.close();
  }

  private clearTimers(): void {
    clearInterval(this.pingTimer);
    clearTimeout(this.pongWaitTimer);
    clearTimeout(this.reconnectTimer);
  }

  get connectionState(): ConnectionState {
    return this.state;
  }
}

export default WebSocketService;