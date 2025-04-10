// export { default } from '../../modules/spot/pages';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
export const getStaticProps: GetStaticProps = async ({ locale }) => {
	return {
		props: {
			...(await serverSideTranslations(locale || 'en', ['spot','common'])),
		},
	};
};
export { default } from '../../modules/spot/pages/spotOrder';