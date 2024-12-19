import { createSelector } from '@reduxjs/toolkit'

import { RootState } from 'state/store'

export const selectPrices = (state: RootState) =>
	state.prices.onChainPrices

export const selectOnChainPricesInfo = (state: RootState) =>
	state.prices.onChainPrices

export const selectPreviousDayPrices = (state: RootState) => state.prices.previousDayPrices

export const selectLatestEthPrice = createSelector(selectPrices, (prices) => {
	// const price = getPricesForCurrencies(prices, 'sETH', 'sUSD')
	// return price.offChain ?? price.onChain ?? wei(0)
})

export const selectPricesConnectionError = (state: RootState) => state.prices.connectionError
