import { useRouter } from 'next/router'
import React, { useMemo, useState, useCallback, useEffect, memo } from 'react'
import styled from 'styled-components'

import CalculatorIcon from 'assets/svg/futures/calculator-icon.svg'
import OpenPositionsIcon from 'assets/svg/futures/icon-open-positions.svg'
import OrderHistoryIcon from 'assets/svg/futures/icon-order-history.svg'
import PositionIcon from 'assets/svg/futures/icon-position.svg'
import TabButton from 'components/Button/TabButton'
import Spacer from 'components/Spacer'
import { TabPanel } from 'components/Tab'
import ROUTES, { MarketInfoTab } from 'constants/routes'
import useWindowSize from 'hooks/useWindowSize'
import { useAppSelector, useFetchAction, useAppDispatch } from 'state/hooks'
import { selectCurrentMarketAsset } from 'state/exchange/selectors'
import TokenInfoTab from './TokenInfo'
import TradesHistoryTable from './TradesHistoryTable'
import MyOpenOrders from './MyOpenOrders'
import MyTradesHistoryTable from './MyTradesHistoryTable'

const MarketInfoTabs = Object.values(MarketInfoTab)

const UserInfo: React.FC = memo(() => {
	const router = useRouter()
	const { lessThanWidth } = useWindowSize()

	const marketAsset = useAppSelector(selectCurrentMarketAsset)

	const tabQuery = useMemo(() => {
		if (router.query.tab) {
			const tab = router.query.tab as MarketInfoTab
			if (MarketInfoTabs.includes(tab)) {
				return tab
			}
		}
		return null
	}, [router])

	const activeTab = tabQuery ?? MarketInfoTab.INFO

	const TABS = useMemo(
		() => [
			{
				name: MarketInfoTab.INFO,
				label: 'Info',
				badge: undefined,
				active: activeTab === MarketInfoTab.INFO,
				icon: <PositionIcon />,
				onClick: () =>
					router.push(ROUTES.Markets.Info(marketAsset), undefined, {
						scroll: false,
					}),
			},
			{
				name: MarketInfoTab.MARKET_HISTORY,
				label: 'Market History',
				badge: undefined,
				active: activeTab === MarketInfoTab.MARKET_HISTORY,
				icon: <OrderHistoryIcon />,
				onClick: () =>
					router.push(ROUTES.Markets.MarketHistory(marketAsset), undefined, {
						scroll: false,
					}),
			},
			{
				name: MarketInfoTab.MY_ORDERS,
				label: 'My Opening Orders',
				badge: undefined,
				active: activeTab === MarketInfoTab.MY_ORDERS,
				icon: <OpenPositionsIcon />,
				onClick: () =>
					router.push(ROUTES.Markets.MyOrders(marketAsset), undefined, {
						scroll: false,
					}),
			},
			{
				name: MarketInfoTab.MY_HISTORY,
				label: 'My Trade History',
				badge: undefined,
				active: activeTab === MarketInfoTab.MY_HISTORY,
				icon: <OrderHistoryIcon />,
				onClick: () =>
					router.push(ROUTES.Markets.MyHistory(marketAsset), undefined, {
						scroll: false,
					}),
			},
		],
		[
			activeTab,
			router,
			marketAsset,
		]
	)

	return (
		<UserInfoContainer>
			<TabButtonsContainer>
				{TABS.map(({ name, label, badge, active, onClick, icon }) => (
					<TabButton
						inline
						key={name}
						title={label}
						badgeCount={badge}
						active={active}
						onClick={onClick}
						icon={icon}
					/>
				))}
			</TabButtonsContainer>

			<TabPanel name={MarketInfoTab.INFO} activeTab={activeTab} fullHeight>
				<TokenInfoTab />
			</TabPanel>
			<TabPanel name={MarketInfoTab.MARKET_HISTORY} activeTab={activeTab} fullHeight>
				<TradesHistoryTable />
			</TabPanel>
			<TabPanel name={MarketInfoTab.MY_ORDERS} activeTab={activeTab} fullHeight>
				<MyOpenOrders />
			</TabPanel>
			<TabPanel name={MarketInfoTab.MY_HISTORY} activeTab={activeTab} fullHeight>
				<MyTradesHistoryTable />
			</TabPanel>
		</UserInfoContainer>
	)
})

const UserInfoContainer = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	height: 100%;
	width: 100%;
	overflow: hidden;
	border-top: ${(props) => props.theme.colors.selectedTheme.border};
`

const TabButtonsContainer = styled.div`
	display: grid;
	grid-gap: 15px;
	grid-template-columns: repeat(4, 1fr);
	height: 40px;

	button {
		font-size: 13px;
	}
`

const TabLeft = styled.div`
	display: flex;
	justify-content: left;
`

const TabRight = styled.div`
	display: flex;
	justify-content: right;
`

export default UserInfo
