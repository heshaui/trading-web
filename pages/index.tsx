import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import HomeMenu from '@/components/homeMenu/HomeMenu';
import { GetStaticProps } from 'next';
export default function Home() {
  const { t } = useTranslation(['common', 'home_menu']);

  return (
    <div>
      <HomeMenu t={t} />
      <LanguageSwitcher />
      <div>{t('title')}</div>
    </div>
  );
}


// 获取服务端的语言包
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'home_menu'])),
    },
  };
};