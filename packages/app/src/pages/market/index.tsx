import { useRouter } from 'next/router'
import { useEffect, FC, ReactNode } from 'react'
import styled from 'styled-components'
import MarketHead from 'sections/market/MarketInfo/MarketHead'
import MarketInfo from 'sections/market/MarketInfo/MarketInfo'
import MobileTrade from 'sections/market/MobileTrade/MobileTrade'
import Loader from 'components/Loader'
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media'
import Connector from 'containers/Connector'
import TradePanelSmartMargin from 'sections/market/TradePanelSmartMargin'
import useWindowSize from 'hooks/useWindowSize'
import AppLayout from 'sections/shared/Layout/AppLayout'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { PageContent } from 'styles/common'
import media from 'styles/media'
import { setCurrentMarketAsset } from 'state/exchange/reducer'
import { selectCurrentMarketAsset } from 'state/exchange/selectors'
import { usePollExchangeData, usePollMarketData } from 'state/exchange/hooks'
import { TRADE_PANEL_WIDTH_LG, TRADE_PANEL_WIDTH_MD } from 'sections/market/styles'
import { selectShowModal } from 'state/app/selectors'

type MarketComponent = FC & { getLayout: (page: ReactNode) => JSX.Element }

const Market: MarketComponent = () => {
	const router = useRouter()
	const { walletAddress } = Connector.useContainer()
	const dispatch = useAppDispatch()
	const { greaterThanWidth } = useWindowSize()
	usePollExchangeData()
	usePollMarketData()
	const routerMarketAsset = router.query.asset
	const openModal = useAppSelector(selectShowModal)
	const selectedMarketAsset = useAppSelector(selectCurrentMarketAsset)

	useEffect(() => {
		// dispatch(clearTradeInputs())
		// Clear trade state when switching address
	}, [dispatch, walletAddress])

	useEffect(() => {
		if (
			selectedMarketAsset !== routerMarketAsset &&
			routerMarketAsset
		) {
			dispatch(setCurrentMarketAsset(routerMarketAsset as string))
			// dispatch(clearTradeInputs())
		}
	}, [router, dispatch, routerMarketAsset, selectedMarketAsset])

	return (
		<>
			<MarketHead />
			<DesktopOnlyView>
				<PageContent>
					<StyledFullHeightContainer>
						<TradePanelDesktop />
						<MarketInfo />
					</StyledFullHeightContainer>
				</PageContent>
			</DesktopOnlyView>
			<MobileOrTabletView>
				{greaterThanWidth('md') ? (
					<PageContent>
						<TabletContainer>
							<TradePanelDesktop />
							<TabletRightSection>
								<MobileTrade />
							</TabletRightSection>
						</TabletContainer>
					</PageContent>
				) : (
					<MobileTrade />
				)}
			</MobileOrTabletView>
		</>
	)
}

function TradePanelDesktop() {
	const router = useRouter()

	if (!router.isReady) {
		return (
			<LoaderContainer>
				<Loader inline />
			</LoaderContainer>
		)
	}

	return <TradePanelSmartMargin />
}

Market.getLayout = (page) => <AppLayout>{page}</AppLayout>

export default Market

const StyledFullHeightContainer = styled.div`
	border-top: ${(props) => props.theme.colors.selectedTheme.border};
	display: grid;
	grid-gap: 0;
	flex: 1;
	height: calc(100% - 64px);
	width: 100vw;
	grid-template-columns: ${TRADE_PANEL_WIDTH_LG}px 1fr;
	${media.lessThan('xxl')`
		grid-template-columns: ${TRADE_PANEL_WIDTH_MD}px 1fr;
	`}
`

const LoaderContainer = styled.div`
	text-align: center;
	width: 100%;
	padding: 50px;
`

const TabletContainer = styled.div`
	border-top: ${(props) => props.theme.colors.selectedTheme.border};
	display: grid;
	grid-template-columns: ${TRADE_PANEL_WIDTH_MD}px 1fr;
	height: 100%;
`

const TabletRightSection = styled.div`
	overflow-y: scroll;
	height: 100%;
`
