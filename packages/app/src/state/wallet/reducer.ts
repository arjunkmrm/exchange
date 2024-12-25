import { createSlice } from '@reduxjs/toolkit'
import { DEFAULT_QUERY_STATUS, LOADING_STATUS, SUCCESS_STATUS } from 'state/constants'
import { FetchStatus } from 'state/types'
import { approve, bundleFetchCurrentWalletData, deposit, fetchAllowance, fetchBalance, fetchBalanceSeries, withdraw } from './actions'

import { WalletState } from './types'

export const WALLET_INITIAL_STATE: WalletState = {
	walletAddress: undefined,
	networkId: undefined,
	balanceInBank: {},
	balanceInWallet: {},
	balanceSeries: {},
	allowances: {},
	queryStatuses: {
		balanceSeries: DEFAULT_QUERY_STATUS,
		balances: DEFAULT_QUERY_STATUS,
		allowance: DEFAULT_QUERY_STATUS,
	},
	writeStatuses: {
		deposit: FetchStatus.Idle,
		withdraw: FetchStatus.Idle,
		approve: FetchStatus.Idle,
	},
}

const walletSlice = createSlice({
	name: 'wallet',
	initialState: WALLET_INITIAL_STATE,
	reducers: {
		setWalletAddress: (state, action) => {
			state.walletAddress = action.payload
		},
		setNetwork: (state, action) => {
			state.networkId = action.payload
		},
		disconnect: (state) => {
			state.walletAddress = undefined
			state.networkId = undefined
		},
		setDepositStatus: (state, action) => {
			state.writeStatuses.deposit = action.payload
		},
		setWithdrawStatus: (state, action) => {
			state.writeStatuses.withdraw = action.payload
		},
		setApproveStatus: (state, action) => {
			state.writeStatuses.approve = action.payload
		},
	},
	extraReducers: (builder) => {
		builder.addCase(bundleFetchCurrentWalletData.fulfilled, (walletState) => {
			walletState.writeStatuses.approve = FetchStatus.Idle
			walletState.writeStatuses.deposit = FetchStatus.Idle
			walletState.writeStatuses.withdraw = FetchStatus.Idle
		})

		// Fetch allowance
		builder.addCase(fetchAllowance.pending, (walletState) => {
			walletState.queryStatuses.allowance = LOADING_STATUS
		})
		builder.addCase(fetchAllowance.fulfilled, (walletState, action) => {
			walletState.allowances = action.payload
			walletState.queryStatuses.allowance = SUCCESS_STATUS
		})
		builder.addCase(fetchAllowance.rejected, (walletState) => {
			walletState.queryStatuses.allowance = {
				error: 'Failed to fetch allowance',
				status: FetchStatus.Error,
			}
		})

		// Fetch balances
		builder.addCase(fetchBalance.pending, (walletState) => {
			walletState.queryStatuses.balances = LOADING_STATUS
		})
		builder.addCase(fetchBalance.fulfilled, (walletState, action) => {
			walletState.balanceInBank = action.payload.balancesInBank
			walletState.balanceInWallet = action.payload.balancesInWallet
			walletState.queryStatuses.balances = SUCCESS_STATUS
		})
		builder.addCase(fetchBalance.rejected, (walletState) => {
			walletState.queryStatuses.balances = {
				error: 'Failed to fetch balances',
				status: FetchStatus.Error,
			}
		})

		// Fetch balance series
		builder.addCase(fetchBalanceSeries.pending, (walletState) => {
			walletState.queryStatuses.balanceSeries = LOADING_STATUS
		})
		builder.addCase(fetchBalanceSeries.fulfilled, (walletState, action) => {
			walletState.balanceSeries = action.payload
			walletState.queryStatuses.balanceSeries = SUCCESS_STATUS
		})
		builder.addCase(fetchBalanceSeries.rejected, (walletState) => {
			walletState.queryStatuses.balanceSeries = {
				error: 'Failed to fetch balance series',
				status: FetchStatus.Error,
			}
		})

		// Write Statuses
		builder.addCase(deposit.pending, (state) => {
			state.writeStatuses.deposit = FetchStatus.Loading
		})
		builder.addCase(deposit.rejected, (state) => {
			state.writeStatuses.deposit = FetchStatus.Error
		})
		builder.addCase(withdraw.pending, (state) => {
			state.writeStatuses.withdraw = FetchStatus.Loading
		})
		builder.addCase(withdraw.rejected, (state) => {
			state.writeStatuses.withdraw = FetchStatus.Error
		})
		builder.addCase(approve.pending, (state) => {
			state.writeStatuses.approve = FetchStatus.Loading
		})
		builder.addCase(approve.rejected, (state) => {
			state.writeStatuses.approve = FetchStatus.Error
		})
	},
})

export const { setWalletAddress, setNetwork } = walletSlice.actions

export default walletSlice.reducer
