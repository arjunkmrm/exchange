import { PricesMap } from '@bitly/sdk/dist/types'
import { createSlice } from '@reduxjs/toolkit'

import { DEFAULT_QUERY_STATUS, LOADING_STATUS, SUCCESS_STATUS } from 'state/constants'
import { FetchStatus } from 'state/types'

import { fetchPreviousDayPrices, fetchPricesSeries } from './actions'
import { PricesState } from './types'

export const PRICES_INITIAL_STATE: PricesState = {
	onChainPrices: {},
	connectionError: null,
	previousDayPrices: {},
	pricesSeries: {},
	queryStatuses: {
		previousDayPrices: DEFAULT_QUERY_STATUS,
		pricesSeries: DEFAULT_QUERY_STATUS,
	},
}

const pricesSlice = createSlice({
	name: 'prices',
	initialState: PRICES_INITIAL_STATE,
	reducers: {
		setOnChainPrices: (state, action) => {
			state.onChainPrices = action.payload
		},
	},
	extraReducers: (builder) => {
		// Fetch past daily prices
		builder.addCase(fetchPreviousDayPrices.pending, (pricesState) => {
			pricesState.queryStatuses.previousDayPrices = LOADING_STATUS
		})
		builder.addCase(fetchPreviousDayPrices.fulfilled, (pricesState, action) => {
			const prices: PricesMap = {}
			Object.entries(action.payload).forEach(([key, price]) => {
				prices[key] = price
			})
			console.log("ww: previousDayPrices: ", prices)
			pricesState.previousDayPrices = prices
			pricesState.queryStatuses.previousDayPrices = SUCCESS_STATUS
		})
		builder.addCase(fetchPreviousDayPrices.rejected, (pricesState) => {
			pricesState.queryStatuses.previousDayPrices = {
				error: 'Failed to fetch past prices',
				status: FetchStatus.Error,
			}
		})

		// Fetch prices series
		builder.addCase(fetchPricesSeries.pending, (pricesState) => {
			pricesState.queryStatuses.pricesSeries = LOADING_STATUS
		})
		builder.addCase(fetchPricesSeries.fulfilled, (pricesState, action) => {
			pricesState.pricesSeries = action.payload
			pricesState.queryStatuses.pricesSeries = SUCCESS_STATUS
		})
		builder.addCase(fetchPricesSeries.rejected, (pricesState) => {
			pricesState.queryStatuses.pricesSeries = {
				error: 'Failed to fetch past prices series',
				status: FetchStatus.Error,
			}
		})
	},
})

export const { setOnChainPrices } = pricesSlice.actions

export default pricesSlice.reducer
