import React from 'react';
import { Table, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { HotMarketSymbol } from '@/type/marketData/marketData';
import styles from '../styles/marketData.module.css';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';

interface AllCoinsProps {
  data: HotMarketSymbol[];
}

const AllCoins: React.FC<AllCoinsProps> = ({ data }) => {
  const { t } = useTranslation('market');
  
//   const columns: ColumnsType<HotMarketSymbol> = [
//     {
//       title: t('marketList.tableHeaders.name'),
//       dataIndex: 'symbol',
//       key: 'symbol',
//       onHeaderCell: () => ({
//         style: { paddingLeft: '20px' },
//       }),
//       onCell: () => ({
//         style: { paddingLeft: '20px' },
//       }),
//       render: (text, record) => (
//         <div className={styles.coinInfo}>
//           <span className={styles.coinIcon}>
//             {record.icon ? (
//               <Image src={record.icon} alt={record.symbol} width={24} height={24} />
//             ) : (
//               <div className={styles.placeholderIcon}>{record.symbol.charAt(0)}</div>
//             )}
//           </span>
//           <div className={styles.coinDetails}>
//             <div className={styles.coinSymbol}>{record.symbol}</div>
//             <div className={styles.coinName}>{record.name}</div>
//           </div>
//         </div>
//       ),
//     },
//     {
//       title: t('marketList.tableHeaders.price'),
//       dataIndex: 'price',
//       key: 'price',
//       render: (_, record) => (
//         <span>${record.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
//       ),
//     },
//     {
//       title: t('marketList.tableHeaders.change24h'),
//       dataIndex: 'change24h',
//       key: 'change24h',
//       render: (_, record) => (
//         <span className={record.change24h >= 0 ? styles.positive : styles.negative}>
//           {record.change24h >= 0 ? '+' : ''}{record.change24h?.toFixed(2)}%
//         </span>
//       ),
//     },
//     {
//       title: t('marketList.tableHeaders.marketCap'),
//       dataIndex: 'marketCap',
//       key: 'marketCap',
//       render: (_, record) => (
//         <span>${record.marketCap?.toLocaleString()}</span>
//       ),
//     },
//     {
//       title: t('marketList.tableHeaders.action'),
//       dataIndex: 'action',
//       key: 'action',
//       render: (_, record) => (
//         record.tradable !== false ? (
//           <Button type="primary" size="small" className={styles.tradeButton}>
//             {t('rankingList.trade')}
//           </Button>
//         ) : (
//           <span>—</span>
//         )
//       ),
//     },
//   ];

  return (
    <div className={styles.allCoinsWrapper}>
        1231321231
      {/* <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={false}
        size="middle"
        bordered={false}
        className={styles.allCoinsTable}
      /> */}
    </div>
  );
};

export default AllCoins;