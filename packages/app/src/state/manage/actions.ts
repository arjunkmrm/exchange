import { customMarketsInfoType, TokenInfoTypeWithAddress } from '@bitly/sdk/types'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { notifyError } from 'components/ErrorNotifier'
import { ThunkConfig } from 'state/types'

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