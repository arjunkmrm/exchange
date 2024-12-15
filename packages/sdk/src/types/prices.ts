import { UnwrapPromise } from "../common/type";
import { BitlyExchange, TokenExchange } from "../contracts/typechain-types";

export type PairStartOffType = UnwrapPromise<ReturnType<TokenExchange['startOff']>>;

export type PairPointType = UnwrapPromise<ReturnType<TokenExchange['curPoint']>>;