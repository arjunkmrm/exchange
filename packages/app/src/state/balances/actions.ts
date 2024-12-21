import { createAsyncThunk } from '@reduxjs/toolkit'

import type { ThunkConfig } from 'state/store'

export const fetchBalances = createAsyncThunk<void, void, ThunkConfig>(
	'balances/fetchBalances',
	async (_, { getState, extra: { sdk } }) => {
		// const { wallet } = getState()
		// if (!wallet.walletAddress) return ZERO_BALANCES
		// const [{ balancesMap, totalUSDBalance, susdWalletBalance }, tokenBalances] = await Promise.all([
		// 	sdk.synths.getSynthBalances(wallet.walletAddress),
		// 	sdk.exchange.getTokenBalances(wallet.walletAddress),
		// ])

		// return [balancesMap]
	}
)

