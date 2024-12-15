import { GENERAL_INSTANCE } from "../constants";
import { Bank, BitlyExchange, BTLY, TokenExchange } from "./typechain-types";
import { ERC20 } from "./typechain-types";

export const MockERC20FuncInstance = GENERAL_INSTANCE as unknown as ERC20;
export type ERC20FuncNames = keyof typeof MockERC20FuncInstance;

export const MockExchangeFuncInstance = GENERAL_INSTANCE as unknown as BitlyExchange;
export type ExchangeFuncNames = keyof typeof MockExchangeFuncInstance['functions'];

export const MockPairFuncInstance = GENERAL_INSTANCE as unknown as TokenExchange;
export type PairFuncNames = keyof typeof MockPairFuncInstance['functions'];

export const MockBankFuncInstance = GENERAL_INSTANCE as unknown as Bank;
export type BankFuncNames = keyof typeof MockBankFuncInstance['functions'];

export const MockBTLYFuncInstance = GENERAL_INSTANCE as unknown as BTLY;
export type BTLYFuncNames = keyof typeof MockBTLYFuncInstance['functions'];