import React, { useState, useEffect } from 'react';
import { Tabs, Table, Button, Switch, Space, Dropdown, Menu, message } from 'antd';
import { Iconify } from '@/components/icon';
import {  } from '@/services/contract';
import styles from './styles.module.css';
import appStore from '@/store'
import { cancelOrder,getHistoryOrderList,getCurrentOrderList } from '@/services/contract';

const { TabPane } = Tabs;

interface Position {
  id: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  size: number;
  entryPrice: number;
  markPrice: number;
  pnl: number;
  pnlRate: number;
  margin: number;
  marginRate: number;
  liquidationPrice: number;
  createTime: number;
}

interface Order {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'LIMIT' | 'MARKET' | 'CONDITIONAL';
  size: number;
  price: number;
  filled: number;
  remaining: number;
  status: 'NEW' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELLED';
  createTime: number;
}

interface Trade {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  size: number;
  price: number;
  fee: number;
  createTime: number;
}

const OrderList: React.FC = () => {
  const [activeTab, setActiveTab] = useState('position');
  const [onlyCurrentSymbol, setOnlyCurrentSymbol] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [openOrders, setOpenOrders] = useState<Order[]>([]);
  const [conditionalOrders, setConditionalOrders] = useState<Order[]>([]);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [tradeHistory, setTradeHistory] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [cancellingOrderIds, setCancellingOrderIds] = useState<Set<string>>(new Set());

  const currentContractInfo = appStore.getCurrentContractInfo();

  // 等待客户端hydration完成
  useEffect(() => {
    setMounted(true);
  }, []);

  // 获取当前合约symbol用于过滤
  const currentSymbol = currentContractInfo?.symbol || '';
  
  const getHistoryOrder = async () => {
    if (!currentContractInfo?.id) {
      console.warn('No contract info available');
      return;
    }
    
    try {
      setLoading(true);
      const response = await getHistoryOrderList({ contractId: currentContractInfo.id, page: 1, pageSize: 100 });
      if (response?.data?.orderList) {
        setOrderHistory(response.data.orderList || []);
      }
    } catch (error) {
      console.error('Failed to fetch history order list:', error);
      message.error('加载历史委托失败');
    } finally {
      setLoading(false);
    }
  };

  const getOrderList = async () => {
    if (!currentContractInfo?.id) {
      console.warn('No contract info available');
      return;
    }

    try {
      setLoading(true);
      const response = await getCurrentOrderList({ contractId: currentContractInfo.id });
      
      if (response?.data?.orderList) {
        // 这里应该根据实际API返回的数据结构来设置不同的状态
        setPositions(response.data.orderList || []);
      }
    } catch (error) {
      console.error('Failed to fetch order list:', error);
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  // 取消订单功能
  const handleCancelOrder = async (order: any) => {
    try {
      // 添加到取消中的订单ID集合
      setCancellingOrderIds(prev => new Set(prev).add(order.id));
      
      const response = await cancelOrder({ 
        orderId: order.id, 
        contractId: order.contractId, 
        isConditionOrder: false 
      });
      
      if (response?.code === '0') {
        message.success('订单取消成功');
        // 重新获取订单列表
        await getOrderList();
      } else {
        message.error(response?.msg || '取消订单失败');
      }
    } catch (error) {
      console.error('Cancel order failed:', error);
      message.error('取消订单失败');
    } finally {
      // 从取消中的订单ID集合中移除
      setCancellingOrderIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(order.id);
        return newSet;
      });
    }
  };

  useEffect(() => {
    if (mounted && currentContractInfo?.id) {
      getOrderList();
    }
  }, [mounted, currentContractInfo?.id]);

  // 根据仅当前合约开关过滤数据
  const filterDataBySymbol = <T extends { symbol?: string }>(data: T[]): T[] => {
    if (!onlyCurrentSymbol || !currentSymbol) return data;
    return data.filter(item => item.symbol === currentSymbol);
  };

  // 如果还未完成hydration，返回null避免不一致
  if (!mounted) {
    return null;
  }

  // 持仓表格列
  const positionColumns = [
    {
      title: '合约',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: '委托数量',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => size?.toFixed(3) || '--',
    },
    {
      title: '成本',
      dataIndex: 'entryPrice',
      key: 'entryPrice',
      render: (price: number) => price?.toLocaleString() || '--',
    },
    {
      title: '标记价格',
      dataIndex: 'markPrice',
      key: 'markPrice',
      render: (price: number) => price?.toLocaleString() || '--',
    },
    {
      title: '未实现盈亏',
      dataIndex: 'pnl',
      key: 'pnl',
      render: (pnl: number) => (
        <span className={pnl >= 0 ? styles.profit : styles.loss}>
          {pnl?.toFixed(2) || '0.00'}
        </span>
      ),
    },
    {
      title: '保证金率',
      dataIndex: 'marginRate',
      key: 'marginRate',
      render: (rate: number) => `${(rate * 100)?.toFixed(2) || '0.00'}%`,
    },
    {
      title: '收益率',
      dataIndex: 'pnlRate',
      key: 'pnlRate',
      render: (rate: number) => (
        <span className={rate >= 0 ? styles.profit : styles.loss}>
          {(rate * 100)?.toFixed(2) || '0.00'}%
        </span>
      ),
    },
    {
      title: '快速平仓',
      key: 'quickClose',
      render: () => (
        <Button size="small" type="link">
          快速平仓
        </Button>
      ),
    },
    {
      title: '反向开仓',
      key: 'reverseOpen',
      render: () => (
        <Button size="small" type="link">
          反向开仓
        </Button>
      ),
    },
    {
      title: '止盈止损',
      key: 'tpsl',
      render: () => (
        <Button size="small" type="link">
          止盈止损
        </Button>
      ),
    },
  ];

  // 委托单表格列
  const orderColumns = [
    {
      title: '合约',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: '方向',
      dataIndex: 'side',
      key: 'side',
      render: (side: string) => (
        <span className={`${styles.direction} ${side === 'BUY' ? styles.long : styles.short}`}>
          {side === 'BUY' ? '买入' : '卖出'}
        </span>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap = {
          LIMIT: '限价',
          MARKET: '市价',
          CONDITIONAL: '条件',
        };
        return typeMap[type as keyof typeof typeMap] || type;
      },
    },
    {
      title: '委托价格',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => price?.toLocaleString() || '--',
    },
    {
      title: '委托数量',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => size?.toFixed(3) || '--',
    },
    {
      title: '完成度',
      key: 'completion',
      render: (record: Order) => {
        const completion = record.filled / record.size * 100;
        return `${completion?.toFixed(1) || '0.0'}%`;
      },
    },
    {
      title: '时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (time: number) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (record: Order) => {
        const isCancelling = cancellingOrderIds.has(record.id);
        const canCancel = record.status === 'NEW' || record.status === 'PARTIALLY_FILLED';
        
        return canCancel ? (
          <Button 
            size="small" 
            type="link" 
            danger
            loading={isCancelling}
            onClick={() => handleCancelOrder(record)}
            disabled={isCancelling}
          >
            {isCancelling ? '取消中...' : '取消'}
          </Button>
        ) : (
          <span style={{ color: '#999' }}>不可取消</span>
        );
      },
    },
  ];

  // 成交记录表格列
  const tradeColumns = [
    {
      title: '合约',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: '方向',
      dataIndex: 'side',
      key: 'side',
      render: (side: string) => (
        <span className={`${styles.direction} ${side === 'BUY' ? styles.long : styles.short}`}>
          {side === 'BUY' ? '买入' : '卖出'}
        </span>
      ),
    },
    {
      title: '成交价',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => price?.toLocaleString() || '--',
    },
    {
      title: '委托数量',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => size?.toFixed(3) || '--',
    },
    {
      title: '手续费',
      dataIndex: 'tradeFee',
      key: 'tradeFee',
      render: (fee: number) => fee?.toFixed(6) || '--',
    },
    {
      title: '时间',
      dataIndex: 'ctime',
      key: 'ctime',
      render: (time: number) => new Date(time).toLocaleString(),
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'position':
        return (
          <Table<Position>
            columns={positionColumns}
            dataSource={filterDataBySymbol(positions)}
            rowKey="id"
            pagination={false}
            loading={loading}
            className={styles.orderTable}
            locale={{ emptyText: '暂无数据' }}
          />
        );
      case 'openOrders':
      case 'conditionalOrders':
      case 'orderHistory':
        return (
          <Table<Order>
            columns={orderColumns}
            dataSource={filterDataBySymbol(
              activeTab === 'openOrders' ? openOrders :
              activeTab === 'conditionalOrders' ? conditionalOrders :
              orderHistory
            )}
            rowKey="id"
            pagination={false}
            loading={loading}
            className={styles.orderTable}
            locale={{ emptyText: '暂无数据' }}
          />
        );
      case 'tradeHistory':
        return (
          <Table<Trade>
            columns={tradeColumns}
            dataSource={filterDataBySymbol(tradeHistory)}
            rowKey="id"
            pagination={false}
            loading={loading}
            className={styles.orderTable}
            locale={{ emptyText: '暂无数据' }}
          />
        );
      default:
        return null;
    }
  };

  const tabItems = [
    {
      key: 'position',
      label: `持仓(${filterDataBySymbol(positions).length})`,
    },
    {
      key: 'openOrders',
      label: `普通委托(${filterDataBySymbol(openOrders).length})`,
    },
    {
      key: 'conditionalOrders',
      label: `条件委托(${filterDataBySymbol(conditionalOrders).length})`,
    },
    {
      key: 'orderHistory',
      label: `历史委托(${filterDataBySymbol(orderHistory).length})`,
    },
    {
      key: 'tradeHistory',
      label: `成交历史(${filterDataBySymbol(tradeHistory).length})`,
    },
  ];

  const tabChange = (key: string) => {
    setActiveTab(key);
    if (key === 'orderHistory') {
      getHistoryOrder();
    }
  };
  return (
    <div className={styles.orderList}>
      <Tabs
        activeKey={activeTab}
        onChange={tabChange}
        className={styles.orderTabs}
        tabBarExtraContent={
          <div className={styles.tabExtra}>
            <Switch
              size="small"
              checked={onlyCurrentSymbol}
              onChange={setOnlyCurrentSymbol}
            />
            <span className={styles.switchLabel}>仅当前合约</span>
          </div>
        }
        items={tabItems}
      />
      <div className={styles.tableContent}>
        {renderContent()}
      </div>
    </div>
  );
};

export default OrderList;
