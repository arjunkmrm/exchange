import { CustomMarketsInfoType, ExchangeMarketType, TokenInfoTypeWithAddress } from '@bitly/sdk/types'
import { FetchStatus, QueryStatus } from 'state/types'

export type ListPairState = {
	quoteToken: string
	baseToken: string
}

export type ManageQueryStatuses = {
	customMarkets: QueryStatus
	allTokens: QueryStatus
	allMarkets: QueryStatus
}

export type ManageWriteStatuses = {
	createMarket: FetchStatus
	addPairToMarket: FetchStatus
}

export type ManageState = {
	listPair: ListPairState
	customMarkets: CustomMarketsInfoType
	allTokens: TokenInfoTypeWithAddress[]
	allMarkets: ExchangeMarketType[]
	queryStatuses: ManageQueryStatuses
	writeStatuses: ManageWriteStatuses
}
