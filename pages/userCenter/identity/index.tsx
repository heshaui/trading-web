import React from 'react';
import { withUserCenterLayout } from '@/components/sidebarLayout/UserCenterLayout/useUserCenterLayout';
import styles from '../styles/identity.module.css';
// import { Iconify } from "@/components/icon"
// import Image from 'next/image';
import NoAuthentication from '../components/Authentication/noAuthentication';
import Certified from '../components/Authentication/Certified';
import { Collapse, theme, ConfigProvider } from 'antd';
import type { CollapseProps } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import type { CSSProperties } from 'react';
import { getUserIdentityInfo, getLevelBenefitDetail } from '@/services/identity';
import store from "@/store"
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import {LOCAL_STORAGE_KEY} from "@/config/apiConfig"
// import { useTranslation } from 'next-i18next';
// 按钮配置接口
interface ButtonConfig {
  title: string;
  onok?: () => void;
  onbind?: () => void;
}

// 安全项配置接口
interface SafeListItem {
  title: string;
  type: string;
  desc: string;
  isBind?: boolean;
  bindValue: string;
  bindBtn?: ButtonConfig[];
  noBindBtn?: ButtonConfig[];
  icon: string;  // 可选的图标路径
}

const IdentityPage: React.FC = () => {
  const { token } = theme.useToken();
  const { t } = useTranslation(['userCenter']);
  const [userIdentityInfo, setUserIdentityInfo] = useState<any>({
    authStatus: 2,
  });
  const [levelBenefitData, setLevelBenefitData] = useState([]);
  const panelStyle: React.CSSProperties = {
    marginBottom: 24,
    // background: 'var(--background)',
    borderRadius: token.borderRadiusLG,
    color: 'var( --cancel-color)',
    border: 'none',
  };
  const getItems: (panelStyle: CSSProperties) => CollapseProps['items'] = (panelStyle) => [
    {
      key: '1',
      label: t('identity.title1'), // 什么是KYC验证？
      children: <p className={`${styles.tip_color}`}>{t('identity.content1')}</p>, // KYC (Know Your Customer)是一种身份验证和调查过程，旨在核实客户的身份信息和背景，以确保金融机构或服务提供商遵守反洗(AML) 和反恐怖融资(CFT) 法规。它有助于保证账户安全，减少欺诈和非法活勤的风险。
      style: panelStyle,
    },
    {
      key: '2',
      label: t('identity.title2'), // 为什么我需要进行KYC 验证？
      children: <p className={`${styles.tip_color}`}>{t('identity.content2')}</p>, // KYC 是了保您的赈户安全和权益。保障您的身份信息和背景，防止他人冒用您的身份谁行欺菲或非法活勤。
      style: panelStyle,
    },
    {
      key: '3',
      label: t('identity.title3'), // 身份验证遇到问题，如何获取帮助？
      children: <p className={`${styles.tip_color}`}>{t('identity.content3')}</p>, // 如果您在 KYC 程中遇到任何问题，请向我们的客服寻求帮助。我们的客服团队将竭诚为您提供支持和解答。请提供具体问题和相关信息，以便我们能够更快速地帮助您完成认证。
      style: panelStyle,
    },
  ];
  const getUserIdentityInfoData = async () => {
    const userInfo = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY.USER_INFO) || '{}');
    try {
      const res = await getUserIdentityInfo({
        userId: userInfo.userId || ''
      });
      if (res.code === '0') {
        setUserIdentityInfo(res.data);
        if (res.data.authStatus === 1) {
          getLevelBenefitData(userInfo.userId);
        } else {
          getLevelBenefitData(null);
        }
      }
    } catch (error) {
      toast.error(String(error));
    }
  }
  const getLevelBenefitData = async (userId: string | number | null) => {
    try {
      const res = await getLevelBenefitDetail({
        userId: userId || ''
      });
      if (res.code === '0') {
        const benefitData=transformData(res.data)
        setLevelBenefitData(benefitData);
      }
    } catch (error) {
      toast.error(String(error));
    }
  }

  const transformData = (data:any) => {
    return data.map((item:any) => {
      // 创建基础对象，包含 benefitId 和 benefitName
      const result = {
        benefitId: item.benefitId,
        benefitName: item.benefitName,
        
        // 初始化默认值
        status0: null,
        value0: null,
        params0: null,
        status1: null,
        value1: null,
        params1: null
      };
      
      // 遍历 levelBenefits 数组，根据 levelId 设置对应的属性
      item.levelBenefits.forEach((benefit:any) => {
        if (benefit.levelId === 1) {
        // 未认证
          result.status0 = benefit.status;
          result.value0 = benefit.value;
          result.params0 = benefit.params;
        } else if (benefit.levelId === 2) {
          // 已认证
          result.status1 = benefit.status;
          result.value1 = benefit.value;
          result.params1 = benefit.params;
        }
      });
      
      return result;
    });
  }

  useEffect(() => {
    getUserIdentityInfoData();
  }, []);


  return (<div className={`${styles.safe_page}`} >
    <div >
      <h2 className={`font-w-500 font-20`}>
        {/* 身份认证 */}
        {t('identity.title')}
      </h2>
    </div>
    {/* identity box*/}
    <div className={`${styles.card_bgc} ${styles.identity_box} mt-6 flex-row flex-wrap`}>
      {/* 0驳回 1已认证 2未认证 3审核中 */}
      {/* 未认证 - 驳回 - 审核中*/}
      {/* {(userIdentityInfo?.authStatus === 2||userIdentityInfo?.authStatus === 0||userIdentityInfo?.authStatus === 3) && <NoAuthentication identityInfo={userIdentityInfo}/>} */}
      {/* 已认证 */}
      {userIdentityInfo?.authStatus === 1 ? <Certified identityInfo={userIdentityInfo} levelBenefit={levelBenefitData} />
        :
        <NoAuthentication identityInfo={userIdentityInfo} levelBenefit={levelBenefitData} />}
      <div className={`${styles.identity_aside}`}>
        <p className={`flex-row justify-between font-18 font-w-500 `} >
          {/* 常见问题 */}
          {t('identity.title4')}
        </p>
        <div className='mt-6'>
          <ConfigProvider
            theme={{
              token: {
                colorTextHeading: 'var( --cancel-color)',
              },
            }}
          >
            <Collapse
              bordered={false}
              defaultActiveKey={['1']}
              expandIcon={({ isActive }) => <CaretRightOutlined style={{ color: 'var(--text-color6)' }} rotate={isActive ? 90 : -90} />}
              expandIconPosition="end"
              style={{ background: 'var(--background8)' }}
              items={getItems(panelStyle)}

            />
          </ConfigProvider>
        </div>

      </div>
    </div>


  </div>);
};
export const getStaticProps: GetStaticProps = async ({ locale }) => {
	return {
		props: {
			...(await serverSideTranslations(locale || 'en', ['userCenter','common'])),
		},
	};
};
export default withUserCenterLayout(IdentityPage);