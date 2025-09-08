import React from 'react';
import { useMarketInfo } from '@/hooks/useMarketInfo';

/**
 * 示例组件：展示如何在其他组件中使用市场信息
 */
const MarketInfoExample: React.FC = () => {
  const { 
    marketInfo, 
    isLoading, 
    markPrice, 
    indexPrice, 
    fundingRate, 
    volume24h,
    loadMarketInfo 
  } = useMarketInfo();

  // 手动刷新市场信息
  const handleRefresh = () => {
    // 假设合约ID为1，实际使用时应该从store中获取当前合约ID
    const currentContractId = 1; 
    loadMarketInfo(currentContractId);
  };

  if (isLoading) {
    return <div>Loading market info...</div>;
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', margin: '10px' }}>
      <h3>市场信息示例组件</h3>
      <button onClick={handleRefresh} style={{ marginBottom: '10px' }}>
        刷新市场信息
      </button>
      
      <div>
        <p><strong>标记价格:</strong> {markPrice || '--'}</p>
        <p><strong>指数价格:</strong> {indexPrice || '--'}</p>
        <p><strong>资金费率:</strong> {fundingRate || '--'}</p>
        <p><strong>24小时成交量:</strong> {volume24h || '--'}</p>
      </div>
      
      <details style={{ marginTop: '10px' }}>
        <summary>完整市场信息数据</summary>
        <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '12px' }}>
          {JSON.stringify(marketInfo, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default MarketInfoExample;