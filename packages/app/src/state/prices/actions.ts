import { PERIOD_IN_SECONDS } from '@bitly/sdk/constants'
import { PricesMap } from '@bitly/sdk/types'
import { createAsyncThunk } from '@reduxjs/toolkit'

import { notifyError } from 'components/ErrorNotifier'
import { selectPrices } from 'state/prices/selectors'
import { AppThunk } from 'state/store'
import { ThunkConfig } from 'state/types'
import { truncateTimestamp } from 'utils/date'

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
>('prices/fetchPreviousDayPrices', async (_, { extra: { sdk } }) => {
	try {
		const markets = sdk.exchange.getMarketsInfo([])

		const laggedPrices = await sdk.prices.getPrices(
			markets.map(e=>e.marketAddress),
			-PERIOD_IN_SECONDS.ONE_DAY
		)

		return laggedPrices
	} catch (err) {
		notifyError('Failed to fetch historical prices', err)
		throw err
	}
})

export const fetchPricesSeries = createAsyncThunk<
	Record<number, PricesMap>,
	number,
	ThunkConfig
>('prices/fetchPricesSeries', async (timeSpanInDay, { extra: { sdk } }) => {
	try {
		const markets = sdk.exchange.getMarketsInfo([])

		const pricesSeries: Record<number, PricesMap> = {}

		const nowSec: number = Math.floor((new Date()).getTime() / 1000)

		for (let i = 0; i < timeSpanInDay - 1; i++) {
			const targetTimestamp = truncateTimestamp(nowSec - i * PERIOD_IN_SECONDS.ONE_DAY, PERIOD_IN_SECONDS.ONE_DAY)
			const prices = await sdk.prices.getPrices(
				markets.map(e=>e.marketAddress),
				targetTimestamp - nowSec
			)
			pricesSeries[targetTimestamp] = prices
		}

		return pricesSeries
	} catch (err) {
		notifyError('Failed to fetch historical prices series', err)
		throw err
	}
})
