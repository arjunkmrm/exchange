import { PERIOD_IN_SECONDS } from '@bitly/sdk/constants'
import { PricesMap } from '@bitly/sdk/types'
import { createAsyncThunk } from '@reduxjs/toolkit'

import { notifyError } from 'components/ErrorNotifier'
import { fetchMarkets } from 'state/exchange/actions'
import { selectPrices } from 'state/prices/selectors'
import { AppThunk } from 'state/store'
import { ThunkConfig } from 'state/types'

import { setOnChainPrices } from './reducer'

export const updatePrices =
	(newPrices: PricesMap): AppThunk =>
	(dispatch, getState) => {
		console.log("ww: prices: ", newPrices)
		dispatch(setOnChainPrices(newPrices))
	}

export const fetchPreviousDayPrices = createAsyncThunk<
	PricesMap,
	void,
	ThunkConfig
>('prices/fetchPreviousDayPrices', async (_, { dispatch, getState, extra: { sdk } }) => {
	try {
		await dispatch(fetchMarkets())
		const prices = selectPrices(getState())
		const marketAssets = Object.keys(prices)

		const laggedPrices = await sdk.prices.getPrices(
			marketAssets,
			-PERIOD_IN_SECONDS.ONE_DAY
		)

		return laggedPrices
	} catch (err) {
		notifyError('Failed to fetch historical prices', err)
		throw err
	}
})
