import { 
	ExchangeMarketType, 
	MarketsVolumes, 
	TokenInfoTypeWithAddress 
} from "@bitly/sdk/dist/types"
import { QueryStatus } from "state/types"

export type ExchangeQueryStatuses = {
	markets: QueryStatus,
	dailyVolumes: QueryStatus,
	tokenList: QueryStatus,
}

export type ExchangeState = {
	markets: Record<string, ExchangeMarketType[]>,
	tokensMap: Record<string, TokenInfoTypeWithAddress[]>,
	selectedMarketAsset: string,
	dailyMarketVolumes: Record<string, MarketsVolumes>,
	queryStatuses: ExchangeQueryStatuses,
}
