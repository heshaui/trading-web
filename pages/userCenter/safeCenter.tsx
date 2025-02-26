import React from 'react';
import UserCenterLayout from '@/components/UserCenterLayout/Layout';
import { withUserCenterLayout } from '@/components/UserCenterLayout/UserCenterLayout';


const OverviewPage: React.FC = () => {
    return (
        // <UserCenterLayout>
            <div>
                <h1>安全中心概览</h1>
            </div>
        // </UserCenterLayout>
    );
};

export default withUserCenterLayout(OverviewPage);