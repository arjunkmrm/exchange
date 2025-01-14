import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DEFAULT_QUERY_STATUS, LOADING_STATUS, SUCCESS_STATUS } from 'state/constants'
import { FetchStatus } from 'state/types'
import { fetchAllTokens, fetchMarketsByOwner } from './actions'
import { ManageState } from './types'

export const MANAGE_INITIAL_STATE: ManageState = {
	listPair: {
		quoteToken: '',
		baseToken: '',
	},
	customMarkets: {},
	allTokens: [],
	queryStatuses: {
		customMarkets: DEFAULT_QUERY_STATUS,
		allTokens: DEFAULT_QUERY_STATUS,
	}
}

const manageSlice = createSlice({
	name: 'manage',
	initialState: MANAGE_INITIAL_STATE,
	reducers: {
		setBaseToken: (state, action: PayloadAction<string>) => {
			state.listPair.baseToken = action.payload
		},
		setQuoteToken: (state, action: PayloadAction<string>) => {
			state.listPair.quoteToken = action.payload
		},
	},
	extraReducers: (builder) => {
		// Fetch custom markets
		builder.addCase(fetchMarketsByOwner.pending, (manageState) => {
			manageState.queryStatuses.customMarkets = LOADING_STATUS
		})
		builder.addCase(fetchMarketsByOwner.fulfilled, (manageState, action) => {
			manageState.customMarkets = action.payload
			manageState.queryStatuses.customMarkets = SUCCESS_STATUS
		})
		builder.addCase(fetchMarketsByOwner.rejected, (manageState) => {
			manageState.queryStatuses.customMarkets = {
				error: 'Failed to fetch custom markets',
				status: FetchStatus.Error,
			}
		})

		// Fetch All Tokens
		builder.addCase(fetchAllTokens.pending, (manageState) => {
			manageState.queryStatuses.allTokens = LOADING_STATUS
		})
		builder.addCase(fetchAllTokens.fulfilled, (manageState, action) => {
			manageState.allTokens = action.payload
			manageState.queryStatuses.customMarkets = SUCCESS_STATUS
		})
		builder.addCase(fetchAllTokens.rejected, (manageState) => {
			manageState.queryStatuses.allTokens = {
				error: 'Failed to fetch tokens listed in market',
				status: FetchStatus.Error,
			}
		})
	},
})

export const { 
	setBaseToken,
	setQuoteToken,
} = manageSlice.actions

export default manageSlice.reducer
