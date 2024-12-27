import { DEFAULT_NETWORK_ID, ORDERS_WARNING_DISABLED } from 'constants/defaults'
import { RootState } from 'state/store'

export const selectShowModal = (state: RootState) => state.app.showModal
export const selectShowPositionModal = (state: RootState) => state.app.showPositionModal

export const selectGasSpeed = (state: RootState) => state.app.gasSpeed

export const selectAckedOrdersWarning = (state: RootState) => {
	return ORDERS_WARNING_DISABLED || state.app.acknowledgedOrdersWarning
}

export const selectShowBanner = (state: RootState) => state.app.showBanner

export const selectMarketName = (state: RootState) => state.app.marketName

export const selectSelectedPortfolioTimeframe = (state: RootState) =>
	state.app.selectedPortfolioTimeframe

export const selectWallet = (state: RootState) => state.wallet.walletAddress ?? null

export const selectNetwork = (state: RootState) => state.wallet.networkId ?? DEFAULT_NETWORK_ID