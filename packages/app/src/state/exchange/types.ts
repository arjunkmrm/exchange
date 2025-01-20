import { 
	ExchangeMarketType, 
	ExchangeOrderDetails, 
	MarketsVolumes, 
	OrderbookType, 
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
	orderbook: QueryStatus,
}

export type ExchangeFetchStatuses = {
	makeOrder: FetchStatus,
	claimEarning: Record<string, FetchStatus>,
	cancelOrder: Record<string, FetchStatus>,
	listToken: FetchStatus,
	listPair: FetchStatus,
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
	orderTotal: string,
	slippage: number,
	orderbookWidth: number,
	orderbooks: Record<string, OrderbookType>,
}
