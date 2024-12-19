import { useRouter } from 'next/router'
import { useEffect, FC, ReactNode, useCallback } from 'react'
import styled from 'styled-components'

import Loader from 'components/Loader'
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media'
import Connector from 'containers/Connector'
import useIsL2 from 'hooks/useIsL2'
import useWindowSize from 'hooks/useWindowSize'
import ClosePositionModal from 'sections/futures/ClosePositionModal/ClosePositionModal'
import EditPositionMarginModal from 'sections/futures/EditPositionModal/EditPositionMarginModal'
import EditPositionSizeModal from 'sections/futures/EditPositionModal/EditPositionSizeModal'
import EditStopLossAndTakeProfitModal from 'sections/futures/EditPositionModal/EditStopLossAndTakeProfitModal'
import MarketInfo from 'sections/futures/MarketInfo'
import MarketHead from 'sections/futures/MarketInfo/MarketHead'
import MobileTrade from 'sections/futures/MobileTrade/MobileTrade'
import SmartMarginOnboard from 'sections/futures/SmartMarginOnboard'
import { TRADE_PANEL_WIDTH_LG, TRADE_PANEL_WIDTH_MD } from 'sections/futures/styles'
import FuturesUnsupportedNetwork from 'sections/futures/Trade/FuturesUnsupported'
import TradePanelSmartMargin from 'sections/futures/Trade/TradePanelSmartMargin'
import TransferSmartMarginModal from 'sections/futures/Trade/TransferSmartMarginModal'
import TradeConfirmationModalCrossMargin from 'sections/futures/TradeConfirmation/TradeConfirmationModalCrossMargin'
import AppLayout from 'sections/shared/Layout/AppLayout'
import { setOpenModal } from 'state/app/reducer'
import { selectShowModal, selectShowPositionModal } from 'state/app/selectors'
import { clearTradeInputs } from 'state/futures/actions'
import { selectFuturesType, selectMarketAsset } from 'state/futures/common/selectors'
import { usePollMarketFuturesData } from 'state/futures/hooks'
import { setMarketAsset } from 'state/futures/smartMargin/reducer'
import {
	selectMaxTokenBalance,
	selectShowSmartMarginOnboard,
	selectSmartMarginAccountQueryStatus,
} from 'state/futures/smartMargin/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { FetchStatus } from 'state/types'
import { PageContent } from 'styles/common'
import media from 'styles/media'

type MarketComponent = FC & { getLayout: (page: ReactNode) => JSX.Element }

const Market: MarketComponent = () => {
	const router = useRouter()
	const { walletAddress } = Connector.useContainer()
	const dispatch = useAppDispatch()
	const { greaterThanWidth } = useWindowSize()
	usePollMarketFuturesData()
	const routerMarketAsset = (router.query.asset) as string
	const showOnboard = useAppSelector(selectShowSmartMarginOnboard)
	const openModal = useAppSelector(selectShowModal)
	const showPositionModal = useAppSelector(selectShowPositionModal)
	const selectedMarketAsset = useAppSelector(selectMarketAsset)
	const maxTokenBalance = useAppSelector(selectMaxTokenBalance)

	useEffect(() => {
		dispatch(clearTradeInputs())
		// Clear trade state when switching address
	}, [dispatch, walletAddress])

	useEffect(() => {
		if (
			selectedMarketAsset !== routerMarketAsset &&
			routerMarketAsset
		) {
			dispatch(setMarketAsset(routerMarketAsset))
			dispatch(clearTradeInputs())
		}
	}, [router, dispatch, routerMarketAsset, selectedMarketAsset])

	const onDismiss = useCallback(() => {
		dispatch(setOpenModal(null))
	}, [dispatch])
	return (
		<>
			<MarketHead />
			<SmartMarginOnboard isOpen={showOnboard} />
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
			{showPositionModal?.type === 'smart_margin_close_position' && <ClosePositionModal />}
			{showPositionModal?.type === 'futures_edit_stop_loss_take_profit' && (
				<EditStopLossAndTakeProfitModal />
			)}
			{showPositionModal?.type === 'futures_edit_position_size' && <EditPositionSizeModal />}
			{showPositionModal?.type === 'futures_edit_position_margin' && <EditPositionMarginModal />}
			{openModal === 'futures_deposit_withdraw_smart_margin' && (
				<TransferSmartMarginModal
					defaultTab={maxTokenBalance.eq(0) ? 2 : 0}
					onDismiss={onDismiss}
				/>
			)}

			{openModal === 'futures_confirm_smart_margin_trade' && <TradeConfirmationModalCrossMargin />}
		</>
	)
}

function TradePanelDesktop() {
	const router = useRouter()
	const isL2 = useIsL2()
	const { walletAddress } = Connector.useContainer()
	const accountType = useAppSelector(selectFuturesType)
	const queryStatus = useAppSelector(selectSmartMarginAccountQueryStatus)
	const openModal = useAppSelector(selectShowModal)

	if (
		walletAddress &&
		!isL2 &&
		openModal !== 'futures_smart_margin_socket' &&
		openModal !== 'futures_deposit_withdraw_smart_margin'
	) {
		return <FuturesUnsupportedNetwork />
	}

	if (
		!router.isReady ||
		(accountType === walletAddress &&
			queryStatus.status === FetchStatus.Idle)
	) {
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
