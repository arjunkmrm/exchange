import { BalancesType, OrderDirection } from '@bitly/sdk/types'
import { createSelector } from '@reduxjs/toolkit'

import { DEFAULT_NETWORK_ID } from 'constants/defaults'
import { selectOpenOrders, selectTokens } from 'state/exchange/selectors'
import type { RootState } from 'state/store'
import { FetchStatus } from 'state/types'
import { getPairBasedOnStableCoin } from 'utils/prices'

export const selectIsWalletConnected = createSelector(
	(state: RootState) => state.wallet.walletAddress,
	(walletAddress) => !!walletAddress
)

export const selectBalanceInWallet = (state: RootState) => state.wallet.balanceInWallet

export const selectBalanceInBank = (state: RootState) => state.wallet.balanceInBank

export const selectAllowances = (state: RootState) => state.wallet.allowances

export const selectIsDeposited = createSelector(
	(state: RootState) => state.wallet.writeStatuses.deposit,
	(depositStatus) => depositStatus === FetchStatus.Success || depositStatus === FetchStatus.Error
)

export const selectIsWithdrawed = createSelector(
	(state: RootState) => state.wallet.writeStatuses.withdraw,
	(withdrawStatus) => withdrawStatus === FetchStatus.Success || withdrawStatus === FetchStatus.Error
)

export const selectIsApproving = createSelector(
	(state: RootState) => state.wallet.writeStatuses.approve,
	(approveStatus) => approveStatus === FetchStatus.Loading
)

export const selectIsDepositing = createSelector(
	(state: RootState) => state.wallet.writeStatuses.deposit,
	(depositStatus) => depositStatus === FetchStatus.Loading
)

export const selectIsWithdrawing = createSelector(
	(state: RootState) => state.wallet.writeStatuses.withdraw,
	(withdrawStatus) => withdrawStatus === FetchStatus.Loading
)

export const selectBalancesLoading = 
	(state: RootState) => state.wallet.queryStatuses.balances.status == FetchStatus.Loading

export const selectTotalBalance = createSelector(
	(state: RootState) => state.wallet.balanceInBank,
	(state: RootState) => state.prices.onChainPrices,
	selectTokens,
	(state: RootState) => state.wallet.networkId,
	(balanceInBank, prices, tokenInfo, networkId) => {
		// Calculate total balance currently
		let currentBalance: number = 0
		for (const [token, balance] of Object.entries(balanceInBank)) {
			const network = networkId ?? DEFAULT_NETWORK_ID
			const info = tokenInfo.find(t=>t.address===token)
			if (info !== undefined) {
				const pair = getPairBasedOnStableCoin(token, info, network)
				let price = 0
				if (pair === undefined) {
					price = 1.0
				} else if (pair === null) {
					price = 0
				} else {
					price = prices[pair as string]
				}
				currentBalance += balance * price
			}
		}

		return currentBalance
	}
)

export const selectTotalBalanceHistory = createSelector(
	(state: RootState) => state.wallet.balanceSeries,
	(state: RootState) => state.prices.pricesSeries,
	selectTokens,
	(state: RootState) => state.wallet.networkId,
	selectTotalBalance,
	(balanceSeries, priceSeries, tokenInfo, networkId, currentBalance) => {
		// Calculate total balance history
		const balanceHistory: Record<number, number> = {}
		for (const [timestamp, balances] of Object.entries(balanceSeries)) {
			const timestampNum: number = Number(timestamp)
			balanceHistory[timestampNum] = 0
			for (const [token, balance] of Object.entries(balances)) {
				const network = networkId ?? DEFAULT_NETWORK_ID
				const info = tokenInfo.find(t=>t.address===token)
				if (info !== undefined) {
					const pair = getPairBasedOnStableCoin(token, info, network)
					let price = 0
					if (pair === undefined) {
						price = 1.0
					} else if (pair === null) {
						price = 0
					} else {
						price = priceSeries[timestampNum]?.[pair as string] ?? 0
					}
					balanceHistory[timestampNum] += balance * price
				}
			}
		}

		// Covert to List
		const balanceHistoryList = Object.entries(balanceHistory)
			.sort((a, b)=>Number(a[0])-Number(b[0]))
			.map(e=>({timestamp: Number(e[0])*1000, total: e[1]}))

		const now = (new Date()).getTime()
		balanceHistoryList.push({timestamp: now, total: currentBalance})
		return balanceHistoryList
	}
)

export const selectUnrealizedBalance = createSelector(
	(state: RootState) => state.prices.onChainPrices,
	selectTokens,
	(state: RootState) => state.wallet.networkId,
	selectOpenOrders,
	(prices, tokenInfo, networkId, openOrders) => {
		// Calculate total balance currently
		let unrealizedBalance: number = 0
		
		for (const [_, orders] of Object.entries(openOrders)) {
			for (const order of orders) {
				const baseToken = order.direction == OrderDirection.buy 
					? order.targetToken
					: order.originToken
				const info = tokenInfo.find(i=>i.address==baseToken)
				const network = networkId ?? DEFAULT_NETWORK_ID
				if (info !== undefined) {
					const pair = getPairBasedOnStableCoin(baseToken, info, network)
					let price = 0
					if (pair === undefined) {
						price = 1.0
					} else if (pair === null) {
						price = 0
					} else {
						price = prices[pair as string]
					}
					unrealizedBalance += order.direction == OrderDirection.buy
						? order.earned * price
						: order.earned
				}
			}
		}

		return unrealizedBalance
	}
)