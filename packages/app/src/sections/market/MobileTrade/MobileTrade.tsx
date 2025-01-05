import { useCallback } from 'react'
import styled from 'styled-components'

import Connector from 'containers/Connector'
import useWindowSize from 'hooks/useWindowSize'
import { selectIsTradePanelDrawerOpen, selectShowBanner } from 'state/app/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'

import MarketDetails from '../MarketDetails/MarketDetails'
import MarketsDropdown from '../MarketsDropdown'
import TradePanelDrawer from './drawers/TradePanelDrawer'
import OverviewTabs from './OverviewTabs'
import UserTabs from './UserTabs'
import { setTradePanelDrawerOpen } from 'state/app/reducer'
import { MARKET_SELECTOR_HEIGHT_MOBILE } from 'constants/defaults'

const MobileTrade: React.FC = () => {
	const { walletAddress } = Connector.useContainer()
	const { deviceType } = useWindowSize()
	const showBanner = useAppSelector(selectShowBanner)
	const tradeDrawerPanelOpen = useAppSelector(selectIsTradePanelDrawerOpen)
	const dispatch = useAppDispatch()

	const handleCloseDrawer = useCallback(() => {
		dispatch(setTradePanelDrawerOpen(false))
	}, [dispatch])

	return (
		<>
			<MobileContainer mobile={deviceType === 'mobile'} id="mobile-view" showBanner={showBanner}>
				{deviceType === 'mobile' && <MarketsDropdown mobile={deviceType === 'mobile'} />}
				<MarketDetails mobile />
			</MobileContainer>
			<OverviewTabs />
			<UserTabs />
			{tradeDrawerPanelOpen && (
				<TradePanelDrawer open={tradeDrawerPanelOpen} closeDrawer={handleCloseDrawer} />
			)} 
		</>
	)
}

const MobileContainer = styled.div<{ mobile: boolean; showBanner: boolean }>`
	padding-top: ${(props) =>
		props.mobile && !props.showBanner ? MARKET_SELECTOR_HEIGHT_MOBILE : 0}px;
`

const SwitchNetworkContainer = styled.div`
	padding: 15px;
`

export default MobileTrade
