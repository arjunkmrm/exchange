import { Contract as EthCallContract } from 'ethcall'
import { Contract, ethers } from 'ethers'

import ERC20ABI from './abi/contracts/ERC20.sol/ERC20Token.json';
import BTLYABI from './abi/contracts/BTLY.sol/BTLY.json';
import BankABI from './abi/contracts/Bank.sol/Bank.json';
import BitlyExchangeABI from './abi/contracts/BitlyExchange.sol/BitlyExchange.json';
import TokenExchangeABI from './abi/contracts/TokenExchange.sol/TokenExchange.json';
import { ADDRESSES } from './constants';
import {
    ERC20__factory,
    BTLY__factory,
    Bank__factory,
    BitlyExchange__factory,
    BitlyExchange,
    Bank,
    BTLY,
    TokenExchange__factory
} from './typechain-types';
import { UnwrapPromise } from '../common/type';

export * from './defines';

type ContractFactory = {
    connect: (address: string, provider: ethers.providers.Provider) => Contract
}

export type AllContractsMap = Record<
    ContractName,
    { addresses: Partial<Record<string, string>>; Factory: ContractFactory }
>

export const getPairContractMulticall = (marketAddress: string) =>
    new EthCallContract(marketAddress, TokenExchangeABI);

export const getPairContract = (marketAddress: string, provider: ethers.providers.Provider) =>
    TokenExchange__factory.connect(marketAddress, provider);

export const getPairContractInterface = () => new ethers.utils.Interface(TokenExchangeABI);

export const getTokenContractMulticall = (tokenAddress: string) =>
    new EthCallContract(tokenAddress, ERC20ABI);

export const getTokenContract = (tokenAddress: string, provider: ethers.providers.Provider) =>
    ERC20__factory.connect(tokenAddress, provider);

export const getContractsByNetwork = (
    networkId: number,
    provider: ethers.providers.Provider
) => {
    return {
        Exchange: (ADDRESSES.EXCHANGE[networkId.toString()]
            ? BitlyExchange__factory.connect(ADDRESSES.EXCHANGE[networkId.toString()], provider)
            : undefined) as BitlyExchange | undefined,
        BitlyBank: (ADDRESSES.BANK[networkId.toString()]
            ? Bank__factory.connect(ADDRESSES.BANK[networkId.toString()], provider)
            : undefined) as Bank | undefined,
        BTLYToken: (ADDRESSES.BTLY[networkId.toString()]
            ? BTLY__factory.connect(ADDRESSES.BTLY[networkId.toString()], provider)
            : undefined) as BTLY | undefined,
    };
}

export const getMulticallContractsByNetwork = (networkId: number) => {
    return {
        Exchange: ADDRESSES.EXCHANGE[networkId.toString()]
            ? new EthCallContract(ADDRESSES.EXCHANGE[networkId.toString()], BitlyExchangeABI)
            : undefined,
        BitlyBank: ADDRESSES.BANK[networkId.toString()]
            ? new EthCallContract(ADDRESSES.BANK[networkId.toString()], BankABI)
            : undefined,
        BTLYToken: ADDRESSES.BTLY[networkId.toString()]
            ? new EthCallContract(ADDRESSES.BTLY[networkId.toString()], BTLYABI)
            : undefined,
    }
}

export type ContractsMap = ReturnType<typeof getContractsByNetwork>
export type MulticallContractsMap = ReturnType<typeof getMulticallContractsByNetwork>
export type ContractName = keyof UnwrapPromise<ContractsMap>
export * from './constants'