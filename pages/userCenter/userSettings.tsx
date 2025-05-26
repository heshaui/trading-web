import React from 'react';
import { withUserCenterLayout } from '@/components/sidebarLayout/UserCenterLayout/useUserCenterLayout';
import styles from './styles/userSettings.module.css';
import { Iconify } from "@/components/icon"
import Image from 'next/image';
import { getLoginUserInfo, getUserCenter, updateUserCenter } from '@/services/userCenter';
import { useEffect, useState } from "react";
import { toast } from "sonner";
import NeckNameModal from '@/components/userCenterModal/nickname_Modal';
import AvatarUrlModal from "@/components/userCenterModal/avatarUrl_Modal";
import BirthdayModal from "@/components/userCenterModal/birthday_Modal";
import dayjs from 'dayjs';
import { Skeleton } from 'antd'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { LOCAL_STORAGE_KEY } from "@/config/apiConfig";
import appStore from '@/store';
import { useRouter } from 'next/router';
import { ROUTER_KEY_ASSETS } from '@/config/apiConfig';

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
interface UserCenterData {
  userId: number,
  nickname: string,
  avatarUrl: string,
  birthday: string,
  isNicknameUpdate:boolean,
  nicknameUpdateTime: number,
}

const UserSettingsPage: React.FC = () => {
  const { t } = useTranslation('userCenter');
  const [loadingSkeleton, setLoadingSkeleton] = useState(true)
  const langKey = appStore.getLang();
   const router = useRouter();
  const userInfoList: SafeListItem[] = [
    {
      title: t('account.nickname'),
      type: "nickname",
      desc: t('account.nicknameDesc'),
      isBind: true,
      bindValue: "",
      icon: "/images/userCenter/userSettings/icon_nickname.svg",
      bindBtn: [{
        title: t('account.modify'),
        onok: () => setNecknameOpen(true)
      }
      ]
    },
    {
      title: t('account.avatar'),
      type: "avatarUrl",
      desc: t('account.avatarDesc'),
      isBind: false,
      bindValue: "/images/userCenter/userSettings/icon_user.svg",
      icon: "/images/userCenter/userSettings/icon_avatar.svg",
      bindBtn: [{
        title: t('account.modify'),
        onok: () => setAvatarUrlOpen(true)
      },
      ],
    },
    {
      title: t('account.birthday'),
      type: "birthday",
      desc: t('account.birthdayDesc'),
      isBind: true,
      bindValue: "",
      icon: "/images/userCenter/userSettings/icon_brithday.svg",
      noBindBtn: [{
        title: t('account.add'),
        onok: () => setBirthdayOpen(true)
      }
      ]
    },
  ]
  const withdrawList: SafeListItem[] = [
    {
      title: t('account.address'),
      type: "address",
      desc: t('account.addressDesc'),
      isBind: true,
      bindValue: "",
      icon: "/images/userCenter/userSettings/icon_location.svg",
      bindBtn: [{
        title: t('account.manage'),
        onok: () => {
          
          router.push(ROUTER_KEY_ASSETS.ADDADRESS)
        }
      }
      ]
    },
  ]
  const [userCenterData, setUserCenterData] = useState<SafeListItem[]>(userInfoList);
  const [userInfo, setUserInfo] = useState({
    userId: 0,
    nickname: "",
    avatarUrl: "",
    birthday: "",
  });
  const [necknameOpen, setNecknameOpen] = useState(false);
  const [avatarUrlOpen, setAvatarUrlOpen] = useState(false);
  const [birthdayOpen, setBirthdayOpen] = useState(false);
  // const [withdrawData, setWithdrawData] = useState<SafeListItem[]>(withdrawList);
  const getUserCenterData = async () => {
    try {
      const res = await getUserCenter();
      const { code, data } = res;
      if (code === '0') {
        setLoadingSkeleton(false)
        setUserInfo(data);
        const localUserInfo = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY.USER_INFO) || '{}')
        localStorage.setItem(LOCAL_STORAGE_KEY.USER_INFO, JSON.stringify(Object.assign({}, localUserInfo, data)))
        // 遍历 userInfoList
        const updatedUserInfoList = userInfoList.map(item => {
          if (data.hasOwnProperty(item.type)) {
            if (item.type === 'birthday') {
              const value = data[item.type];
              return {
                ...item,
                bindValue: value ? dayjs(value).format('YYYY/MM/DD') : '',
                isBind: Boolean(value),
              };
            }
            const value = data[item.type];
            return {
              ...item,
              bindValue: value,
              isBind: Boolean(value),
            };
          }
          return item;
        });

        setUserCenterData(updatedUserInfoList);

      }
    } catch (error) {
      toast.error(String(error));
    }
  };
  const handOk = async (bool: boolean) => {

    // if (bool) {
    await getUserCenterData();
    // }
  }

  useEffect(() => {
    getUserCenterData();
  }, [langKey])
  return (<div className={`${styles.safe_page}`} >
    <div style={{width:'100%'}}>
      <h2 className={`font-w-500 font-20`}>
        {/* 个人中心 */}
        {t('account.userCenter')}
        </h2>
    </div>
    {/* userInfo box*/}
    <div className={`${styles.card_bgc} ${styles.user_info_box} mt-6 `}>
      {/* {loadingSkeleton ? <div className={`px-6 `}>
        {userCenterData.map((item: SafeListItem) => (
          <Skeleton active key={item.type} />
        ))}
      </div> : */}
        <ul className={`${styles.content_ul}`} >
          {userCenterData.map((item: SafeListItem) => (
        <Skeleton active title={false} loading={loadingSkeleton} key={item.type} className='px-6 py-6'>

            <li className={`flex-row align-center justify-between px-4`} key={item.type}>
              {/* 绑定类型 bind type*/}
              <div className={`flex-row align-center`}>
                <Image src={item.icon}
                  alt="safe_device" width={28} height={28}
                  className={`${styles.svgIcon}`}
                />
                <p className='flex-y font-16 font-w-500'>
                  {item.title}
                  <span className={`${styles.tip_color} font-12 font-w-400 mt-1`}>
                    {item.desc}
                  </span>
                </p>

              </div>
              {/* 绑定状态 bind status*/}
              <div className={`flex-row align-center justify-between ${styles.log_box}`}>

                <div className='flex-y font-16 font-w-500'>

                  <div className={`flex-row align-center`}>
                    {/* <Image src="/images/userCenter/safe/check.svg"
                    alt="safe_device" width={20} height={20}
                    className={`${styles.svgIcon}`}
                  /> */}
                    {item.type === "avatarUrl" ?
                      item.isBind ?
                        <Image src={item.bindValue} className={styles.avatar_icon} alt="avatar" width={20} height={20} />
                        :
                        <Iconify icon="teenyicons:user-circle-outline" className={styles.avatar_icon} />
                      // <Image src="/images/userCenter/userSettings/icon_user.svg" alt="avatar"
                      //   className={styles.avatar_icon}  width={20} height={20} />
                      :
                      <span>{item.bindValue || '-'}</span>
                    }

                  </div>


                </div>
                {/* 按钮 button */}
                <div className={`flex-row align-center justify-end flex-1`}>

                  {item.bindBtn?.map((btn: ButtonConfig, index: number) => (
                    <button className={`${styles.btn_style} btn-color-default ml-2`} key={index} onClick={btn.onok}>{btn.title}</button>
                  ))}
                  {item.type === "birthday" && !item.isBind && item.noBindBtn?.map((btn: ButtonConfig, index: number) => (
                    <button className={`${styles.btn_style} btn-color-default ml-2`} key={index} onClick={btn.onok}>{btn.title}</button>
                  ))}

                </div>
              </div>

            </li>
            </Skeleton>

          ))}
        </ul>
      {/* } */}

    </div>
    {/* withdraw box*/}
    <div className={` mt-6 `}>
      <div className={`flex-row justify-between font-18 font-w-500 pl-6`} >
        {/* 提现 */}
        {t('account.withdraw')}
      </div>
      <ul className={`${styles.content_ul} ${styles.card_bgc} mt-6`} >
        {withdrawList.map((item: SafeListItem) => (
           <Skeleton active title={false} loading={loadingSkeleton} key={item.type} className='px-6 py-6'>
          <li className={`flex-row align-center justify-between px-4`} key={item.type}>
            <div className={`flex-row align-center`}>
              <Image src={item.icon}
                alt="safe_device" width={28} height={28}
                className={`${styles.svgIcon}`}
              />
              <p className='flex-y font-16 font-w-500'>
                {item.title}
                <span className={`${styles.tip_color} font-12 font-w-400 mt-1`}>
                  {item.desc}
                </span>
              </p>

            </div>
            <div className={`flex-row align-center justify-between ${styles.log_box}`}>

              {/* <div className='flex-y font-16 font-w-500'>

                <div className={`flex-row align-center`}>
                  {item.type === "avatarUrl" ?
                    item.isBind ?
                      <Image src="/images/userCenter/userSettings/icon_avatar.svg" alt="avatar" width={20} height={20} />
                      :
                      <Image src="/images/userCenter/userSettings/icon_avatar.svg" alt="avatar" width={20} height={20} />
                    :
                    <span>{item.bindValue}</span>
                  }

                </div>


              </div> */}
              <div className={`flex-row align-center justify-end flex-1`}>

                {item.bindBtn?.map((btn: ButtonConfig, index: number) => (
                  <button className={`${styles.btn_style} btn-color-default ml-2`} key={index}
                    onClick={btn.onok}
                  >{btn.title}</button>
                ))}


              </div>
            </div>

            </li>
            </Skeleton>
        ))}
      </ul>

    </div>
    {/* 修改昵称 */}
    <NeckNameModal
      open={necknameOpen}
      onCancel={() => setNecknameOpen(false)}
      nicknameInfo={userInfo}
      onOk={handOk} />

    {/* 修改头像 */}
    <AvatarUrlModal open={avatarUrlOpen}
      onCancel={() => setAvatarUrlOpen(false)}
      userId={userInfo.userId}
      onOk={handOk} />

    {/* 修改生日 */}
    <BirthdayModal open={birthdayOpen} userId={userInfo.userId}
      onCancel={() => setBirthdayOpen(false)}
      onOk={handOk}
    />

  </div>);
};
export const getStaticProps: GetStaticProps = async ({ locale }) => {
	return {
		props: {
			...(await serverSideTranslations(locale || 'en', ['userCenter','common'])),
		},
	};
};
export default withUserCenterLayout(UserSettingsPage);