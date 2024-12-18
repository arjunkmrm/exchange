import { UnwrapPromise } from "../common/type";
import { TokenExchange } from "../contracts/typechain-types";

export type PairStartOffType = UnwrapPromise<ReturnType<TokenExchange['startOff']>>;

export type PairPointType = UnwrapPromise<ReturnType<TokenExchange['curPoint']>>;

export type PricesListener = (updatedPrices: {
	prices: PricesMap
}) => void;

export type PricesMap = Record<string, number>;

export type CandleResult = {
	open: number,
	close: number,
	high: number,
	low: number,
	volume: number,
	symbol: string,
	time: string
};