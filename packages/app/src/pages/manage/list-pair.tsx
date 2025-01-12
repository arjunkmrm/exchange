import Head from 'next/head'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import Layout from 'sections/manage/Layout'
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media'
import { MobileScreenContainer } from 'styles/common'
import ListPairContent from 'sections/manage/listPair/ListPairContent'

type ListPairComponent = React.FC & { getLayout: (page: ReactNode) => JSX.Element }

const ListPair: ListPairComponent = () => {
	const { t } = useTranslation()

	return (
		<>
			<Head>
				<title>{t('manage.page-titles.list-pair')}</title>
			</Head>
			<DesktopOnlyView>
				<ListPairContent />
			</DesktopOnlyView>
			<MobileOrTabletView>
				<MobileScreenContainer>
					<ListPairContent />
				</MobileScreenContainer>
			</MobileOrTabletView>
		</>
	)
}

ListPair.getLayout = (page) => <Layout>{page}</Layout>

export default ListPair

