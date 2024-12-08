import { Contract as EthCallContract } from 'ethcall'
import { Contract, ethers } from 'ethers'

import { NetworkId } from '../types/common'

import ERC20ABI from './abis/ERC20.json';
import BTLYABI from './abis/BTLY.json';
import BankABI from './abis/Bank.json';
import BitlyExchangeABI from './abis/BitlyExchange.json';
import TokenExchangeABI from './abis/TokenExchange.json';
import { ADDRESSES } from './constants'
import {
	ERC20__factory,
    BTLY__factory,
    Bank__factory,
    BitlyExchange__factory,
    TokenExchange__factory,
    BitlyExchange,
    Bank,
    BTLY
} from './types';

type ContractFactory = {
	connect: (address: string, provider: ethers.providers.Provider) => Contract
}

export type AllContractsMap = Record<
	ContractName,
	{ addresses: Partial<Record<NetworkId, string>>; Factory: ContractFactory }
>

export const getPerpsV2MarketMulticall = (marketAddress: string) =>
	new EthCallContract(marketAddress, BitlyExchangeABI)

export const getContractsByNetwork = async (
	networkId: NetworkId,
	provider: ethers.providers.Provider
) => {
    const Exchange: BitlyExchange | undefined = ADDRESSES.Bitly[networkId]
			? BitlyExchange__factory.connect(ADDRESSES.Bitly[networkId], provider)
			: undefined;
    const BankAddress = await Exchange?.bank();
    const BitlyBank: Bank | undefined = BankAddress
            ? Bank__factory.connect(BankAddress, provider)
            : undefined;
    const BTLYToken: BTLY | undefined = ADDRESSES.BTLYToken[networkId]
            ? BTLY__factory.connect(ADDRESSES.BTLYToken[networkId], provider)
            : undefined;
	return {
		Exchange,
        BitlyBank,
        BTLYToken,
		USDC: ADDRESSES.USDC[networkId]
			? ERC20__factory.connect(ADDRESSES.USDC[networkId], provider)
			: undefined,
		USDT: ADDRESSES.USDT[networkId]
			? ERC20__factory.connect(ADDRESSES.USDT[networkId], provider)
			: undefined,
	};
}

export const getMulticallContractsByNetwork = async (networkId: NetworkId) => {
    const Exchange = ADDRESSES.Bitly[networkId]
        ? new EthCallContract(ADDRESSES.Bitly[networkId], BitlyExchangeABI)
        : undefined;
    const BankAddress: string = await Exchange?.Bank();
	return {
        Exchange,
        BitlyBank: BankAddress
            ? new EthCallContract(BankAddress, BankABI)
			: undefined,
		BTLYToken: ADDRESSES.BTLYToken[networkId]
			? new EthCallContract(ADDRESSES.BTLYToken[networkId], BTLYABI)
			: undefined,
		USDC: ADDRESSES.USDC[networkId]
			? new EthCallContract(ADDRESSES.USDC[networkId], ERC20ABI)
			: undefined,
		USDT: ADDRESSES.USDT[networkId]
			? new EthCallContract(ADDRESSES.USDT[networkId], ERC20ABI)
			: undefined,
	}
}

export type ContractsMap = ReturnType<typeof getContractsByNetwork>
export type MulticallContractsMap = ReturnType<typeof getMulticallContractsByNetwork>
export type ContractName = keyof ContractsMap
