import { createAsyncThunk } from '@reduxjs/toolkit'
import * as Sentry from '@sentry/browser'
import { ethers } from 'ethers'
import { AllowancesType, BalancesType } from '@bitly/sdk/types'

import { FetchStatus, ThunkConfig } from 'state/types'

import { setWalletAddress } from './reducer'
import { notifyError } from 'components/ErrorNotifier'
import { truncateTimestamp } from 'utils/date'
import { PERIOD_IN_SECONDS } from '@bitly/sdk/constants'
import { monitorTransaction } from 'contexts/RelayerContext'
import logError from 'utils/logError'
import { DEFAULT_NETWORK_ID } from 'constants/defaults'

export const resetWalletAddress = createAsyncThunk<void, string | undefined, ThunkConfig>(
	'wallet/resetWalletAddress',
	async (walletAddress, { dispatch }) => {
		dispatch(setWalletAddress(walletAddress))
	}
)

export const setSigner = createAsyncThunk<void, ethers.Signer | null | undefined, ThunkConfig>(
	'wallet/setSigner',
	async (signer, { dispatch, extra: { sdk } }) => {
		if (!!signer) {
			const [address] = await Promise.all([signer?.getAddress(), sdk.setSigner(signer)])
			Sentry.setUser({ id: address })
			dispatch(resetWalletAddress(address))
		} else {
			dispatch(resetWalletAddress(undefined))
			dispatch({ type: 'balances/clearBalances' })
		}
	}
)

export const setNetwork = createAsyncThunk<
	number, 
	number | undefined,
	ThunkConfig
>('wallet/setNetwork', async (networkId, { dispatch, extra: { sdk } }) => {
	try {
		console.log("ww: setNetwork: ", networkId)
		if (networkId === undefined) {
			networkId = DEFAULT_NETWORK_ID
		}
		await sdk.setNetworkId(networkId)
		console.log("ww: setNetwork end: ", networkId)
		return networkId
	} catch (err) {
		logError(err)
		notifyError('Failed to fetch balances', err)
		throw err
	}
})

export const fetchBalance = createAsyncThunk<
	{balancesInWallet: BalancesType; balancesInBank: BalancesType},
	void,
	ThunkConfig
>('wallet/fetchBalance', async (_, { extra: { sdk } }) => {
	try {
		const tokens = sdk.exchange.getTokensInfo([])
		const balancesInWallet = await sdk.wallet.balancesInWallet(tokens.map(e=>e.address))
		const balancesInBank = await sdk.wallet.balancesInBank(tokens.map(e=>e.address))
	
		return {balancesInBank, balancesInWallet}
	} catch (err) {
		logError(err)
		notifyError('Failed to fetch balances', err)
		throw err
	}
})

export const fetchBalanceSeries = createAsyncThunk<
	Record<number, BalancesType>,
	number,
	ThunkConfig
>('wallet/fetchBalanceSeries', async (timeSpanInDay, { extra: { sdk } }) => {
	try {
		const tokens = sdk.exchange.getTokensInfo([])

		const balanceSeries: Record<number, BalancesType> = {}

		const nowSec: number = Math.floor((new Date()).getTime() / 1000)

		for (let i = 0; i < timeSpanInDay - 1; i++) {
			const targetTimestamp = truncateTimestamp(nowSec - i * PERIOD_IN_SECONDS.ONE_DAY, PERIOD_IN_SECONDS.ONE_DAY)
			const balances = await sdk.wallet.balancesInBank(
				tokens.map(e=>e.address),
				targetTimestamp - nowSec
			)
			balanceSeries[targetTimestamp] = balances
		}

		return balanceSeries
	} catch (err) {
		notifyError('Failed to fetch historical balance series', err)
		throw err
	}
})

export const deposit = createAsyncThunk<
	void, 
	{amount: number, token: string}, 
	ThunkConfig
>('wallet/deposit', async ({amount, token}, { dispatch, extra: { sdk } }) => {
	monitorTransaction({
		transaction: () => sdk.wallet.deposit(token, amount),
		onTxConfirmed: () => {
			dispatch({ type: 'wallet/setDepositStatus', payload: FetchStatus.Success })
			dispatch(bundleFetchCurrentWalletData())
		},
		onTxFailed: () => {
			dispatch({ type: 'wallet/setDepositStatus', payload: FetchStatus.Error })
			dispatch(bundleFetchCurrentWalletData())
		},
	})
})

export const withdraw = createAsyncThunk<
	void, 
	{amount: number, token: string}, 
	ThunkConfig
>('wallet/withdraw', async ({amount, token}, { dispatch, extra: { sdk } }) => {
	monitorTransaction({
		transaction: () => sdk.wallet.withdraw(token, amount),
		onTxConfirmed: () => {
			dispatch({ type: 'wallet/setWithdrawStatus', payload: FetchStatus.Success })
			dispatch(bundleFetchCurrentWalletData())
		},
		onTxFailed: () => {
			dispatch({ type: 'wallet/setWithdrawStatus', payload: FetchStatus.Error })
			dispatch(bundleFetchCurrentWalletData())
		},
	})
})

export const approve = createAsyncThunk<
	void, 
	{amount: number, token: string}, 
	ThunkConfig
>('wallet/approve', async ({amount, token}, { dispatch, extra: { sdk } }) => {
	monitorTransaction({
		transaction: () => sdk.wallet.approve(token, amount),
		onTxConfirmed: () => {
			dispatch({ type: 'wallet/setApproveStatus', payload: FetchStatus.Success })
			dispatch(bundleFetchCurrentWalletData())
		},
		onTxFailed: () => {
			dispatch({ type: 'wallet/setApproveStatus', payload: FetchStatus.Error })
			dispatch(bundleFetchCurrentWalletData())
		},
	})
})

export const fetchAllowance = createAsyncThunk<
	AllowancesType, void, ThunkConfig
>('wallet/fetchAllowance', async (_, { extra: { sdk } }) => {
	try {
		const tokens = sdk.exchange.getTokensInfo([])
		const allowances = await sdk.wallet.allowance(tokens.map(e=>e.address))
		return allowances
	} catch (err) {
		logError(err)
		notifyError('Failed to fetch allowances data', err)
		throw err
	}
})

export const bundleFetchCurrentWalletData = createAsyncThunk<void, void, ThunkConfig>(
	'wallet/fetchMigrateData',
	async (_, { dispatch }) => {
		dispatch(fetchAllowance())
		dispatch(fetchBalance())
	}
)