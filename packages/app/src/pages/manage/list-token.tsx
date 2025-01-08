import Head from 'next/head'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'
import Layout from 'sections/manage/Layout'
import Input from 'components/Input/Input'
import media from 'styles/media'
import { Body } from 'components/Text'
import { MobileHiddenView, MobileOnlyView } from 'components/Media'
import { PageContent, MainContent, FullHeightContainer } from 'styles/common'
import TokenInfoForm from '../../sections/manage/TokenInfoForm'

type ListTokenComponent = React.FC & { getLayout: (page: ReactNode) => JSX.Element }

const ListToken: ListTokenComponent = () => {
	const { t } = useTranslation()

	return (
		<>
			<Head>
				<title>{t('manage.page-titles.list-token')}</title>
			</Head>
			<PageContent>
				<MobileHiddenView>
					<FullHeightContainer>
						<MainContent>
							<TokenInfoForm />
						</MainContent>
					</FullHeightContainer>
				</MobileHiddenView>
				<MobileOnlyView>
					<MobileMainContent>
						<TokenInfoForm />
					</MobileMainContent>
				</MobileOnlyView>
			</PageContent>
		</>
	)
}

ListToken.getLayout = (page) => <Layout>{page}</Layout>

export default ListToken

const MobileMainContent = styled.div`
	width: 100%;
	padding: 15px;
`
