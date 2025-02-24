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
  // const { t } = useTranslation(['common', 'home-menu']);

  return (
    <div>
      {/* <HomeMenu t={t} /> */}
      {/* <LanguageSwitcher />
      <div>{t('home')}</div> */}
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
  export const getServerSideProps: GetServerSideProps = async ({
  locale,
}) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', [
      'common',
      'home_menu',
      'home',
      'login'
    ])),
  },
})