import { useEffect, useRef, useState, useCallback } from 'react';
import { ContractWebSocketService, CONTRACT_CHANNELS, createContractWebSocket, ConnectionState } from '@/utils/contractWebSocket';
import appStore from '@/store';

export interface UseContractWebSocketOptions {
  symbol?: string;
  autoConnect?: boolean;
  onKlineData?: (data: any) => void;
  onDepthData?: (data: any) => void;
  onTradeData?: (data: any) => void;
  onError?: (error: Event) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export interface ContractWebSocketHookReturn {
  // 连接状态
  connectionState: ConnectionState;
  isConnected: boolean;
  
  // 连接方法
  connectKline: (symbol?: string, interval?: string) => void;
  connectDepth: (symbol?: string, levels?: number) => void;
  connectTrade: (symbol?: string) => void;
  connectMultiChannel: (channels: string[]) => void;
  
  // 控制方法
  disconnect: () => void;
  disconnectAll: () => void;
  
  // 订阅方法
  subscribe: (channels: string[]) => void;
  unsubscribe: (channels: string[]) => void;
  
  // 发送消息
  send: (message: string | object) => boolean;
  
  // WebSocket 实例引用
  klineWs: React.MutableRefObject<ContractWebSocketService | null>;
  depthWs: React.MutableRefObject<ContractWebSocketService | null>;
  tradeWs: React.MutableRefObject<ContractWebSocketService | null>;
  multiWs: React.MutableRefObject<ContractWebSocketService | null>;
}

export const useContractWebSocket = (options: UseContractWebSocketOptions = {}): ContractWebSocketHookReturn => {
  const {
    symbol = 'BTC_USDT',
    autoConnect = false,
    onKlineData,
    onDepthData,
    onTradeData,
    onError,
    onConnect,
    onDisconnect
  } = options;

  // WebSocket 实例引用
  const klineWs = useRef<ContractWebSocketService | null>(null);
  const depthWs = useRef<ContractWebSocketService | null>(null);
  const tradeWs = useRef<ContractWebSocketService | null>(null);
  const multiWs = useRef<ContractWebSocketService | null>(null);

  // 状态管理
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.CLOSED);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // 更新连接状态
  const updateConnectionState = useCallback(() => {
    const states = [
      klineWs.current?.getConnectionState(),
      depthWs.current?.getConnectionState(),
      tradeWs.current?.getConnectionState(),
      multiWs.current?.getConnectionState()
    ].filter(Boolean);

    if (states.length === 0) {
      setConnectionState(ConnectionState.CLOSED);
      setIsConnected(false);
    } else if (states.some(state => state === ConnectionState.OPEN)) {
      setConnectionState(ConnectionState.OPEN);
      setIsConnected(true);
    } else if (states.some(state => state === ConnectionState.CONNECTING)) {
      setConnectionState(ConnectionState.CONNECTING);
      setIsConnected(false);
    } else if (states.some(state => state === ConnectionState.RECONNECTING)) {
      setConnectionState(ConnectionState.RECONNECTING);
      setIsConnected(false);
    } else {
      setConnectionState(ConnectionState.CLOSED);
      setIsConnected(false);
    }
  }, []);

  // K线连接
  const connectKline = useCallback((targetSymbol?: string, interval: string = '1d') => {
    const wsSymbol = targetSymbol || symbol;
    
    if (klineWs.current) {
      klineWs.current.disconnect();
    }

    // 根据时间间隔选择频道
    let channel: string = CONTRACT_CHANNELS.KLINE_1D;
    switch (interval.toLowerCase()) {
      case '1m':
        channel = CONTRACT_CHANNELS.KLINE_1M;
        break;
      case '5m':
        channel = CONTRACT_CHANNELS.KLINE_5M;
        break;
      case '15m':
        channel = CONTRACT_CHANNELS.KLINE_15M;
        break;
      case '30m':
        channel = CONTRACT_CHANNELS.KLINE_30M;
        break;
      case '1h':
        channel = CONTRACT_CHANNELS.KLINE_1H;
        break;
      case '4h':
        channel = CONTRACT_CHANNELS.KLINE_4H;
        break;
      case '1d':
      default:
        channel = CONTRACT_CHANNELS.KLINE_1D;
        break;
    }

    klineWs.current = createContractWebSocket({
      symbol: wsSymbol,
      channel,
      onMessage: (data) => {
        console.log(`收到K线数据 (${interval}):`, data);
        if (onKlineData) {
          onKlineData(data);
        }
        updateConnectionState();
      },
      onError: (error) => {
        console.error(`K线WebSocket错误 (${interval}):`, error);
        if (onError) {
          onError(error);
        }
        updateConnectionState();
      },
      onConnect: () => {
        console.log(`K线WebSocket连接成功 (${interval})`);
        if (onConnect) {
          onConnect();
        }
        updateConnectionState();
      }
    });

    klineWs.current.connect();
  }, [symbol, onKlineData, onError, onConnect, updateConnectionState]);

