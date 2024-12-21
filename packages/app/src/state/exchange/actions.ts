import { PERIOD_IN_SECONDS } from '@bitly/sdk/constants'
import { ExchangeMarketType, MarketsVolumes, TokenInfoTypeWithAddress } from '@bitly/sdk/types'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { notifyError } from 'components/ErrorNotifier'
import { updatePreviousMarketName } from 'state/app/reducer'
import { selectIsMarketNameUpdated, selectMarketName } from 'state/app/selectors'

import { ThunkConfig } from 'state/types'
import { selectNetwork } from 'state/wallet/selectors'
import logError from 'utils/logError'
import { selectMarkets } from './selectors'

export const fetchMarkets = createAsyncThunk<
	{ markets: ExchangeMarketType[]; networkId: number } | undefined,
	void,
	ThunkConfig
>('exchange/fetchMarkets', async (_, { dispatch, getState, extra: { sdk } }) => {
	try {
		const marketNameUpdated = selectIsMarketNameUpdated(getState())
		if (marketNameUpdated) {
			const markets = await sdk.exchange.getMarkets()
			console.log("ww: fetching market: ", markets)
			const networkId = selectNetwork(getState())
			await dispatch(updatePreviousMarketName())
			return { markets, networkId }
		}
	} catch (err) {
		logError(err)
		notifyError('Failed to fetch markets', err)
		throw err
	}
})

export const fetchDailyVolumes = createAsyncThunk<
	{ volumes: MarketsVolumes; networkId: number } | undefined, 
	void, 
	ThunkConfig
>('exchange/fetchDailyVolumes', async (_, { dispatch, getState, extra: { sdk } }) => {
		try {
			await dispatch(fetchMarkets())
			const markets = selectMarkets(getState())
			const volumesToday = await sdk.exchange.getVolumes(markets.map(e=>e.marketAddress))
			const volumesYesterday = await sdk.exchange.getVolumes(markets.map(e=>e.marketAddress), -PERIOD_IN_SECONDS.ONE_DAY)
			const volumes: MarketsVolumes = volumesToday
			for (const market in volumes) {
				if (Object.prototype.hasOwnProperty.call(volumes, market)) {
					volumes[market] -= volumesYesterday[market] ?? 0
				}
			}
			const networkId = selectNetwork(getState())
			return { volumes, networkId }
		} catch (err) {
			logError(err)
			notifyError('Failed to fetch markets', err)
			throw err
		}
	}
)

export const fetchTokenList = createAsyncThunk<
	{ tokens: TokenInfoTypeWithAddress[]; networkId: number } | undefined, 
	void, 
	ThunkConfig
>('exchange/fetchTokenList', async (_, { dispatch, getState, extra: { sdk } }) => {
	try {
		await dispatch(fetchMarkets())
		const tokens = await sdk.exchange.getTokens()
		const networkId = selectNetwork(getState())
		return { tokens, networkId }
	} catch (err) {
		logError(err)
		notifyError('Failed to fetch markets', err)
		throw err
	}
})
