import { useRouter } from 'next/router';

export default function LanguageSwitcher() {
  const router = useRouter();

  const changeLanguage = (locale: string) => {
    router.push(router.pathname, router.asPath, { locale });
  };

  return (
    <div>
      <button onClick={() => changeLanguage('en')}>English</button>
      <br/>
      <button onClick={() => changeLanguage('zh')}>中文</button>
      <br/>
      <button onClick={() => changeLanguage('ko')}>韩文</button>
      <br/>
    </div>
  );
}