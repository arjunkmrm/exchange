import { PERIOD_IN_SECONDS, Period } from '@bitly/sdk/constants'
import {
	ExchangeOrdersType,
	TransactionStatus,
} from '@bitly/sdk/types'
import { createAsyncThunk } from '@reduxjs/toolkit'

import { notifyError } from 'components/ErrorNotifier'
import { monitorAndAwaitTransaction } from 'state/app/helpers'
import { handleTransactionError, setTransaction } from 'state/app/reducer'
import { ZERO_CM_FEES, ZERO_STATE_TRADE_INPUTS } from 'state/constants'
import { AppThunk } from 'state/store'
import { ThunkConfig } from 'state/types'
import { selectNetwork } from 'state/wallet/selectors'

import { selectFuturesType } from './common/selectors'
import {
	editSmartMarginTradeSize,
	fetchDailyVolumesV2,
	fetchMarginTransfersV2,
	fetchMarketsV2,
	fetchPositionHistoryV2,
	fetchSmartMarginOpenOrders,
} from './smartMargin/actions'
import {
	setSmartMarginLeverageInput,
	setSmartMarginFees,
	setSmartMarginMarginDelta,
	clearSmartMarginTradePreviews,
	setSmartMarginTradeInputs,
	setSmartMarginEditPositionInputs,
} from './smartMargin/reducer'
import {
	selectSmartMarginAccount,
} from './smartMargin/selectors'

export const fetchMarkets = createAsyncThunk<void, void, ThunkConfig>(
	'futures/fetchMarkets',
	async (_, { dispatch, getState }) => {
		dispatch(fetchMarketsV2())
	}
)

export const fetchMarginTransfers = createAsyncThunk<void, void, ThunkConfig>(
	'futures/fetchMarginTransfers',
	async (_, { dispatch }) => {
		// TODO: Conditionally fetch cross / smart
		dispatch(fetchMarginTransfersV2())
	}
)

export const clearTradeInputs = createAsyncThunk<void, void, ThunkConfig>(
	'futures/clearTradeInputs',
	async (_, { dispatch }) => {
		// TODO: Separate to cross / smart
		dispatch(setSmartMarginMarginDelta(''))
		dispatch(setSmartMarginFees(ZERO_CM_FEES))
		dispatch(setSmartMarginLeverageInput(''))
		dispatch(clearSmartMarginTradePreviews())
		dispatch(setSmartMarginTradeInputs(ZERO_STATE_TRADE_INPUTS))
		dispatch(setSmartMarginEditPositionInputs({ nativeSizeDelta: '', marginDelta: '' }))
	}
)

export const editTradeSizeInput =
	(size: string, currencyType: 'usd' | 'native'): AppThunk =>
	(dispatch, getState) => {
		const type = selectFuturesType(getState())
		dispatch(editSmartMarginTradeSize(size, currencyType))
	}

export const fetchFuturesPositionHistory = createAsyncThunk<void, void, ThunkConfig>(
	'futures/fetchFuturesPositionHistory',
	async (_, { getState, dispatch }) => {
		dispatch(fetchPositionHistoryV2())
	}
)

export const fetchPositionHistoryForTrader = createAsyncThunk<
	{ history: ExchangeOrdersType; address: string; networkId: number } | undefined,
	void,
	ThunkConfig
>('futures/fetchPositionHistoryForTrader', async (_, {getState, extra: { sdk } }) => {
	const wallet = sdk.context.walletAddress
	try {
		const networkId = selectNetwork(getState())
		
		const history = await sdk.exchange.getFinishedOrders()
		return { history, networkId, address: wallet }
	} catch (err) {
		notifyError('Failed to fetch history for trader ' + wallet, err)
		throw err
	}
})

// Contract Mutations

export const cancelDelayedOrder = createAsyncThunk<void, string, ThunkConfig>(
	'futures/cancelDelayedOrder',
	async (marketAddress, { getState, dispatch, extra: { sdk } }) => {
		const account = selectSmartMarginAccount(getState())
		if (!account) throw new Error('No wallet connected')
		try {
			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'cancel_delayed_isolated',
					hash: null,
				})
			)

			const tx = await sdk.futures.cancelDelayedOrder({
				marketAddress,
				account,
				isOffchain: true,
			})
			await monitorAndAwaitTransaction(dispatch, tx)
			dispatch(fetchSmartMarginOpenOrders())
		} catch (err) {
			dispatch(handleTransactionError(err.message))
			throw err
		}
	}
)

// Utils

export const fetchFundingRatesHistory = createAsyncThunk<
	{ marketAsset: string; rates: any },
	{ marketAsset: string; period: Period },
	ThunkConfig
>('futures/fetchFundingRatesHistory', async ({ marketAsset, period }, { extra: { sdk } }) => {
	const rates = await sdk.futures.getMarketFundingRatesHistory(
		marketAsset,
		PERIOD_IN_SECONDS[period]
	)
	return { marketAsset, rates }
})
