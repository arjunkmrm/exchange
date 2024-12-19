import { PERIOD_IN_SECONDS } from '@bitly/sdk/dist/constants'
import { PricesMap } from '@bitly/sdk/types'
import { createAsyncThunk } from '@reduxjs/toolkit'

import { notifyError } from 'components/ErrorNotifier'
import { selectPrices } from 'state/prices/selectors'
import { AppThunk } from 'state/store'
import { ThunkConfig } from 'state/types'

import { setOnChainPrices } from './reducer'

export const updatePrices =
	(newPrices: PricesMap): AppThunk =>
	(dispatch, getState) => {
		dispatch(setOnChainPrices(newPrices))
	}

export const fetchPreviousDayPrices = createAsyncThunk<
	PricesMap,
	void,
	ThunkConfig
>('prices/fetchPreviousDayPrices', async (_, { getState, extra: { sdk } }) => {
	try {
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
