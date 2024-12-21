import { FetchStatus } from 'state/types'

// TODO: Separate balances by network and wallet

export type BalancesState = {
	status: FetchStatus
	error: string | undefined
	balancesMap: BalancesRecord
}

export type BalancesRecord = {
	[address: string]: number
}