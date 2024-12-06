import { Contract as EthCallContract } from 'ethcall'
import { Contract, ethers } from 'ethers'

import { NetworkId } from '../types/common'

import ERC20ABI from './abis/ERC20.json'
import { ADDRESSES } from './constants'
import {
	ERC20__factory,
    BTLY__factory,
    Bank__factory,
    BitlyExchange__factory,
    TokenExchange__factory,
    BitlyExchange,
    Bank,
} from './types';

type ContractFactory = {
	connect: (address: string, provider: ethers.providers.Provider) => Contract
}

export type AllContractsMap = Record<
	ContractName,
	{ addresses: Partial<Record<NetworkId, string>>; Factory: ContractFactory }
>

export const getPerpsV2MarketMulticall = (marketAddress: string) =>
	new EthCallContract(marketAddress, PerpsV2MarketABI)

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
	return {
		Exchange,
        BitlyBank,
		USDC: ADDRESSES.USDC[networkId]
			? ERC20__factory.connect(ADDRESSES.USDC[networkId], provider)
			: undefined,
		USDT: ADDRESSES.USDT[networkId]
			? ERC20__factory.connect(ADDRESSES.USDT[networkId], provider)
			: undefined,
        BTLYToken: ADDRESSES.BTLYToken[networkId]
            ? BTLY__factory.connect(ADDRESSES.BTLYToken[networkId], provider)
			: undefined,
	};
}

