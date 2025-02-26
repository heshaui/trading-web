import UserCenterLayout from '@/components/UserCenterLayout/Layout';
import { withUserCenterLayout } from '@/components/UserCenterLayout/UserCenterLayout';


const userSettingsPage=() =>{
  return <div>
    <div className="container">userSettings  Page</div>
  </div>

}
export default withUserCenterLayout(userSettingsPage)