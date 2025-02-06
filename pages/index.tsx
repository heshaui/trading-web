// import { useTranslation } from 'next-i18next';
// import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import Link from 'next/link'
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
} from 'next'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import LanguageSwitcher from '@/components/LanguageSwitcher';

import HomeMenu from '@/components/homeMenu/HomeMenu';
import Footer from '@/components/footer/Footer';
// import { GetStaticProps } from 'next';

type Props = {
  // Add custom props here
}

export default function Home() {
  const { t } = useTranslation(['common', 'home-menu']);

  return (
    <div>
      {/* <HomeMenu t={t} /> */}
      <LanguageSwitcher />
      <div>{t('title')}</div>
      <div>{t('home_menu_title_1')}</div>
      {/* <Footer /> */}
    </div>
  );
}


// 获取服务端的语言包
// export const getStaticProps: GetStaticProps = async ({ locale }) => {
//   return {
//     props: {
//       ...(await serverSideTranslations(locale ?? 'en', ['common', 'home_menu'])),
//     },
//   };
// };
export const getServerSideProps: GetServerSideProps<Props> = async ({
  locale,
}) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', [
      'common',
      'home-menu',
    ])),
  },
})