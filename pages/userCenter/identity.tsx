import UserCenterLayout from '@/components/UserCenterLayout/Layout';
import { withUserCenterLayout } from '@/components/UserCenterLayout/UserCenterLayout';

const identityPage=() =>{
    return <div>
      <div className="container">identity  Page</div>
    </div>
     
  }
  export default withUserCenterLayout(identityPage)