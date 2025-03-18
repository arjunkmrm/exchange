import { OrderDirection, TokenInfoTypeWithAddress } from '@bitly/sdk/types'
import { STABLE_COINS } from '@bitly/sdk/constants'
import { DecimalsForAsset } from 'constants/currency'
import { DEFAULT_CRYPTO_DECIMALS, DEFAULT_FIAT_DECIMALS, DEFAULT_NUMBER_DECIMALS } from 'constants/defaults'
import { FormatCurrencyOptions, FormatNumberOptions, OrderType } from 'types/common'

const thresholds = [
	{ value: 1e12, divisor: 1e12, unit: 'T', decimals: 2 },
	{ value: 1e9, divisor: 1e9, unit: 'B', decimals: 2 },
	{ value: 1e6, divisor: 1e6, unit: 'M', decimals: 2 },
	{ value: 1e3, divisor: 1e3, unit: 'K', decimals: 0 },
]

export const suggestedDecimals = (value: number) => {
	value = Math.abs(value)
	if (value >= 100000) return 0
	if (value >= 100 || value === 0) return 2
	if (value >= 10) return 3
	if (value >= 0.1) return 4
	if (value >= 0.01) return 5
	if (value >= 0.001) return 6
	if (value >= 0.0001) return 7
	if (value >= 0.00001) return 8
	return 11
}



export const formatPercent = (
	value: number,
	options?: { minDecimals?: number; suggestDecimals?: boolean; maxDecimals?: number }
) => {
	let decimals = options?.suggestDecimals ? suggestedDecimals(value) : options?.minDecimals ?? 2
	if (options?.maxDecimals) {
		decimals = Math.min(decimals, options.maxDecimals)
	}
	if (options?.minDecimals) {
		decimals = Math.max(decimals, options.minDecimals)
	}
	return `${(value * 100).toFixed(decimals).toString()}%`
}


export const formatCryptoCurrency = (value: number, options?: FormatCurrencyOptions) =>
	formatNumber(value, {
		prefix: options?.sign,
		suffix: options?.currencyKey,
		minDecimals: options?.minDecimals ?? DEFAULT_CRYPTO_DECIMALS,
		...options,
	})

export const formatFiatCurrency = (value: number, options?: FormatCurrencyOptions) =>
	formatNumber(value, {
		...options,
		prefix: options?.sign,
		suffix: options?.currencyKey,
		minDecimals: options?.minDecimals ?? DEFAULT_FIAT_DECIMALS,
	})

export const formatCurrency = (
	currencyKey: string,
	value: number,
	options?: FormatCurrencyOptions
) =>
	currencyKey == 'USD'
		? formatFiatCurrency(value, options)
		: formatCryptoCurrency(value, options)

export const formatDollars = (value: number, options?: FormatCurrencyOptions) =>
	formatCurrency('USD', value, { sign: '$', ...options })


export const formatNumber = (value: number, options?: FormatNumberOptions) => {
	const prefix = options?.prefix
	const suffix = options?.suffix
	const truncateThreshold = options?.truncateOver ?? 0
	let truncation = options?.truncation

	const isNegative = value < 0
	const formattedValue = []
	if (isNegative) {
		formattedValue.push('-')
	}
	if (prefix) {
		formattedValue.push(prefix)
	}

	// specified truncation params overrides universal truncate
	truncation =
		truncateThreshold && !truncation
			? thresholds.find(
					(threshold) => value >= threshold.value && value >= truncateThreshold
			  )
			: truncation

	const valueBeforeAsString = truncation ? Math.abs(value) / truncation.divisor : Math.abs(value)

	const defaultDecimals = getDecimalsForFormatting(valueBeforeAsString, { ...options, truncation })

	const decimals = options?.maxDecimals
		? Math.min(defaultDecimals, options.maxDecimals)
		: defaultDecimals

	const withCommas = commifyAndPadDecimals(valueBeforeAsString.toString(), decimals)

	formattedValue.push(withCommas)

	if (truncation) {
		formattedValue.push(truncation.unit)
	}

	if (suffix) {
		formattedValue.push(` ${suffix}`)
	}

	return formattedValue.join('')
}

const getDecimalsForFormatting = (value: number, options?: FormatNumberOptions) => {
	if (options?.truncation) return options?.truncation.decimals
	if (options?.suggestDecimalsForAsset) {
		const decimals = DecimalsForAsset[options.suggestDecimalsForAsset]
		return decimals ?? suggestedDecimals(value)
	}
	if (options?.suggestDecimals) return suggestedDecimals(value)
	return options?.minDecimals ?? DEFAULT_NUMBER_DECIMALS
}

export const commifyAndPadDecimals = (value: string, decimals: number) => {
	let formatted = value
	const comps = value.split('.')
	if (!decimals) return comps[0]
	comps[0] = commify(comps[0])

	if (comps.length === 2) {
		if (comps[1].length < decimals) {
			const zeros = '0'.repeat(decimals - comps[1].length)
			const decimalSuffix = `${comps[1]}${zeros}`
			formatted = `${comps[0]}.${decimalSuffix}`
		}
		if (comps[1].length > decimals) {
			const decimalSuffix = `${comps[1].substr(0, decimals)}`
			formatted = `${comps[0]}.${decimalSuffix}`
		}
	}
	return formatted
}

const commify = (num: string): string => 
    num.replace(/\B(?=(\d{3})+(?!\d))/g, ",")

export const getPairBasedOnStableCoin = (token: string, tokenInfo: TokenInfoTypeWithAddress, networkId: number) => {
	const stableCoins = STABLE_COINS[networkId.toString()]
	if (stableCoins.length == 0) {
		return null;
	}

	for (const stableCoin of stableCoins) {
		if (token == stableCoin) {
			return undefined;
		}
		for (const pairInfo of tokenInfo.pairs) {
			if (pairInfo.tokenY.toLowerCase() == stableCoin.toLowerCase()) {
				return pairInfo.pair;
			}
		}
	}

	return null;
};

export const orderPriceInvalidLabel = (
	orderPrice: number,
	side: OrderDirection,
	currentPrice: number,
	orderType: OrderType
): string | null => {
	if (!orderPrice || Number(orderPrice) <= 0) return null
	if (currentPrice === 0) return null
	const isLong = side === OrderDirection.buy
	if (
		(isLong && orderType === 'limit') &&
		orderPrice > currentPrice
	) {
		return 'max ' + formatNumber(currentPrice)
	}
	if (
		(!isLong && orderType === 'limit') &&
		orderPrice < currentPrice
	)
		return 'min ' + formatNumber(currentPrice)
	return null
}