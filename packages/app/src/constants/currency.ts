import keyBy from 'lodash/keyBy'

export type CurrencyKey = string

// TODO: standardize this
export type Category = 'crypto' | 'forex' | 'equities' | 'index' | 'commodity' | 'inverse'

export const CATEGORY: Category[] = ['crypto', 'forex', 'equities', 'index', 'commodity', 'inverse']
export const CATEGORY_MAP = keyBy(CATEGORY)

export const LSE_SYNTHS = new Set<CurrencyKey>([])

export const TSE_SYNTHS = new Set<CurrencyKey>([])

export const AFTER_HOURS_SYNTHS: Set<CurrencyKey> = new Set([])

export const MARKET_HOURS_SYNTHS = new Set([
	...LSE_SYNTHS,
	...TSE_SYNTHS,
	...AFTER_HOURS_SYNTHS,
])

// Commodity synths are not listed in the CurrencyKey currently. This is a temporary workaround.
export const COMMODITY_SYNTHS = new Set<CurrencyKey | 'XAU' | 'XAG' | 'WTI'>(['XAU', 'XAG', 'WTI'])

export const INDEX_SYNTHS = new Set<CurrencyKey | 'DebtRatio'>(['DebtRatio'])

export const DecimalsForAsset: Record<string, number> = {
}