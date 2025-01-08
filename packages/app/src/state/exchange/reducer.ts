import { OrderDirection } from '@bitly/sdk/types'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DEFAULT_QUERY_STATUS, LOADING_STATUS, SUCCESS_STATUS } from 'state/constants'
import { FetchStatus } from 'state/types'
import { OrderType } from 'types/common'
import { formatOrderId } from 'utils/string'
import { cancelOrder, claimEarning, fetchDailyVolumes, fetchMarkets, fetchOpenOrders, fetchOrderbook, fetchTokenList, listToken } from './actions'
import { ExchangeState } from './types'

export const EXCHANGE_INITIAL_STATE: ExchangeState = {
	markets: {},
	tokensMap: {},
	selectedMarketAsset: '',
	openOrders: {},
	dailyMarketVolumes: {},
	queryStatuses: {
		markets: DEFAULT_QUERY_STATUS,
		dailyVolumes: DEFAULT_QUERY_STATUS,
		tokenList: DEFAULT_QUERY_STATUS,
		openOrders: DEFAULT_QUERY_STATUS,
		orderbook: DEFAULT_QUERY_STATUS,
	},
	writeStatuses: {
		makeOrder: FetchStatus.Idle,
		claimEarning: {},
		cancelOrder: {},
		listToken: FetchStatus.Idle,
		listPair: FetchStatus.Idle,
	},
	orderType: 'limit',
	orderDirection: OrderDirection.buy,
	orderPrice: '0.00',
	orderSize: '0.00',
	slippage: 0.01,
	orderbookWidth: 0.1,
	orderbooks: {},
}

const exchangeSlice = createSlice({
	name: 'exchange',
	initialState: EXCHANGE_INITIAL_STATE,
	reducers: {
		setCurrentMarketAsset: (state, action: PayloadAction<string>) => {
			if (action.payload) {
				state.selectedMarketAsset = action.payload
			}
		},
		setOrderType: (state, action: PayloadAction<OrderType>) => {
			state.orderType = action.payload
		},
		setOrderDirection: (state, action: PayloadAction<OrderDirection>) => {
			state.orderDirection = action.payload
		},
		setOrderPrice: (state, action: PayloadAction<string>) => {
			state.orderPrice = action.payload
		},
		setOrderSize: (state, action: PayloadAction<string>) => {
			state.orderSize = action.payload
		},
		setSlippage: (state, action: PayloadAction<number>) => {
			state.slippage = action.payload
		},
		setMakeOrderStatus: (state, action: PayloadAction<FetchStatus>) => {
			state.writeStatuses.makeOrder = action.payload
		},
		increaseOrderbookWidth: (state, action: PayloadAction<number>) => {
			state.orderbookWidth += action.payload
		},
		setClaimEarningStatus: (state, action) => {
			const id = action.payload.id
			const status = action.payload.status
			state.writeStatuses.claimEarning[id] = status
		},
		setCancelOrderStatus: (state, action) => {
			const id = action.payload.id
			const status = action.payload.status
			state.writeStatuses.cancelOrder[id] = status
		},
		setListTokenStatus: (state, action: PayloadAction<FetchStatus>) => {
			state.writeStatuses.listToken = action.payload
		},
		setListPairStatus: (state, action: PayloadAction<FetchStatus>) => {
			state.writeStatuses.listToken = action.payload
		},
	},

	extraReducers: (builder) => {
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

		// Open orders
		builder.addCase(fetchOpenOrders.pending, (state) => {
			state.queryStatuses.openOrders = LOADING_STATUS
		})
		builder.addCase(fetchOpenOrders.fulfilled, (state, { payload }) => {
			state.queryStatuses.openOrders = SUCCESS_STATUS
			if (payload) {
				state.openOrders[payload.networkId] = payload.openOrders
			}
		})
		builder.addCase(fetchOpenOrders.rejected, (state) => {
			state.queryStatuses.openOrders = {
				status: FetchStatus.Error,
				error: 'Failed to fetch open orders',
			}
		})

		// Orderbook
		builder.addCase(fetchOrderbook.pending, (state) => {
			state.queryStatuses.orderbook = LOADING_STATUS
		})
		builder.addCase(fetchOrderbook.fulfilled, (state, { payload }) => {
			state.queryStatuses.orderbook = SUCCESS_STATUS
			if (payload) {
				state.orderbooks[payload.market] = payload.orderbook
			}
		})
		builder.addCase(fetchOrderbook.rejected, (state) => {
			state.queryStatuses.orderbook = {
				status: FetchStatus.Error,
				error: 'Failed to fetch orderbook',
			}
		})

		// Write Statuses
		builder.addCase(claimEarning.pending, (state, { meta: { arg: { market, direction, point } } }) => {
			state.writeStatuses.claimEarning[formatOrderId(market, direction, point)] = FetchStatus.Loading
		})
		builder.addCase(claimEarning.rejected, (state, { meta: { arg: { market, direction, point } } }) => {
			state.writeStatuses.claimEarning[formatOrderId(market, direction, point)] = FetchStatus.Error
		})
		builder.addCase(cancelOrder.pending, (state, { meta: { arg: { market, direction, point } } }) => {
			state.writeStatuses.cancelOrder[formatOrderId(market, direction, point)] = FetchStatus.Loading
		})
		builder.addCase(cancelOrder.rejected, (state, { meta: { arg: { market, direction, point } } }) => {
			state.writeStatuses.cancelOrder[formatOrderId(market, direction, point)] = FetchStatus.Error
		})
		builder.addCase(listToken.pending, (state) => {
			state.writeStatuses.listToken = FetchStatus.Loading
		})
		builder.addCase(listToken.rejected, (state) => {
			state.writeStatuses.listToken = FetchStatus.Error
		})
	},
})

export default exchangeSlice.reducer

export const {
	setCurrentMarketAsset,
	setOrderType,
	setOrderDirection,
	setOrderPrice,
	setOrderSize,
	setSlippage,
	setMakeOrderStatus,
	increaseOrderbookWidth,
	setClaimEarningStatus,
	setCancelOrderStatus,
	setListTokenStatus,
	setListPairStatus,
} = exchangeSlice.actions
