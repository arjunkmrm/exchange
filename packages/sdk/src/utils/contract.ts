import { BlockTag } from "ethcall";
import { CallOverrides } from "ethcall/lib/call";
import BitlySDK from "..";
import { UNDEFINED_CONTRACT_ADDRESS_IN_CONSTANT } from "../common/errors";
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
import { MarketEventSignature } from "../types";
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
    const calls = [];
    for (const address of addresses) {
        for (const funcName of funcNames) {
            for (const arg of args) {
                const func = getPairContractMulticall(address)[funcName];
                calls.push(func(...arg));
            }
        }
    }

    return await sdk.context.multicallProvider.tryAll(calls, override);
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