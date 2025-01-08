import { createAsyncThunk } from "@reduxjs/toolkit"
import { notifyError } from "components/ErrorNotifier"
import { ThunkConfig } from 'state/types'
import logError from "utils/logError"

export const setMarketName = createAsyncThunk<
	string,
	string, 
	ThunkConfig
>('app/setMarketName', async (marketName, { extra: { sdk } }) => {
	try {
		await sdk.exchange.setMarketName(marketName)
		return marketName
	} catch (err) {
		logError(err)
		notifyError('Failed to set market name', err)
		throw err
	}
})
