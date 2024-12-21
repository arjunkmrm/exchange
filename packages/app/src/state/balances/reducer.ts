import { createSlice } from '@reduxjs/toolkit'

import { FetchStatus } from 'state/types'

import { fetchBalances } from './actions'
import { BalancesState } from './types'

export const BALANCES_INITIAL_STATE: BalancesState = {
	status: FetchStatus.Idle,
	error: undefined,
	balancesMap: {},
}

const balancesSlice = createSlice({
	name: 'balances',
	initialState: BALANCES_INITIAL_STATE,
	reducers: {
		clearBalances: (state) => {
			state.balancesMap = {}
			state.status = FetchStatus.Idle
			state.error = undefined
		},
	},
	extraReducers: (builder) => {
		builder.addCase(fetchBalances.pending, (state) => {
			state.status = FetchStatus.Loading
		})
		builder.addCase(fetchBalances.fulfilled, (state, action) => {
			state.status = FetchStatus.Success
			// state.tokenBalances = action.payload.tokenBalances
		})
		builder.addCase(fetchBalances.rejected, (state) => {
			state.status = FetchStatus.Error
		})
	},
})

export default balancesSlice.reducer
