export type TruncateUnits = 1e3 | 1e6 | 1e9 | 1e12

type TruncatedOptions = {
	truncateOver?: TruncateUnits
	truncation?: {
		// Maybe remove manual truncation params
		unit: string
		divisor: number
		decimals: number
	}
}

export type FormatNumberOptions = {
	minDecimals?: number
	maxDecimals?: number
	prefix?: string
	suffix?: string
	suggestDecimals?: boolean
	suggestDecimalsForAsset?: string
} & TruncatedOptions

export type FormatCurrencyOptions = {
	minDecimals?: number
	maxDecimals?: number
	sign?: string
	currencyKey?: string
	suggestDecimals?: boolean
	suggestDecimalsForAsset?: string
} & TruncatedOptions

export type BalanceDataType = {
	address: string
	logo: string
	name: string
	symbol: string
	balanceInBank: number
	balanceInWallet: number
}
