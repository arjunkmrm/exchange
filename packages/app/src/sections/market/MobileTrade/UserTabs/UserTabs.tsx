import React, { useMemo } from 'react'
import styled from 'styled-components'

import TabButton from 'components/Button/TabButton'
import TokenInfoTab from 'sections/market/UserInfo/TokenInfo'
import TradesHistoryTable from 'sections/market/UserInfo/TradesHistoryTable'
import MyOpenOrders from 'sections/market/UserInfo/MyOpenOrders'
import MyTradesHistoryTable from 'sections/market/UserInfo/MyTradesHistoryTable'

const UserTabs: React.FC = () => {
	const [activeTab, setActiveTab] = React.useState(0)

	const TABS = useMemo(() => {
		return [
			{
				title: 'Info',
				component: <TokenInfoTab />,
			},
			{
				title: 'Market History',
				component: <TradesHistoryTable mobile />,
			},
			{
				title: 'My Opening Orders',
				component: <MyOpenOrders mobile />,
			},
			{
				title: 'My Trade History',
				component: <MyTradesHistoryTable mobile />,
			},
		]
	}, [])

	return (
		<Container>
			<UserTabsContainer>
				<TabButtonsContainer>
					{TABS.map(({ title }, i) => (
						<TabButton
							key={title}
							title={title}
							active={activeTab === i}
							onClick={() => setActiveTab(i)}
							flat
						/>
					))}
				</TabButtonsContainer>
			</UserTabsContainer>
			<div>{TABS[activeTab].component}</div>
		</Container>
	)
}

const Container = styled.div`
	min-height: 390px;
`

const UserTabsContainer = styled.div`
	width: 100%;
	overflow: scroll;
	border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
	border-top: ${(props) => props.theme.colors.selectedTheme.border};
`

const TabButtonsContainer = styled.div`
	display: flex;
	justify-content: space-between;
`

export default UserTabs
