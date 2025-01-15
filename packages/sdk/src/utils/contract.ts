import { BlockTag } from "ethcall";
import { CallOverrides } from "ethcall/lib/call";
import BitlySDK from "..";
import { UNDEFINED_CONTRACT_ADDRESS_IN_CONSTANT } from "../common/errors";
import { DEFAULT_MULTICALL_BATCH_SIZE } from "../constants/transactions";
import { 
    BankFuncNames, 
    BTLYFuncNames, 
    ERC20FuncNames, 
    ExchangeFuncNames, 
    getPairContract, 
	getPairContractInterface, 
    getPairContractMulticall, 
    getTokenContract, 
    getTokenContractMulticall, 
    PairFuncNames 
} from "../contracts";
import { ExchangeMarketType, ExchangePairsType, MarketEventSignature, TokenInfoType, TokenInfoTypeWithAddress } from "../types";
import { MultiCallArgs, SingleCallArgs } from "../types/common";

export async function ERC20ReadContracts(
    sdk: BitlySDK, addresses: string[], funcNames: ERC20FuncNames[], args: MultiCallArgs = [[]], 
    override?: CallOverrides | undefined
): Promise<any[]> {
    const calls = [];
    for (const address of addresses) {
        for (const funcName of funcNames) {
            for (const arg of args) {
                const func = getTokenContractMulticall(address)[funcName];
                calls.push(func(...arg));
            }
        }
    }

    return await sdk.context.multicallProvider.tryAll(calls, override);
}

export async function ERC20WriteContract(sdk: BitlySDK, token: string, funcName: ERC20FuncNames, 
    arg: SingleCallArgs = []
) {
    const contract = getTokenContract(token, sdk.context.provider);
	return await sdk.transactions.createContractTxn(contract, funcName, arg);
}

export async function ExchangeReadContracts(sdk: BitlySDK, funcNames: ExchangeFuncNames[], args: MultiCallArgs = [[]], 
    override?: CallOverrides | undefined
): Promise<any[]> {
    const calls = [];
    for (const funcName of funcNames) {
        for (const arg of args) {
            const func = sdk.context.multicallContracts?.Exchange?.[funcName];
            calls.push(func(...arg));
        }
    }

    return await sdk.context.multicallProvider.tryAll(calls, override);
}

export async function ExchangeWriteContract(sdk: BitlySDK, funcName: ExchangeFuncNames, arg: SingleCallArgs = []) {
	const contract = sdk.context.contracts?.Exchange;
	if (!contract) {
        throw new Error(UNDEFINED_CONTRACT_ADDRESS_IN_CONSTANT);
    }
	return await sdk.transactions.createContractTxn(contract, funcName, arg);
}

export async function PairReadContracts(sdk: BitlySDK, addresses: string[], funcNames: PairFuncNames[], 
    args: MultiCallArgs = [[]], override?: CallOverrides | undefined
): Promise<any[]> {
	const totalCalls = addresses.length * funcNames.length * args.length;
	let ret: any[] = [];

	const batchCnt = Math.floor(totalCalls / DEFAULT_MULTICALL_BATCH_SIZE) + 1;
	for (let batchIndex = 0; batchIndex < batchCnt; batchIndex ++) {
		const calls = [];
		let cnt = 0;
		for (const address of addresses) {
			for (const funcName of funcNames) {
				for (const arg of args) {
					if (cnt < batchIndex * DEFAULT_MULTICALL_BATCH_SIZE ||
						cnt >= (batchIndex + 1) * DEFAULT_MULTICALL_BATCH_SIZE) {
						cnt ++;
						continue;
					}
					cnt ++;
					const func = getPairContractMulticall(address)[funcName];
					calls.push(func(...arg));
				}
			}
		}
		const res = await sdk.context.multicallProvider.tryAll(calls, override);
		ret = ret.concat(res);
	}
	return ret;
}

export async function PairWriteContract(sdk: BitlySDK, market: string, funcName: PairFuncNames, 
    arg: SingleCallArgs = []
) {
	const contract = getPairContract(market, sdk.context.provider);
	return await sdk.transactions.createContractTxn(contract, funcName, arg);
}

