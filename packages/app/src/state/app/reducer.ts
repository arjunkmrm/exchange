import { Period } from '@bitly/sdk/constants'
import { TransactionStatus, GasPrice } from '@bitly/sdk/types'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { notifyError } from 'components/ErrorNotifier'
import { DEFAULT_QUERY_STATUS, LOADING_STATUS, SUCCESS_STATUS } from 'state/constants'
import { FetchStatus } from 'state/types'
import { isUserDeniedError } from 'utils/formatters/error'
import { setMarketName } from './actions'

import { AppState, FuturesPositionModalType, ModalType, Transaction } from './types'

export const APP_INITIAL_STATE: AppState = {
	showModal: undefined,
	gasPrice: {
		baseFeePerGas: '0', // Note that this is used for estimating price and should not be included in the transaction
		maxPriorityFeePerGas: '0',
		maxFeePerGas: '0',
		gasPrice: '0',
	},
	gasSpeed: 'fast',
	synthetixOnMaintenance: false,
	acknowledgedOrdersWarning: false,
	showBanner: true,
	marketName: undefined,
	selectedPortfolioTimeframe: Period.ONE_WEEK,
	tradePanelDrawerOpen: false,
	showOrderbook: true,
	queryStatuses: {
		marketName: DEFAULT_QUERY_STATUS,
	},
}

const appSlice = createSlice({
	name: 'app',
	initialState: APP_INITIAL_STATE,
	reducers: {
		setOpenModal: (state, action: PayloadAction<{ type: ModalType, params?: Record<string, any>}>) => {
			state.showModal = action.payload
		},
		setAcknowledgedOrdersWarning: (state, action: PayloadAction<boolean>) => {
			state.acknowledgedOrdersWarning = action.payload
		},
		setShowBanner: (state, action: PayloadAction<boolean>) => {
			state.showBanner = action.payload
		},
		setSelectedPortfolioTimeframe: (state, action: PayloadAction<Period>) => {
			state.selectedPortfolioTimeframe = action.payload
		},
		setTradePanelDrawerOpen: (state, action: PayloadAction<boolean>) => {
			state.tradePanelDrawerOpen = action.payload
		},
		toggleShowOrderbook: (state, action: PayloadAction<void>) => {
			state.showOrderbook = !state.showOrderbook
		},
	},
	extraReducers: (builder) => {
		// Set market name
		builder.addCase(setMarketName.pending, (appState) => {
			appState.queryStatuses.marketName = LOADING_STATUS
		})
		builder.addCase(setMarketName.fulfilled, (appState, action) => {
			appState.marketName = action.payload
			appState.queryStatuses.marketName = SUCCESS_STATUS
		})
		builder.addCase(setMarketName.rejected, (appState) => {
			appState.queryStatuses.marketName = {
				error: 'Failed to set market name',
				status: FetchStatus.Error,
			}
		})
	},
})

export const {
	setOpenModal,
	setAcknowledgedOrdersWarning,
	setShowBanner,
	setSelectedPortfolioTimeframe,
	setTradePanelDrawerOpen,
	toggleShowOrderbook,
} = appSlice.actions

export default appSlice.reducer
