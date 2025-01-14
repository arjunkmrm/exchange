import Head from 'next/head'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import Layout from 'sections/manage/Layout'
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media'
import { MobileScreenContainer } from 'styles/common'
import ManageContent from 'sections/manage/manageExchange/ManageContent'

type CustomExchangeComponent = React.FC & { getLayout: (page: ReactNode) => JSX.Element }

const CustomExchange: CustomExchangeComponent = () => {
	const { t } = useTranslation()

	return (
		<>
			<Head>
				<title>{t('manage.page-titles.custom')}</title>
			</Head>
			<DesktopOnlyView>
				<ManageContent />
			</DesktopOnlyView>
			<MobileOrTabletView>
				<MobileScreenContainer>
					<ManageContent />
				</MobileScreenContainer>
			</MobileOrTabletView>
		</>
	)
}

CustomExchange.getLayout = (page) => <Layout>{page}</Layout>

export default CustomExchange
