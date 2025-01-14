import { customMarketsInfoType, TokenInfoTypeWithAddress } from '@bitly/sdk/types'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { notifyError } from 'components/ErrorNotifier'
import { monitorTransaction } from 'contexts/RelayerContext'
import { FetchStatus, ThunkConfig } from 'state/types'

export const fetchMarketsByOwner = createAsyncThunk<
	customMarketsInfoType,
	void,
	ThunkConfig
>('manage/fetchMarketsByOwner', async (_, { extra: { sdk } }) => {
	try {
		return await sdk.exchange.getMarketByOwner()
	} catch (err) {
		notifyError('Failed to fetch custom markets', err)
		throw err
	}
})

export const fetchAllTokens = createAsyncThunk<
	TokenInfoTypeWithAddress[],
	void,
	ThunkConfig
>('manage/fetchAllTokens', async (_, { extra: { sdk } }) => {
	try {
		return await sdk.exchange.getAllTokens()
	} catch (err) {
		notifyError('Failed to fetch tokens listed in market', err)
		throw err
	}
})

export const createMarket = createAsyncThunk<
	void,
	{ marketName: string },
	ThunkConfig
>('manage/createMarket', async ({ marketName }, { dispatch, extra: { sdk } }) => {
	monitorTransaction({
		transaction: () => sdk.exchange.createMarket(marketName),
		onTxConfirmed: () => {
			dispatch({ type: 'manage/setCreateMarketStatus', 
				payload: FetchStatus.Success
			})
			dispatch(fetchMarketsByOwner())
		},
		onTxFailed: () => {
			dispatch({ type: 'manage/setCreateMarketStatus', 
				payload: FetchStatus.Error 
			})
		},
	})
})