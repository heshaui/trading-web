type MessageCallback = (message: string) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private url: string;
  private reconnectInterval: number;
  private isReconnecting: boolean = false;

  constructor(url: string, reconnectInterval = 5000) {
    this.url = url;
    this.reconnectInterval = reconnectInterval;
  }

  connect(onMessage: MessageCallback, onError?: (error: Event) => void) {
    if (this.socket) return;

    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log("WebSocket connected");
      this.isReconnecting = false;
    };

    this.socket.onmessage = (event: MessageEvent) => {
      onMessage(event.data);
    };

    this.socket.onerror = (event: Event) => {
      console.error("WebSocket error", event);
      onError?.(event);
    };

    this.socket.onclose = () => {
      console.log("WebSocket closed. Reconnecting...");
      this.socket = null;
      if (!this.isReconnecting) {
        this.isReconnecting = true;
        setTimeout(() => this.connect(onMessage, onError), this.reconnectInterval);
      }
    };
  }

  send(message: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      console.error("WebSocket is not open");
    }
  }

  close() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export default WebSocketService;