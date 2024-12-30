import { 
	ExchangeMarketType, 
	ExchangeOrderDetails, 
	MarketsVolumes, 
	OrderDirection, 
	TokenInfoTypeWithAddress 
} from "@bitly/sdk/types"
import { FetchStatus, QueryStatus } from "state/types"
import { OrderType } from "types/common"

export type ExchangeQueryStatuses = {
	markets: QueryStatus,
	dailyVolumes: QueryStatus,
	tokenList: QueryStatus,
	openOrders: QueryStatus,
}

export type ExchangeFetchStatuses = {
	makeOrder: FetchStatus,
}

export type ExchangeState = {
	markets: Record<number, ExchangeMarketType[]>,
	tokensMap: Record<number, TokenInfoTypeWithAddress[]>,
	openOrders: Record<number, ExchangeOrderDetails>,
	selectedMarketAsset: string,
	dailyMarketVolumes: Record<number, MarketsVolumes>,
	queryStatuses: ExchangeQueryStatuses,
	writeStatuses: ExchangeFetchStatuses,
	orderType: OrderType,
	orderDirection: OrderDirection,
	orderPrice: string,
	orderSize: string,
	slippage: number,
}
