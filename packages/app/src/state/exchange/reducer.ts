import { createSlice } from '@reduxjs/toolkit'
import { DEFAULT_QUERY_STATUS, LOADING_STATUS, SUCCESS_STATUS } from 'state/constants'
import { FetchStatus } from 'state/types'
import { fetchDailyVolumes, fetchMarkets, fetchTokenList } from './actions'
import { ExchangeState } from './types'

export const EXCHANGE_INITIAL_STATE: ExchangeState = {
	markets: {},
	tokensMap: {},
	selectedMarketAsset: '',
	dailyMarketVolumes: {},
	queryStatuses: {
		markets: DEFAULT_QUERY_STATUS,
		dailyVolumes: DEFAULT_QUERY_STATUS,
		tokenList: DEFAULT_QUERY_STATUS,
	},
}

const exchangeSlice = createSlice({
	name: 'exchange',
	initialState: EXCHANGE_INITIAL_STATE,
	reducers: {
	},

	extraReducers(builder) {
		// Markets
		builder.addCase(fetchMarkets.pending, (exchangeState) => {
			exchangeState.queryStatuses.markets = LOADING_STATUS
		})
		builder.addCase(fetchMarkets.fulfilled, (exchangeState, { payload }) => {
			exchangeState.queryStatuses.markets = SUCCESS_STATUS
			if (payload) {
				exchangeState.markets[payload.networkId] = payload.markets
			}
		})
		builder.addCase(fetchMarkets.rejected, (exchangeState) => {
			exchangeState.queryStatuses.markets = {
				status: FetchStatus.Error,
				error: 'Failed to fetch markets',
			}
		})

		// Daily volumes
		builder.addCase(fetchDailyVolumes.pending, (state) => {
			state.queryStatuses.dailyVolumes = LOADING_STATUS
		})
		builder.addCase(fetchDailyVolumes.fulfilled, (state, { payload }) => {
			state.queryStatuses.dailyVolumes = SUCCESS_STATUS
			if (payload) {
				state.dailyMarketVolumes[payload.networkId] = payload.volumes
			}
		})
		builder.addCase(fetchDailyVolumes.rejected, (state) => {
			state.queryStatuses.dailyVolumes = {
				status: FetchStatus.Error,
				error: 'Failed to fetch volume data',
			}
		})

		// Token Infos
		builder.addCase(fetchTokenList.pending, (state) => {
			state.queryStatuses.tokenList = LOADING_STATUS
		})
		builder.addCase(fetchTokenList.fulfilled, (state, { payload }) => {
			state.queryStatuses.tokenList = SUCCESS_STATUS
			if (payload) {
				state.tokensMap[payload.networkId] = payload.tokens
			}
		})
		builder.addCase(fetchTokenList.rejected, (state) => {
			state.queryStatuses.tokenList = {
				status: FetchStatus.Error,
				error: 'Failed to fetch token list',
			}
		})
	},
})

export default exchangeSlice.reducer

export const {
} = exchangeSlice.actions
