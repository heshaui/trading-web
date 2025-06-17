import React, { useEffect, useState } from 'react';
import { Table, Button,Image } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CoinMarket } from '@/type/marketData/marketData';
import styles from '../styles/marketData.module.css';
import { useTranslation } from 'next-i18next';
import {getAllCoinsData} from '@/services/marketData'
// 添加props接口定义
interface AllCoinsProps {
  searchKeyword?: string;
}
const AllCoins: React.FC<AllCoinsProps> = ({ searchKeyword = '' }) => {
  const { t } = useTranslation('market');
  const [allCoins,setAllcoins]=useState<CoinMarket[]>([])
  const [filteredCoins, setFilteredCoins] = useState<CoinMarket[]>([]);
  // 获取所有币种接口
  const fetchAllcoins=async () => {
    try{
      const response=await getAllCoinsData()
      if(response?.code==='0'){
        setAllcoins(response.data)
        console.log('获取所有币种数据',response.data)
      }
    }catch(error){
      console.error('获取所有币种接口失败：',error)
    }
  };
  useEffect(()=>{
    fetchAllcoins()

  },[])
  useEffect(()=>{
    if (!searchKeyword.trim()) {
      setFilteredCoins(allCoins);
      return;
    }
    
    const keyword = searchKeyword.toLowerCase();
    const filtered = allCoins.filter(coin => {
      return (
        // 模糊匹配币种名称
        (coin.coinName && coin.coinName.toLowerCase().includes(keyword)) ||
        // 模糊匹配币种符号
        (coin.nameDefault && coin.nameDefault.toLowerCase().includes(keyword))
      );
    });
    
    setFilteredCoins(filtered);
  },[searchKeyword, allCoins])

  
  const columns: ColumnsType<CoinMarket> = [
    {
      title: t('marketList.tableHeaders.name'),
      dataIndex: 'symbol',
      key: 'symbol',
      onHeaderCell: () => ({
        style: { paddingLeft: '20px' },
      }),
      onCell: () => ({
        style: { paddingLeft: '20px'},
      }),
      render: (text, record) => (
        <div className={styles.coinInfo}>
          <div className={styles.coinDetails}>
            
            <div className={styles.coinName}>
              <Image
              src={record.iconUrl}
              alt={record.coinName || ''}
              width={24}
              height={24}
              className={styles.coinIcon}
            />&nbsp;
            <span style={{fontSize:'14px'}}>{record.coinName}</span>&nbsp;
             <span style={{fontSize:'14px'}}>{record.nameDefault}</span></div>
          </div>
        </div>
      ),
    },
    {
      title: t('marketList.tableHeaders.price'),
      // dataIndex: 'price',
      // key: 'price',
      // render: (_, record) => (
      //   <span>${record.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      // ),
    },
    {
      title: t('marketList.tableHeaders.change24h'),
      // dataIndex: 'change24h',
      // key: 'change24h',
      // render: (_, record) => (
      //   <span className={record.change24h >= 0 ? styles.positive : styles.negative}>
      //     {record.change24h >= 0 ? '+' : ''}{record.change24h?.toFixed(2)}%
      //   </span>
      // ),
    },
    {
      title: t('marketList.tableHeaders.marketCap'),
      // dataIndex: 'marketCap',
      // key: 'marketCap',
      // render: (_, record) => (
      //   <span>${record.marketCap?.toLocaleString()}</span>
      // ),
    },
    {
      title: t('marketList.tableHeaders.action'),
      // dataIndex: 'action',
      // key: 'action',
      // render: (_, record) => (
      //   record.tradable !== false ? (
      //     <Button type="primary" size="small" className={styles.tradeButton}>
      //       {t('rankingList.trade')}
      //     </Button>
      //   ) : (
      //     <span>—</span>
      //   )
      // ),
    },
  ];

  return (
    <div className={styles.allCoinsWrapper}>
        {/* 1231321231 */}
      <Table
        columns={columns}
        dataSource={filteredCoins}
        rowKey="id"
        pagination={false}
        size="middle"
        bordered={false}
        className={styles.allCoinsTable}
      />
    </div>
  );
};

export default AllCoins;