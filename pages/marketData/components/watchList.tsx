import React from 'react';
import { Table, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { HotMarketSymbol } from '@/type/marketData/marketData';
import styles from '../styles/marketData.module.css';
import { useTranslation } from 'next-i18next';
import { observer } from 'mobx-react-lite';
import appStore from '@/store';
import Image from 'next/image';

interface WatchListProps {
  data: HotMarketSymbol[];
}

const WatchList: React.FC<WatchListProps> = ({ data }) => {
  const { t } = useTranslation('market');
    // const isLoggedIn = appStore.isLogged;

  return (
    <div className={styles.allCoinsWrapper}>
        自选
    </div>
  );
};

export default WatchList;

// import React from 'react';
// import { HotMarketSymbol } from '@/type/marketData/marketData';
// import { useTranslation } from 'next-i18next';
// import { observer } from 'mobx-react-lite';
// import appStore from '@/store';


// interface WatchListProps {
//   data: HotMarketSymbol[];
// }

// const WatchList: React.FC<WatchListProps> = observer(({ data }) => {
//   const { t } = useTranslation('market');
  
//   // 从 appStore 获取用户登录状态
//   console.log('appStore:用户的登录状态：！！！',appStore)
// //   const isLoggedIn = appStore.isLogged;
// const isLoggedIn = true;
  
//   // 已登录用户的收藏列表展示
//   const renderLoggedInContent = () => {
//     const favoriteData = data.slice(0, 3); // 仅作为示例
//     return (
//       <div>
//         表格数据
//       </div>
//     );
//   };

//   // 未登录用户的提示内容
//   const renderNotLoggedInContent = () => {
//     return (
//       <div>
//         未登录数据
//       </div>
//     );
//   };

//   return (
//     <div>
//       {isLoggedIn ? renderLoggedInContent() : renderNotLoggedInContent()}
//     </div>
//   );
// });

// export default WatchList;