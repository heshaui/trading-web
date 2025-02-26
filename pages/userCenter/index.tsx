// pages/userCenter/pages/index.tsx
import React from 'react';
// import { useRouter } from 'next/router';
import UserCenterLayout from '@/components/UserCenterLayout/Layout';
import { withUserCenterLayout } from '@/components/UserCenterLayout/UserCenterLayout';
import OverviewPage from './pages/overview';
// import SafeCenterPage from './safeCenter';
// import IdentityPage from './identity';
// import UserSettingsPage from './userSettings';

const UserCenterMainPage = () => {
  // const router = useRouter();
  // const { pathname } = router;

  // let content;
  // switch (pathname) {
  //   case '/userCenter':
  //     content = <OverviewPage />;
  //     break;
  //   case '/userCenter/safeCenter':
  //     content = <SafeCenterPage />;
  //     break;
  //   case '/userCenter/identity':
  //     content = <IdentityPage />;
  //     break;
  //   case '/userCenter/userSettings':
  //     content = <UserSettingsPage />;
  //     break;

  //   default:
  //     content = <OverviewPage />;
  // }

  return (<>
    {/* <UserCenterLayout> */}
      <OverviewPage />
    {/* </UserCenterLayout> */}
    </>
  );
};

export default withUserCenterLayout(UserCenterMainPage);