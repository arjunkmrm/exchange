import { CustomMarketsInfoType, TokenInfoTypeWithAddress } from '@bitly/sdk/types'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { notifyError } from 'components/ErrorNotifier'
import { monitorTransaction } from 'contexts/RelayerContext'
import { FetchStatus, ThunkConfig } from 'state/types'

export const fetchMarketsByOwner = createAsyncThunk<
	CustomMarketsInfoType,
	void,
	ThunkConfig
>('manage/fetchMarketsByOwner', async (_, { extra: { sdk } }) => {
	try {
		return await sdk.manage.getMarketByOwner()
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
		return await sdk.manage.getAllTokens()
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
		transaction: () => sdk.manage.createMarket(marketName),
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

export const addPairToMarket = createAsyncThunk<
	void,
	{ address: string; marketName: string },
	ThunkConfig
>('manage/addPairToMarket', async ({ marketName, address }, { dispatch, extra: { sdk } }) => {
	monitorTransaction({
		transaction: () => sdk.manage.addPairToMarket(marketName, address),
		onTxConfirmed: () => {
			dispatch({ type: 'manage/setAddPairToMarketStatus', 
				payload: FetchStatus.Success
			})
			dispatch(fetchMarketsByOwner())
		},
		onTxFailed: () => {
			dispatch({ type: 'manage/setAddPairToMarketStatus', 
				payload: FetchStatus.Error 
			})
		},
	})
})