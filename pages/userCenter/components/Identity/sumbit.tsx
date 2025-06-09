
import { Form, ConfigProvider, Upload, Skeleton } from 'antd';
// import store from "@/store";
import { useRouter } from 'next/router';
import styles from "../../styles/identityAuth.module.css"
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import appStore from '@/store';
import { getUserIdentityInfo } from '@/services/identity';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ROUTER_KEY_USERCENTER } from '@/config/apiConfig';

interface IDVProps {
  onNext: () => void;
  onPrev: () => void;
}
// const [userIdentityInfo, setUserIdentityInfo] = useState<any>({} as any);

function SumbitPage() {
  const router = useRouter();
  const { t } = useTranslation(['userCenter']);
  const [loading, setLoading] = useState(true);
  // const [form] = Form.useForm();
  // const onSubmit = () => {
  //     form
  //         .validateFields()
  //         .then(async (values) => {
  //             console.log(values);
  //         })
  //         .catch((info) => {
  //             console.log("Validate Failed:", info);
  //         });
  // }
  const onNext = () => {
    router.push(ROUTER_KEY_USERCENTER.USERCENTER)
  }
  const getUserIdentityInfoData = async () => {
    const userInfo = appStore.getUserInfo()
    try {
      const res = await getUserIdentityInfo({
        userId: userInfo.userId || ''
      });
      if (res.code === '0') {
        // setUserIdentityInfo(res.data);
        if (res.data.authStatus !== 3) {
          router.push(ROUTER_KEY_USERCENTER.IDENTITY)
        }
      }
    } catch (error) {
      toast.error(String(error));
    }
  }
  useEffect(() => {
    getUserIdentityInfoData()
  }, [])
  return (
    <div className="flex-col" style={{ width: "100%" }}>
      <div className='mt-10 flex-y-cc text-center'>
        {/* <Skeleton.Node active={true} style={{ width: 160 }} block={loading} />
        <Skeleton className='mt-4' loading={loading} active={true}> */}
          <Image src="/images/userCenter/identity/icon_checking.png" alt='' width={120} height={120} className='mr-2' />
          <p className={`${styles.tip_title}  font-20 font-w-500`}>
            {/* 审核中 */}
            {t('identity.sumbit.title')}
          </p>
          <p className={`${styles.tip_color} font-14 font-w-400 mt-4`}>
            {/* 我们正在审核您的申请。通过审核之后，我们会发送邮件通知您。 等候期间，欢迎浏览我们的网页/App */}
            {t('identity.sumbit.content')}
          </p>

          <div className='mt-10 flex justify-between' style={{ width: '60%' }}>
            <button type='submit' className={`default_btn ${styles.btn_style}`} onClick={onNext}>
              {/* 下一步 */}
              {t('identity.sumbit.goHome')}
            </button>
          </div>
        {/* </Skeleton> */}
      </div>
    </div>
  );
}

export default SumbitPage;
