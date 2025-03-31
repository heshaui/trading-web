// pages/userCenter/pages/index.tsx
import React from 'react';
// import { useRouter } from 'next/router';
// import UserCenterLayout from '@/components/UserCenterLayout/Layout';
// import { withUserCenterLayout } from '@/components/sidebarLayout/UserCenterLayout';
import { withUserCenterLayout } from '@/components/sidebarLayout/UserCenterLayout/useUserCenterLayout';
import OverviewPage from './components/overview';
// import SafeCenterPage from './safeCenter';
// import IdentityPage from './identity';
// import UserSettingsPage from './userSettings';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
const UserCenterMainPage = () => {


  return (<>
      <OverviewPage />
    </>
  );
};
export const getStaticProps: GetStaticProps = async ({ locale }) => {
	return {
		props: {
			...(await serverSideTranslations(locale || 'en', ['userCenter','common'])),
		},
	};
};
export default withUserCenterLayout(UserCenterMainPage);