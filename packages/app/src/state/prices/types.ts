import { QueryStatus } from 'state/types'

export type PriceChange = 'up' | 'down' | null

export type PricesInfo = {
	price: number
	change: PriceChange
}

export const pricesInfoKeys = new Set(['price'])

export type PricesInfoMap = Partial<Record<string, PricesInfo>>

export type PricesQueryStatuses = {
	previousDayPrices: QueryStatus
}

export type PricesState = {
	onChainPrices: PricesInfoMap
	offChainPrices: PricesInfoMap
	connectionError: string | null | undefined
	previousDayPrices: PricesInfoMap
	queryStatuses: PricesQueryStatuses
}