export async function BankReadContracts(sdk: BitlySDK, funcNames: BankFuncNames[], args: MultiCallArgs = [[]], 
    override?: CallOverrides | undefined
): Promise<any[]> {
    const calls = [];
    for (const funcName of funcNames) {
        for (const arg of args) {
            const func = sdk.context.multicallContracts?.BitlyBank?.[funcName];
            calls.push(func(...arg));
        }
    }

    return await sdk.context.multicallProvider.tryAll(calls, override);
}

export async function BankWriteContract(sdk: BitlySDK, funcName: BankFuncNames, arg: SingleCallArgs = []) {
	const contract = sdk.context.contracts?.BitlyBank;
	if (!contract) {
        throw new Error(UNDEFINED_CONTRACT_ADDRESS_IN_CONSTANT);
    }
	return await sdk.transactions.createContractTxn(contract, funcName, arg);
}

export async function BTLYReadContracts(sdk: BitlySDK, funcNames: BTLYFuncNames[], args: MultiCallArgs = [[]], 
    override?: CallOverrides | undefined
): Promise<any[]> {
    const calls = [];
    for (const funcName of funcNames) {
        for (const arg of args) {
            const func = sdk.context.multicallContracts?.BTLYToken?.[funcName];
            calls.push(func(...arg));
        }
    }

    return await sdk.context.multicallProvider.tryAll(calls, override);
}

export async function BTLYWriteContract(sdk: BitlySDK, funcName: BTLYFuncNames, arg: SingleCallArgs = []) {
	const contract = sdk.context.contracts?.BTLYToken;
	if (!contract) {
        throw new Error(UNDEFINED_CONTRACT_ADDRESS_IN_CONSTANT);
    }
	return await sdk.transactions.createContractTxn(contract, funcName, arg);
}

export async function getMarketLog(sdk: BitlySDK, market: string, fromBlock: BlockTag, toBlock: BlockTag, event: MarketEventSignature, 
	args: any[] = []
) {
	const filters = getPairContract(market, sdk.context.provider).filters[event](...args);
	const logs = await sdk.context.provider.getLogs({
		...filters,
		fromBlock,
		toBlock
	});

	const iface = getPairContractInterface();
	const parsedLogs = logs.map(log=>{
		return {
			... iface.parseLog(log),
			...log,
		}
	});

	return parsedLogs;
}

export async function internalFetchMarketsAndTokens(sdk: BitlySDK, marketName: string = "") {
	const pairs: ExchangePairsType[] = await ExchangeReadContracts(sdk, ['pairs'], [[marketName]]);

	if (!pairs) {
		return {markets:[], tokens: []};
	}

	const tokensSet = new Set<string>();
	for (const pair of pairs[0]) {
		tokensSet.add(pair.tokenX);
		tokensSet.add(pair.tokenY);
	}

	const tokenInfos: TokenInfoType[] = await ExchangeReadContracts(sdk, ['tokenInfo'], Array.from(tokensSet).map(e=>([e])));
	const tokens: TokenInfoTypeWithAddress[] = [];
	const tokensObj: Record<string, TokenInfoType> = {};
	const tokensList = Array.from(tokensSet);
	for (let i = 0; i < tokenInfos.length; i++) {
		const info = tokenInfos[i];
		const address = tokensList[i];
		tokensObj[address] = info;
		tokens.push({ ...info, address } as TokenInfoTypeWithAddress);
	}

	const markets: ExchangeMarketType[] = [];

	for (let i = 0; i < pairs[0].length; i++) {
		const pair = pairs[0][i];

		const tokenXInfo = { ...tokensObj[pair.tokenX], address: pair.tokenX } as TokenInfoTypeWithAddress;
		const tokenYInfo = { ...tokensObj[pair.tokenY], address: pair.tokenY } as TokenInfoTypeWithAddress;
		markets.push({
			marketAddress: pair.pair,
			displayName: `${tokenXInfo.symbol}/${tokenYInfo.symbol}`,
			tokenX: tokenXInfo,
			tokenY: tokenYInfo,
		});
	}

	return {markets, tokens};
}