export const getMulticallContractsByNetwork = (networkId: NetworkId) => {
	return {
		SynthRedeemer: ADDRESSES.SynthRedeemer[networkId]
			? new EthCallContract(ADDRESSES.SynthRedeemer[networkId], SynthRedeemerABI)
			: undefined,
		SynthUtil: ADDRESSES.SynthUtil[networkId]
			? new EthCallContract(ADDRESSES.SynthUtil[networkId], SynthUtilABI)
			: undefined,
		ExchangeRates: ADDRESSES.ExchangeRates[networkId]
			? new EthCallContract(ADDRESSES.ExchangeRates[networkId], ExchangeRatesABI)
			: undefined,
		FuturesMarketData: ADDRESSES.FuturesMarketData[networkId]
			? new EthCallContract(ADDRESSES.FuturesMarketData[networkId], FuturesMarketDataABI)
			: undefined,
		FuturesMarketSettings: ADDRESSES.FuturesMarketSettings[networkId]
			? new EthCallContract(ADDRESSES.FuturesMarketSettings[networkId], FuturesMarketSettingsABI)
			: undefined,
		PerpsV2MarketData: ADDRESSES.PerpsV2MarketData[networkId]
			? new EthCallContract(ADDRESSES.PerpsV2MarketData[networkId], PerpsV2MarketDataABI)
			: undefined,
		PerpsV2MarketSettings: ADDRESSES.PerpsV2MarketSettings[networkId]
			? new EthCallContract(ADDRESSES.PerpsV2MarketSettings[networkId], PerpsV2MarketSettingsABI)
			: undefined,
		StakingRewards: ADDRESSES.StakingRewards[networkId]
			? new EthCallContract(ADDRESSES.StakingRewards[networkId], StakingRewardsABI)
			: undefined,
		KwentaArrakisVault: ADDRESSES.KwentaArrakisVault[networkId]
			? new EthCallContract(ADDRESSES.KwentaArrakisVault[networkId], KwentaArrakisVaultABI)
			: undefined,
		RewardEscrow: ADDRESSES.RewardEscrow[networkId]
			? new EthCallContract(ADDRESSES.RewardEscrow[networkId], RewardEscrowABI)
			: undefined,
		KwentaStakingRewards: ADDRESSES.KwentaStakingRewards[networkId]
			? new EthCallContract(ADDRESSES.KwentaStakingRewards[networkId], KwentaStakingRewardsABI)
			: undefined,
		KwentaToken: ADDRESSES.KwentaToken[networkId]
			? new EthCallContract(ADDRESSES.KwentaToken[networkId], ERC20ABI)
			: undefined,
		MultipleMerkleDistributor: ADDRESSES.TradingRewards[networkId]
			? new EthCallContract(ADDRESSES.TradingRewards[networkId], MultipleMerkleDistributorABI)
			: undefined,
		MultipleMerkleDistributorPerpsV2: ADDRESSES.TradingRewardsPerpsV2[networkId]
			? new EthCallContract(
					ADDRESSES.TradingRewardsPerpsV2[networkId],
					MultipleMerkleDistributorPerpsV2ABI
			  )
			: undefined,
		MultipleMerkleDistributorStakingV2: ADDRESSES.TradingRewardsStakingV2[networkId]
			? new EthCallContract(
					ADDRESSES.TradingRewardsStakingV2[networkId],
					MultipleMerkleDistributorPerpsV2ABI
			  )
			: undefined,
		MultipleMerkleDistributorOp: ADDRESSES.OpRewards[networkId]
			? new EthCallContract(ADDRESSES.OpRewards[networkId], MultipleMerkleDistributorOpABI)
			: undefined,
		MultipleMerkleDistributorSnxOp: ADDRESSES.SnxOpRewards[networkId]
			? new EthCallContract(ADDRESSES.SnxOpRewards[networkId], MultipleMerkleDistributorOpABI)
			: undefined,
		vKwentaToken: ADDRESSES.vKwentaToken[networkId]
			? new EthCallContract(ADDRESSES.vKwentaToken[networkId], ERC20ABI)
			: undefined,
		veKwentaToken: ADDRESSES.veKwentaToken[networkId]
			? new EthCallContract(ADDRESSES.veKwentaToken[networkId], ERC20ABI)
			: undefined,
		SupplySchedule: ADDRESSES.SupplySchedule[networkId]
			? new EthCallContract(ADDRESSES.SupplySchedule[networkId], SupplyScheduleABI)
			: undefined,
		SystemStatus: ADDRESSES.SystemStatus[networkId]
			? new EthCallContract(ADDRESSES.SystemStatus[networkId], SystemStatusABI)
			: undefined,
		DappMaintenance: ADDRESSES.DappMaintenance[networkId]
			? new EthCallContract(ADDRESSES.DappMaintenance[networkId], DappMaintenanceABI)
			: undefined,
		SNXUSD: ADDRESSES.SNXUSD[networkId]
			? new EthCallContract(ADDRESSES.SNXUSD[networkId], ERC20ABI)
			: undefined,
		KwentaStakingRewardsV2: ADDRESSES.KwentaStakingRewardsV2[networkId]
			? new EthCallContract(ADDRESSES.KwentaStakingRewardsV2[networkId], KwentaStakingRewardsV2ABI)
			: undefined,
		RewardEscrowV2: ADDRESSES.RewardEscrowV2[networkId]
			? new EthCallContract(ADDRESSES.RewardEscrowV2[networkId], RewardEscrowV2ABI)
			: undefined,
		perpsV3MarketProxy: ADDRESSES.PerpsV3MarketProxy[networkId]
			? new EthCallContract(ADDRESSES.PerpsV3MarketProxy[networkId], PerpsV3MarketProxyABI)
			: undefined,
		perpsV3AccountProxy: ADDRESSES.PerpsV3AccountProxy[networkId]
			? new EthCallContract(ADDRESSES.PerpsV3AccountProxy[networkId], PerpsV3AccountProxyABI)
			: undefined,
		EscrowMigrator: ADDRESSES.EscrowMigrator[networkId]
			? new EthCallContract(ADDRESSES.EscrowMigrator[networkId], EscrowMigratorABI)
			: undefined,
		BoostNft: ADDRESSES.BoostNft[networkId]
			? new EthCallContract(ADDRESSES.BoostNft[networkId], BoostNftABI)
			: undefined,
		SUSD: ADDRESSES.SUSD[networkId]
			? new EthCallContract(ADDRESSES.SUSD[networkId], ERC20ABI)
			: undefined,
		USDC: ADDRESSES.USDC[networkId]
			? new EthCallContract(ADDRESSES.USDC[networkId], ERC20ABI)
			: undefined,
		USDT: ADDRESSES.USDT[networkId]
			? new EthCallContract(ADDRESSES.USDT[networkId], ERC20ABI)
			: undefined,
		DAI: ADDRESSES.DAI[networkId]
			? new EthCallContract(ADDRESSES.DAI[networkId], ERC20ABI)
			: undefined,
		LUSD: ADDRESSES.LUSD[networkId]
			? new EthCallContract(ADDRESSES.LUSD[networkId], ERC20ABI)
			: undefined,
	}
}

export type ContractsMap = ReturnType<typeof getContractsByNetwork>
export type MulticallContractsMap = ReturnType<typeof getMulticallContractsByNetwork>
export type ContractName = keyof ContractsMap
