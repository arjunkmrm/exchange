import { createSelector } from '@reduxjs/toolkit'
import { wei } from '@synthetixio/wei'

import type { RootState } from 'state/store'
import { FetchStatus } from 'state/types'

export const selectBalancesFetchStatus = (state: RootState) => state.balances.status

export const selectSynthBalancesLoading = createSelector(
	(state: RootState) => state.balances.status,
	(status) => status === FetchStatus.Loading
)

export const selectSusdBalance = createSelector(
	(state: RootState) => state.balances.susdWalletBalance,
	(susdWalletBalance) => susdWalletBalance
)

export const selectBalances = createSelector(
	(state: RootState) => state.balances,
	(balances) => {
		// return unserializeBalances(
		// 	balances.synthBalancesMap,
		// 	balances.totalUSDBalance || '0',
		// 	balances.tokenBalances,
		// 	balances.susdWalletBalance || '0'
		// )
	}
)

export const selectSynthV3Balances = createSelector(
	(state: RootState) => state.balances.synthV3Balances,
	(synthV3Balances) => synthV3Balances
)

export const selectSNXUSDBalance = createSelector(
	selectSynthV3Balances,
	(synthV3Balances) => synthV3Balances.SNXUSD?.balance ?? 0
)
