import { customMarketsInfoType, TokenInfoTypeWithAddress } from '@bitly/sdk/types'
import { QueryStatus } from 'state/types'

export type ListPairState = {
	quoteToken: string
	baseToken: string
}

export type ManageQueryStatuses = {
	customMarkets: QueryStatus
	allTokens: QueryStatus
}

export type ManageState = {
	listPair: ListPairState
	customMarkets: customMarketsInfoType
	allTokens: TokenInfoTypeWithAddress[]
	queryStatuses: ManageQueryStatuses
}
