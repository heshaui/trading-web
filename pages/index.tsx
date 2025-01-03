import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Experience from '@/components/home/page1_experience/experience';
import Deal from '@/components/home/page2_deal/deal';
import Try from '@/components/home/page3_try/try'; 
import Assistant from '@/components/home/page4_assistant/assistant'; 
import Questions from '@/components/home/page5_questions/questions'; 

import { GetStaticProps } from 'next';
export default function Home() {
  const { t } = useTranslation('common');

  return (
    <div>
      <LanguageSwitcher />
      <div>{t('title')}</div>
      <Experience />
      <Deal />
      <Try/>
      <Assistant/>
      <Questions/>
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