// pages/userCenter/pages/index.tsx
import React from 'react';
// import { useRouter } from 'next/router';
// import UserCenterLayout from '@/components/UserCenterLayout/Layout';
import  {withAssetsLayout}  from '@/components/sidebarLayout/AssetsLayout/userAssetsLayout';
import styles from '../../styles/spotAccount.module.css'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';

const FutureAccountPage = () => {
  const { t } = useTranslation('assets');

  return (<div>
    <div >
     <h2 className={`font-w-500 font-20`}>
      {/* 合约账户 */}
      {t('futureAccount.title')}
      </h2>
   </div>
   <div className={`${styles.card_bgc} ${styles.pt0} mt-3 flex-row justify-between `}>
       
   </div>
   </div>
  );
};
// export const getStaticProps: GetStaticProps = async ({ locale }) => {
// 	return {
// 		props: {
// 			...(await serverSideTranslations(locale || 'en', ['assets','common'])),
// 		},
// 	};
// };
export default withAssetsLayout(FutureAccountPage);