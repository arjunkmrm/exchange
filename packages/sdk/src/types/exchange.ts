import { UnwrapPromise } from '../common/type';
import {BitlyExchange, ERC20, TokenExchange} from '../contracts/typechain-types';

export type TokenInfoType = UnwrapPromise<ReturnType<BitlyExchange['tokenInfo']>>;
export type TokenInfoTypeWithAddress = UnwrapPromise<ReturnType<BitlyExchange['tokenInfo']>> & {address: string};

export type PairTotalVolumeType = UnwrapPromise<ReturnType<TokenExchange['totalVolume']>>;

export type MarketsVolumes = {
    [market: string]: number;
};

export type ExchangePairsType = UnwrapPromise<ReturnType<BitlyExchange['pairs']>>;

export type ExchangeMarketType = {
    marketAddress: string;
    displayName: string;
    tokenX: TokenInfoTypeWithAddress;
    tokenY: TokenInfoTypeWithAddress;
};

export type PairLimitOrdersType = UnwrapPromise<ReturnType<TokenExchange['limitOrders']>>;

export type PairLimitOrderType = UnwrapPromise<ReturnType<TokenExchange['limitOrders']>>[number];

export type PairEarningsType = UnwrapPromise<ReturnType<TokenExchange['queryEarning']>>;

export type PointOrderType = UnwrapPromise<ReturnType<TokenExchange['pointOrder']>>;

type OrderInfo = {
	price: number;
	amount: number;
};

export type PriceRange = {
	low: number;
	high: number;
};

export type OrderbookType = {
	asks: OrderInfo[];
	bids: OrderInfo[];
};

export type PairEarningsTypeWithOrderInfo = PairLimitOrderType & {
    sold: number;
    earned: number;
    selling: number;
	price: number;
    direction: OrderDirection;
};

export type ExchangeOrderDetails = {
    [market: string]: PairEarningsTypeWithOrderInfo[];
};

export type BalanceType = UnwrapPromise<ReturnType<ERC20['balanceOf']>>;

export type AllowanceType = UnwrapPromise<ReturnType<ERC20['allowance']>>;

export enum OrderDirection {
    buy = 'BUY',
    sell = 'SELL'
};

export type MarketEventSignature = keyof TokenExchange['filters'];

export type ExchangeEarningType = {
	price: number;
	direction: OrderDirection;
	volume: number;
	timestamp: number;
	txn: string;
};

export type ExchangeOrdersType = {
	[market: string]: ExchangeEarningType[]
};