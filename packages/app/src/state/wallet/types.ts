import { AllowancesType, BalancesType } from "@bitly/sdk/dist/types";
import { FetchStatus, QueryStatus } from "state/types";

export type WalletQueryStatuses = {
	balanceSeries: QueryStatus,
	balances: QueryStatus,
	allowance: QueryStatus,
}

export type WalletWriteStatuses = {
	deposit: FetchStatus,
	withdraw: FetchStatus,
	approve: FetchStatus,
}

export type WalletState = {
	walletAddress?: string
	networkId?: number
	balanceInWallet: BalancesType
	balanceInBank: BalancesType
	allowances: AllowancesType
	balanceSeries: Record<number, BalancesType>
	queryStatuses: WalletQueryStatuses
	writeStatuses: WalletWriteStatuses
}
