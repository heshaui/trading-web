// pages/userCenter/pages/index.tsx
import React from 'react';
// import { useRouter } from 'next/router';
// import UserCenterLayout from '@/components/UserCenterLayout/Layout';
import { withUserCenterLayout } from '@/components/UserCenterLayout/UserCenterLayout';
import OverviewPage from './components/overview';
// import SafeCenterPage from './safeCenter';
// import IdentityPage from './identity';
// import UserSettingsPage from './userSettings';

const UserCenterMainPage = () => {


  return (<>
      <OverviewPage />
    </>
  );
};

export default withUserCenterLayout(UserCenterMainPage);