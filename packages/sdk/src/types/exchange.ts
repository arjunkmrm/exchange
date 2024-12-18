import { BigNumber } from 'ethers';
import { UnwrapPromise } from '../common/type';
import {BitlyExchange, ERC20, TokenExchange} from '../contracts/typechain-types';
import { EarningClaimedEventObject } from '../contracts/typechain-types/contracts/TokenExchange';

export type TokenInfoType = UnwrapPromise<ReturnType<BitlyExchange['tokenInfo']>>;
export type TokenInfoTypeWithAddress = UnwrapPromise<ReturnType<BitlyExchange['tokenInfo']>> & {address: string};

export type PairTotalVolumeType = UnwrapPromise<ReturnType<TokenExchange['totalVolume']>>;

export type MarketsVolumes = {
    [market: string]: BigNumber;
};

export type ExchangePairsType = UnwrapPromise<ReturnType<BitlyExchange['pairs']>>;

export type ExchangeMarketType = {
    marketAddress: string;
    displayName: string;
    tokenX: TokenInfoTypeWithAddress;
    tokenY: TokenInfoTypeWithAddress;
};

export type PairLimitOrdersType = UnwrapPromise<ReturnType<TokenExchange['limitOrders']>>;

export type PairEarningsType = UnwrapPromise<ReturnType<TokenExchange['queryEarning']>>;

export type PairEarningsTypeWithOrderInfo = PairLimitOrdersType & {
    sold: number,
    earned: number,
    selling: number
    direction: OrderDirection
};

export type ExchangeOrderDetails = {
    [market: string]: PairEarningsTypeWithOrderInfo[];
};

export type BalanceType = UnwrapPromise<ReturnType<ERC20['balanceOf']>>;

export enum OrderDirection {
    buy = 'BUY',
    sell = 'SELL'
};

export type MarketEventSignature = keyof TokenExchange['filters'];

export type ExchangeEarningType = {
	price: number;
	direction: OrderDirection;
	volume: number;
};

export type ExchangeOrdersType = {
	[market: string]: ExchangeEarningType[]
};