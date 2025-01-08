import { useRouter } from 'next/router'
import { FC, ReactNode, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media'
import NavLink from 'components/Nav/NavLink'
import { TabList, TabPanel } from 'components/Tab'
import { EXTERNAL_LINKS } from 'constants/links'
import ROUTES from 'constants/routes'
import AppLayout from 'sections/shared/Layout/AppLayout'
import { LeftSideContent, PageContent } from 'styles/common'

enum Tab {
	ListToken = 'list-token',
	ListPair = 'list-pair',
	ManageExchange = 'manage-exchange',
}

const Tabs = Object.values(Tab)

const Layout: FC<{ children?: ReactNode }> = ({ children }) => {
	const { t } = useTranslation()
	const router = useRouter()

	const tabQuery = useMemo(() => {
		if (router.pathname) {
			const tab = router.pathname.split('/')[2] as Tab
			if (Tabs.includes(tab)) return tab
		}

		return null
	}, [router.pathname])

	const activeTab = tabQuery ?? Tab.ListToken

	const TABS = useMemo(
		() => [
			{
				name: Tab.ListToken,
				label: t('manage.tabs.list-token'),
				active: activeTab === Tab.ListToken,
				href: ROUTES.Manage.ListToken,
			},
			{
				name: Tab.ListPair,
				label: t('manage.tabs.list-pair'),
				active: activeTab === Tab.ListPair,
				href: ROUTES.Manage.ListPair,
			},
			{
				name: Tab.ManageExchange,
				label: t('manage.tabs.manage-exchange'),
				active: activeTab === Tab.ManageExchange,
				href: ROUTES.Manage.ManageExchange,
			},
		],
		[t, activeTab]
	)

	const visibleTabs = TABS

	return (
		<AppLayout>
			<DesktopOnlyView>
				<PageContent>
					<StyledFullHeightContainer>
						<StyledLeftSideContent>
							<StyledTabList>
								<TabGroupTitle>{t('manage.title')}</TabGroupTitle>
								{visibleTabs.map(({ name, label, active, ...rest }) => (
									<NavLink key={name} title={label} isActive={active} {...rest} />
								))}
							</StyledTabList>
						</StyledLeftSideContent>
						<MainContent>
							<TabPanel name={activeTab} activeTab={activeTab}>
								{children}
							</TabPanel>
						</MainContent>
					</StyledFullHeightContainer>
				</PageContent>
			</DesktopOnlyView>
			<MobileOrTabletView>{children}</MobileOrTabletView>
		</AppLayout>
	)
}

const StyledTabList = styled(TabList)`
	display: flex;
	flex-direction: column;
	margin-bottom: 12px;
`

const TabGroupTitle = styled.div`
	margin-bottom: 10px;
	margin-left: 14px;
	font-size: 13px;
	text-transform: uppercase;
	font-family: ${(props) => props.theme.fonts.black};
	color: ${(props) => props.theme.colors.selectedTheme.yellow};

	&:not(:first-of-type) {
		margin-top: 65px;
	}
`

const MainContent = styled.div`
	overflow-y: scroll;
	scrollbar-width: none;
	margin: 0 auto;
	width: 100%;
	max-width: 1080px;
`

const StyledLeftSideContent = styled(LeftSideContent)`
	padding-top: 15px;
`

const StyledFullHeightContainer = styled.div`
	display: grid;
	grid-template-columns: 165px 1fr 150px;
	height: 100%;
	padding: 0 15px;
`

export default Layout
