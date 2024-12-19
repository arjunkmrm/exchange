import { PricesMap } from '@bitly/sdk/dist/types'
import { QueryStatus } from 'state/types'

export type PriceChange = 'up' | 'down' | null

export const pricesInfoKeys = new Set(['price'])

export type PricesQueryStatuses = {
	previousDayPrices: QueryStatus
}

export type PricesState = {
	onChainPrices: PricesMap
	connectionError: null | undefined
	previousDayPrices: PricesMap
	queryStatuses: PricesQueryStatuses
}
