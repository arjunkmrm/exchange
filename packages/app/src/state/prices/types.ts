import { PricesMap } from '@bitly/sdk/dist/types'
import { QueryStatus } from 'state/types'

export type PriceChange = 'up' | 'down' | null

export const pricesInfoKeys = new Set(['price'])

export type PricesQueryStatuses = {
	previousDayPrices: QueryStatus,
	pricesSeries: QueryStatus,
}

export type PricesState = {
	onChainPrices: PricesMap
	previousDayPrices: PricesMap
	pricesSeries: Record<number, PricesMap>
	connectionError: null | undefined
	queryStatuses: PricesQueryStatuses
}
