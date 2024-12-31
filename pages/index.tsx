import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Home_experience from '@/components/home/experience.tsx'
import { GetStaticProps } from 'next';
export default function Home() {
  const { t } = useTranslation('common');

  return (
    <div>
      <LanguageSwitcher />
      <div>{t('title')}</div>
      <Home_experience />
    </div>
  );
}


// 获取服务端的语言包
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};