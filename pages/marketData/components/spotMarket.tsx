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

  return (
    <div className={styles.allCoinsWrapper}>
        现货市场
    </div>
  );
};

export default AllCoins;