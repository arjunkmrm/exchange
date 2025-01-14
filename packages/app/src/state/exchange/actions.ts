import { PERIOD_IN_SECONDS } from '@bitly/sdk/constants'
import { 
	ExchangeMarketType, 
	ExchangeOrderDetails, 
	MarketsVolumes, 
	OrderbookType, 
	OrderDirection, 
	TokenInfoTypeWithAddress,
	ListTokenProps,
} from '@bitly/sdk/types'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { notifyError } from 'components/ErrorNotifier'
import { DEFAULT_UPDATE_KLINE_DELAY_TIME_MS } from 'constants/defaults'
import { monitorTransaction } from 'contexts/RelayerContext'
import { updatePrices } from 'state/prices/actions'
import { selectCurrentMarketPrice } from 'state/prices/selectors'
import { FetchStatus, ThunkConfig } from 'state/types'
import { fetchBalance } from 'state/wallet/actions'
import logError from 'utils/logError'
import { formatOrderId } from 'utils/string'
import { setMakeOrderStatus } from './reducer'
import { 
	selectCurrentMarketAsset, 
	selectOrderbookWidth, 
	selectOrderDirection, 
	selectOrderPrice, 
	selectOrderSize, 
	selectOrderType, 
	selectSlippage 
} from './selectors'

export const fetchMarkets = createAsyncThunk<
	{ markets: ExchangeMarketType[]; networkId: number } | undefined,
	void,
	ThunkConfig
>('exchange/fetchMarkets', async (_, { extra: { sdk } }) => {
	try {
		const markets = await sdk.exchange.getMarketsInfo([])
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
>('exchange/claimAllEarnings', async ({market}, { dispatch, extra: { sdk } }) => {
	monitorTransaction({
		transaction: () => sdk.exchange.claimAllEarnings(market),
		onTxConfirmed: () => {
			dispatch(fetchOpenOrders())
			dispatch(fetchBalance())
		},
		onTxFailed: () => {
		},
	})
})

export const claimEarning = createAsyncThunk<
	void,
	{ market: string, direction: OrderDirection, point: number }, 
	ThunkConfig
>('exchange/claimEarning', async ({market, direction, point}, { dispatch, extra: { sdk } }) => {
	monitorTransaction({
		transaction: () => sdk.exchange.claimEarning(market, direction, point),
		onTxConfirmed: () => {
			dispatch({ type: 'exchange/setClaimEarningStatus', payload: FetchStatus.Success })
			dispatch(fetchOpenOrders())
			dispatch(fetchBalance())
		},
		onTxFailed: () => {
			dispatch({ type: 'wallet/setClaimEarningStatus', payload: FetchStatus.Error })
		},
	})
})

export const cancelOrder = createAsyncThunk<
	void,
	{ market: string, direction: OrderDirection, point: number }, 
	ThunkConfig
>('exchange/cancelOrder', async ({market, direction, point}, { dispatch, extra: { sdk } }) => {
	monitorTransaction({
		transaction: () => sdk.exchange.cancelLimitOrder(market, direction, point),
		onTxConfirmed: () => {
			dispatch({ type: 'exchange/setCancelOrderStatus', 
				payload: {id: formatOrderId(market, direction, point), status: FetchStatus.Success} 
			})
			dispatch(fetchOpenOrders())
			dispatch(fetchOrderbook())
			dispatch(fetchBalance())
		},
		onTxFailed: () => {
			dispatch({ type: 'exchange/setCancelOrderStatus', 
				payload: {id: formatOrderId(market, direction, point), status: FetchStatus.Error} 
			})
		},
	})
})

export const listToken = createAsyncThunk<
	void,
	ListTokenProps,
	ThunkConfig
>('exchange/listToken', async (info, { dispatch, extra: { sdk } }) => {
	monitorTransaction({
		transaction: () => sdk.exchange.listToken(info),
		onTxConfirmed: () => {
			dispatch({ type: 'exchange/setListTokenStatus', 
				payload: FetchStatus.Success
			})
		},
		onTxFailed: () => {
			dispatch({ type: 'exchange/setListTokenStatus', 
				payload: FetchStatus.Error 
			})
		},
	})
})

export const listPair = createAsyncThunk<
	void,
	{ base: string, quote: string },
	ThunkConfig
>('exchange/listPair', async ({ base, quote }, { dispatch, extra: { sdk } }) => {
	monitorTransaction({
		transaction: () => sdk.exchange.listPair(base, quote),
		onTxConfirmed: () => {
			dispatch({ type: 'exchange/setListPairStatus', 
				payload: FetchStatus.Success
			})
		},
		onTxFailed: () => {
			dispatch({ type: 'exchange/setListPairStatus', 
				payload: FetchStatus.Error 
			})
		},
	})
})

export const placeOrder = createAsyncThunk<
	void,
	void, 
	ThunkConfig
>('exchange/placeOrder', async (_, { getState, dispatch, extra: { sdk } }) => {
	const direction = selectOrderDirection(getState())
	const amount = Number(selectOrderSize(getState()))
	const price = Number(selectOrderPrice(getState()))
	const type = selectOrderType(getState())
	const slippage = selectSlippage(getState())
	const market = selectCurrentMarketAsset(getState())
	const curPrice = selectCurrentMarketPrice(getState())

	const makeOrder = async () => {
		dispatch(setMakeOrderStatus(FetchStatus.Loading))
		if (type === 'limit') {
			return await sdk.exchange.placeLimitOrder(market, direction, price, amount)
		} else {
			return await sdk.exchange.placeMarketOrder(market, direction, amount, curPrice, Math.floor(slippage*10000))
		}
	}

	monitorTransaction({
		transaction: makeOrder,
		onTxSent: () => {
			dispatch(setMakeOrderStatus(FetchStatus.Success))
		},
		onTxFailed: () => {
			dispatch(setMakeOrderStatus(FetchStatus.Error))
			dispatch(fetchOpenOrders())
			dispatch(fetchDailyVolumes())
			dispatch(fetchOrderbook())
			dispatch(fetchBalance())
		},
		onTxConfirmed: () => {
			setTimeout(()=>sdk.prices.updateKline(market), DEFAULT_UPDATE_KLINE_DELAY_TIME_MS)
			dispatch(fetchOpenOrders())
			dispatch(fetchDailyVolumes())
			dispatch(fetchOrderbook())
			dispatch(fetchBalance())
		},
	})
})

export const fetchOrderbook = createAsyncThunk<
	{ orderbook: OrderbookType; market: string } | undefined, 
	void, 
	ThunkConfig
>('exchange/fetchOrderbook', async (_, { getState, extra: { sdk } }) => {
	const market = selectCurrentMarketAsset(getState())
	const width = selectOrderbookWidth(getState())
	const curPrice = selectCurrentMarketPrice(getState())

	const high = curPrice * (1 + width)
	const low = curPrice * (1 - width)

	try {
		const orderbook = await sdk.exchange.getOrderbook(market, {high, low})
		return { orderbook, market }
	} catch (err) {
		logError(err)
		notifyError('Failed to fetch orderbook', err)
		throw err
	}
})