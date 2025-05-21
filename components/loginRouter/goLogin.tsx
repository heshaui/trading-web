import Link from "next/link"; 
import { useTranslation } from 'next-i18next';

function GoLogin() {
    const { t } = useTranslation(['common']);
   
    return (
            <div className="flex-cc mt-4">
                <p>
                    {/* {"已有账号？"} */}
                    {t('loginRouter.goLogin.login')}
                    <Link className="text-color"  href={'/login'}></Link>
                </p>
            </div>

    );
}

export default GoLogin;
