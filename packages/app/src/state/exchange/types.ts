import { 
	ExchangeMarketType, 
	ExchangeOrderDetails, 
	MarketsVolumes, 
	TokenInfoTypeWithAddress 
} from "@bitly/sdk/dist/types"
import { QueryStatus } from "state/types"

export type ExchangeQueryStatuses = {
	markets: QueryStatus,
	dailyVolumes: QueryStatus,
	tokenList: QueryStatus,
	openOrders: QueryStatus,
}

export type ExchangeState = {
	markets: Record<number, ExchangeMarketType[]>,
	tokensMap: Record<number, TokenInfoTypeWithAddress[]>,
	openOrders: Record<number, ExchangeOrderDetails>,
	selectedMarketAsset: string,
	dailyMarketVolumes: Record<number, MarketsVolumes>,
	queryStatuses: ExchangeQueryStatuses,
}
