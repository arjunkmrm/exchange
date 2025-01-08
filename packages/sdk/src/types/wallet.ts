import { UnwrapPromise } from "../common/type";
import { ERC20 } from "../contracts/typechain-types";

export type BalancesType = {
	[token: string]: number;
};

export type AllowancesType = BalancesType;

export type TokenSymbolType = UnwrapPromise<ReturnType<ERC20['symbol']>>;

export type TokenNameType = UnwrapPromise<ReturnType<ERC20['name']>>;

export type TokenDecimalType = UnwrapPromise<ReturnType<ERC20['decimals']>>;