// pages/userCenter/pages/index.tsx
import React from 'react';
// import { useRouter } from 'next/router';
// import UserCenterLayout from '@/components/UserCenterLayout/Layout';
import  {withAssetsLayout}  from '@/components/sidebarLayout/AssetsLayout/assetsLayout';
import styles from '../styles/spotAccount.module.css'


const FutureAccountPage = () => {


  return (<div>
    <div >
     <h2 className={`font-w-500 font-20`}>合约账户</h2>
   </div>
   <div className={`${styles.card_bgc} ${styles.pt0} mt-3 flex-row justify-between `}>
       
   </div>
   </div>
  );
};

export default withAssetsLayout(FutureAccountPage);