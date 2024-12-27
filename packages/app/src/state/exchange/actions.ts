import { PERIOD_IN_SECONDS } from '@bitly/sdk/constants'
import { ExchangeMarketType, ExchangeOrderDetails, MarketsVolumes, TokenInfoTypeWithAddress } from '@bitly/sdk/types'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { notifyError } from 'components/ErrorNotifier'
import { monitorTransaction } from 'contexts/RelayerContext'

import { FetchStatus, ThunkConfig } from 'state/types'
import logError from 'utils/logError'

export const fetchMarkets = createAsyncThunk<
	{ markets: ExchangeMarketType[]; networkId: number } | undefined,
	void,
	ThunkConfig
>('exchange/fetchMarkets', async (_, { extra: { sdk } }) => {
	try {
		const markets = await sdk.exchange.getMarketsInfo([])
		console.log("ww: fetching market: ", markets)
		const networkId = sdk.context.networkId
		return { markets, networkId }
	} catch (err) {
		logError(err)
		notifyError('Failed to fetch markets', err)
		throw err
	}
})

export const fetchTokenList = createAsyncThunk<
	{ tokens: TokenInfoTypeWithAddress[]; networkId: number } | undefined, 
	void, 
	ThunkConfig
>('exchange/fetchTokenList', async (_, { extra: { sdk } }) => {
	try {
		const tokens = await sdk.exchange.getTokensInfo([])
		const networkId = sdk.context.networkId
		return { tokens, networkId }
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
>('exchange/fetchDailyVolumes', async (_, { extra: { sdk } }) => {
		try {
			const markets = await sdk.exchange.getMarketsInfo([])
			const volumesToday = await sdk.exchange.getVolumes(markets.map(e=>e.marketAddress))
			const volumesYesterday = await sdk.exchange.getVolumes(markets.map(e=>e.marketAddress), -PERIOD_IN_SECONDS.ONE_DAY)
			const volumes: MarketsVolumes = volumesToday
			for (const market in volumes) {
				if (Object.prototype.hasOwnProperty.call(volumes, market)) {
					volumes[market] -= volumesYesterday[market] ?? 0
				}
			}
			const networkId = sdk.context.networkId
			return { volumes, networkId }
		} catch (err) {
			logError(err)
			notifyError('Failed to fetch markets', err)
			throw err
		}
	}
)

export const fetchOpenOrders = createAsyncThunk<
	{ openOrders: ExchangeOrderDetails; networkId: number } | undefined, 
	void, 
	ThunkConfig
>('exchange/fetchOpenOrders', async (_, { extra: { sdk } }) => {
	try {
		const markets = sdk.exchange.getMarketsInfo([])
		const openOrders = await sdk.exchange.getLimitOrders(markets.map(e=>e.marketAddress))
		const networkId = sdk.context.networkId
		console.log("ww: ", openOrders, networkId)
		return { openOrders, networkId }
	} catch (err) {
		logError(err)
		notifyError('Failed to fetch open orders', err)
		throw err
	}
})

export const claimAllEarnings = createAsyncThunk<
	void,
	{ market: string }, 
	ThunkConfig
>('exchange/fetchOpenOrders', async ({market}, { dispatch, extra: { sdk } }) => {
	monitorTransaction({
		transaction: () => sdk.exchange.claimAllEarnings(market),
		onTxConfirmed: () => {
			dispatch({ type: 'wallet/setApproveStatus', payload: FetchStatus.Success })
			dispatch(fetchOpenOrders())
		},
		onTxFailed: () => {
			dispatch({ type: 'wallet/setApproveStatus', payload: FetchStatus.Error })
			dispatch(fetchOpenOrders())
		},
	})
})

