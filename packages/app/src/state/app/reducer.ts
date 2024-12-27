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
	queryStatuses: {
		marketName: DEFAULT_QUERY_STATUS,
	},
}

const appSlice = createSlice({
	name: 'app',
	initialState: APP_INITIAL_STATE,
	reducers: {
		setOpenModal: (state, action: PayloadAction<ModalType>) => {
			if (action.payload) {
				state.showPositionModal = null
			}
			state.showModal = action.payload
		},
		setShowPositionModal: (
			state,
			action: PayloadAction<{ type: FuturesPositionModalType; marketKey: string } | null>
		) => {
			if (action.payload) {
				state.showModal = null
			}
			state.showPositionModal = action.payload
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
	setShowPositionModal,
	setAcknowledgedOrdersWarning,
	setShowBanner,
	setSelectedPortfolioTimeframe,
} = appSlice.actions

export default appSlice.reducer
