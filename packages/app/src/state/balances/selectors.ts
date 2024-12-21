import type { RootState } from 'state/store'

export const selectBalancesFetchStatus = (state: RootState) => state.balances.status

export const selectBalances = (state: RootState) => state.balances.balancesMap

