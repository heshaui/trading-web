// import { useTranslation } from 'next-i18next';
// import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

// import Link from 'next/link'
// import Link from 'next/link'
import type {
  GetServerSideProps,
  // InferGetServerSidePropsType,
  // InferGetServerSidePropsType,
} from 'next'

// import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
// import LanguageSwitcher from '@/components/LanguageSwitcher';
// import LanguageSwitcher from '@/components/LanguageSwitcher';

import Experience from '@/components/home/experience_1/experience';
import Deal from '@/components/home/deal_2/deal';
import Try from '@/components/home/try_3/try';
import Assistant from '@/components/home/assistant_4/assistant';
import ComeUp from '@/components/home/comeUp_5/comeUp';
import Questions from '@/components/home/questions_6/questions';

// import HomeMenu from '@/components/homeMenu/HomeMenu';
// import Footer from '@/components/footer/Footer';
// import { GetStaticProps } from 'next';

// type Props = {
//   // Add custom props here
// }

export default function Home() {
  return (
    <div>
      {/* <HomeMenu t={t} /> */}
      {/* <LanguageSwitcher /> */}
      <Experience />
      <Deal />
      <Try />
      <Assistant />
      <ComeUp />
      <Questions />
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
// export const getServerSideProps: GetServerSideProps<Props> = async ({
// export const getServerSideProps: GetServerSideProps = async ({
//   locale,
// }) => ({
//   props: {
//     ...(await serverSideTranslations(locale ?? 'en', [
//       'common',
//       'home_menu',
//       'home',
//       'login'
//     ])),
//   },
// })

// export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
//   console.log('Server locale:', locale); // 添加调试日志

//   const translations = await serverSideTranslations(locale ?? 'en', [
//     'common',
//     'home_menu',
//     'home',
//     'login'
//   ]);

//   return {
//     props: {
//       ...translations,
//     },
//   };
// };


export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  // 添加调试日志
  console.log('Server-side props - locale:', locale);
  
  try {
    const translations = await serverSideTranslations(locale ?? 'en', [
      'common',
      'home_menu',
      'home',
      'login',
      'userCenter',
      'resetPassword',
      'assets',
      'invite',
      'spot',
      'builetinCenter',
      'helpCenter',
      'notice'
    ]);
    
    console.log('Server-side props - translations loaded successfully');
    
    return {
      props: {
        ...translations,
      },
    };
  } catch (error) {
    console.error('Error loading translations:', error);
    return { props: {} };
  }
};