  // 深度连接
  const connectDepth = useCallback((targetSymbol?: string, levels: number = 20) => {
    const wsSymbol = targetSymbol || symbol;
    
    if (depthWs.current) {
      depthWs.current.disconnect();
    }

    // 根据深度级别选择频道
    let channel: string = CONTRACT_CHANNELS.DEPTH_20;
    switch (levels) {
      case 5:
        channel = CONTRACT_CHANNELS.DEPTH_5;
        break;
      case 10:
        channel = CONTRACT_CHANNELS.DEPTH_10;
        break;
      case 20:
        channel = CONTRACT_CHANNELS.DEPTH_20;
        break;
      case 30:
        channel = CONTRACT_CHANNELS.DEPTH_30;
        break;
      default:
        channel = CONTRACT_CHANNELS.DEPTH_20;
        break;
    }

    depthWs.current = createContractWebSocket({
      symbol: wsSymbol,
      channel,
      onMessage: (data) => {
        console.log(`收到深度数据 (${levels}级):`, data);
        if (onDepthData) {
          onDepthData(data);
        }
        updateConnectionState();
      },
      onError: (error) => {
        console.error(`深度WebSocket错误 (${levels}级):`, error);
        if (onError) {
          onError(error);
        }
        updateConnectionState();
      },
      onConnect: () => {
        console.log(`深度WebSocket连接成功 (${levels}级)`);
        if (onConnect) {
          onConnect();
        }
        updateConnectionState();
      }
    });

    depthWs.current.connect();
  }, [symbol, onDepthData, onError, onConnect, updateConnectionState]);

  // 交易连接
  const connectTrade = useCallback((targetSymbol?: string) => {
    const wsSymbol = targetSymbol || symbol;
    
    if (tradeWs.current) {
      tradeWs.current.disconnect();
    }

    tradeWs.current = createContractWebSocket({
      symbol: wsSymbol,
      channel: CONTRACT_CHANNELS.TRADE,
      onMessage: (data) => {
        console.log('收到交易数据:', data);
        if (onTradeData) {
          onTradeData(data);
        }
        updateConnectionState();
      },
      onError: (error) => {
        console.error('交易WebSocket错误:', error);
        if (onError) {
          onError(error);
        }
        updateConnectionState();
      },
      onConnect: () => {
        console.log('交易WebSocket连接成功');
        if (onConnect) {
          onConnect();
        }
        updateConnectionState();
      }
    });

    tradeWs.current.connect();
  }, [symbol, onTradeData, onError, onConnect, updateConnectionState]);

  // 多通道连接
  const connectMultiChannel = useCallback((channels: string[]) => {
    if (multiWs.current) {
      multiWs.current.disconnect();
    }

    multiWs.current = createContractWebSocket({
      onMessage: (data) => {
        console.log('收到多通道数据:', data);
        
        // 根据数据类型分发到不同的处理函数
        switch (data.type) {
          case 'kline':
            if (onKlineData) {
              onKlineData(data);
            }
            break;
          case 'depth':
            if (onDepthData) {
              onDepthData(data);
            }
            break;
          case 'trade':
            if (onTradeData) {
              onTradeData(data);
            }
            break;
        }
        updateConnectionState();
      },
      onError: (error) => {
        console.error('多通道WebSocket错误:', error);
        if (onError) {
          onError(error);
        }
        updateConnectionState();
      },
      onConnect: () => {
        console.log('多通道WebSocket连接成功');
        if (onConnect) {
          onConnect();
        }
        updateConnectionState();
      }
    });

    multiWs.current.connectMultiChannel(channels);
  }, [onKlineData, onDepthData, onTradeData, onError, onConnect, updateConnectionState]);

  // 断开单个连接
  const disconnect = useCallback(() => {
    if (klineWs.current) {
      klineWs.current.disconnect();
      klineWs.current = null;
    }
    updateConnectionState();
  }, [updateConnectionState]);

  // 断开所有连接
  const disconnectAll = useCallback(() => {
    [klineWs, depthWs, tradeWs, multiWs].forEach(wsRef => {
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
    });
    updateConnectionState();
    if (onDisconnect) {
      onDisconnect();
    }
  }, [updateConnectionState, onDisconnect]);

  // 订阅频道
  const subscribe = useCallback((channels: string[]) => {
    if (multiWs.current) {
      multiWs.current.subscribe(channels);
    } else {
      console.warn('多通道WebSocket未连接，无法订阅频道');
    }
  }, []);

  // 取消订阅频道
  const unsubscribe = useCallback((channels: string[]) => {
    if (multiWs.current) {
      multiWs.current.unsubscribe(channels);
    } else {
      console.warn('多通道WebSocket未连接，无法取消订阅');
    }
  }, []);

  // 发送消息
  const send = useCallback((message: string | object): boolean => {
    if (multiWs.current) {
      return multiWs.current.send(message);
    }
    console.warn('多通道WebSocket未连接，无法发送消息');
    return false;
  }, []);

  // 初始化公共信息
  useEffect(() => {
    const initPublicInfo = async () => {
      try {
        const publicInfo = appStore.getPublicInfo();
        if (!publicInfo || !publicInfo.wsUrl) {
          await appStore.loadPublicInfo();
          console.log('公共信息加载完成');
        }
      } catch (error) {
        console.error('加载公共信息失败:', error);
      }
    };

    initPublicInfo();
  }, []);

  // 自动连接
  useEffect(() => {
    if (autoConnect) {
      connectKline();
      connectDepth();
      connectTrade();
    }
  }, [autoConnect, connectKline, connectDepth, connectTrade]);

  // 组件卸载时清理连接
  useEffect(() => {
    return () => {
      disconnectAll();
    };
  }, [disconnectAll]);

  return {
    connectionState,
    isConnected,
    connectKline,
    connectDepth,
    connectTrade,
    connectMultiChannel,
    disconnect,
    disconnectAll,
    subscribe,
    unsubscribe,
    send,
    klineWs,
    depthWs,
    tradeWs,
    multiWs
  };
};

export default useContractWebSocket; 