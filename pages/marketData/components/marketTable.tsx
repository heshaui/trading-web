// components/CryptoTable.tsx
import React from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CryptoItem } from '@/type/marketData/marketData';
import styles from '../styles/marketData.module.css';
import { useTranslation } from 'next-i18next';

interface CryptoTableProps {
  data: CryptoItem[];
}

const CryptoTable: React.FC<CryptoTableProps> = ({ data }) => {
    const { t } = useTranslation('market');
  const columns: ColumnsType<CryptoItem> = [
    {
      title: t('rankingList.tradingPair'),
      dataIndex: 'pair',
      key: 'pair',
      onHeaderCell: () => ({
        style: { paddingLeft: '20px' },
      }),
      onCell: () => ({
        style: { paddingLeft: '20px' },
      }),
      render: (text, record) => (
        <>
          {record.id}&nbsp;&nbsp;{record.pair}
        </>
      ),
    },
    {
      title: t('rankingList.latestPrice'),
      dataIndex: 'price',
      key: 'price',
      render: (_, record) => record.price.toLocaleString(),
    },
    {
      title: t('rankingList.change24h'),
      dataIndex: 'change24h',
      key: 'change24h',
      align:'right',
      render: (_, record) => (
        <span className={record.change24h >= 0 ? styles.positive : styles.negative}>
          {record.change24h >= 0 ? '+' : ''}
          {record.change24h.toFixed(2)}%
        </span>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={false}
      size="small"
      bordered={false}
      className={styles.table}
    />
  );
};

export default CryptoTable;