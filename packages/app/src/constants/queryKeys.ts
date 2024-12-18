import { Period } from '@bitly/sdk/constants'

import { CurrencyKey } from './currency'

export const QUERY_KEYS = {
	Rates: {
		HistoricalVolume: (period: Period, networkId: number) => [
			'rates',
			'historicalVolume',
			period,
			networkId,
		],
		HistoricalRates: (currencyKey: string, period: Period, networkId: number) => [
			'rates',
			'historicalRates',
			currencyKey,
			period,
			networkId,
		],
		MarketCap: (currencyKey: string) => ['marketCap', currencyKey],
		ExchangeRates: ['rates', 'exchangeRates'],
		PastRates: (networkId: number, assets: (CurrencyKey)[]) => [
			'rates',
			'pastRates',
			networkId,
			assets,
		],
		ExternalPrice: (currencyKey: string) => ['rates', 'externalPrice', currencyKey],
		Candlesticks: (currencyKey: string, period: Period) => [
			'rates',
			'candlesticks',
			currencyKey,
			period,
		],
		PeriodStartSynthRate: (currencyKey: CurrencyKey, period: Period) => [
			'rates',
			'latestSynthRate',
			currencyKey,
			period,
		],
	},
	Network: {
		EthGasPrice: ['network', 'ethGasPrice'],
		ENSNames: (addresses: string[]) => ['network', 'ensNames', addresses],
		ENSAvatar: (ensName?: string | null) => ['network', 'ensNames', ensName],
	},
	WalletBalances: {
		Synths: (walletAddress: string, networkId: number) => [
			'walletBalances',
			'synths',
			walletAddress,
			networkId,
		],
		ETH: (walletAddress: string, networkId: number) => [
			'walletBalances',
			'ETH',
			walletAddress,
			networkId,
		],
		Tokens: (walletAddress: string | null, networkId: number, tokenAddresses: string) => [
			'walletBalances',
			'tokens',
			walletAddress,
			networkId,
			tokenAddresses,
		],
	},
	Synths: {
		Balances: (networkId: number, walletAddress: string | null) => [
			'synths',
			'balances',
			networkId,
			walletAddress,
		],
		FrozenSynths: ['synths', 'frozenSynths'],
		Suspension: (currencyKey: CurrencyKey) => ['synths', 'suspension', currencyKey],
		ExchangeFeeRate: (sourceCurrencyKey: CurrencyKey, destinationCurrencyKey: CurrencyKey) => [
			'synths',
			'exchangeFeeRate',
			sourceCurrencyKey,
			destinationCurrencyKey,
		],
		BaseFeeRate: (sourceCurrencyKey: CurrencyKey, destinationCurrencyKey: CurrencyKey) => [
			'synths',
			'baseFeeRate',
			sourceCurrencyKey,
			destinationCurrencyKey,
		],
		NumEntries: (walletAddress: string, currencyKey: CurrencyKey) => [
			'synths',
			'numEntries',
			walletAddress,
			currencyKey,
		],
		TradingVolumeForAllSynths: (networkId: number) => ['synths', 'tradingVolume', networkId],
	},
	Collateral: {
		ShortHistory: (walletAddress: string, networkId: number) => [
			'collateral',
			'short',
			'history',
			walletAddress,
			networkId,
		],
		ShortContractInfo: ['collateral', 'short', 'contractInfo'],
		ShortPosition: (loanId: string) => ['collateral', 'short', 'position', loanId],
		ShortPositionPnL: (loanId: string) => ['collateral', 'short', 'position', 'pnl', loanId],
		ShortRewards: (currencyKey: string) => ['collateral', 'short', 'rewards', currencyKey],
		ShortRate: (currencyKey: string) => ['collateral', 'short', 'rate', currencyKey],
		ShortStats: (currencyKey: string) => ['collateral', 'short', 'stats', currencyKey],
	},
	Trades: {
		AllTrades: ['trades', 'allTrades'],
		WalletTrades: (walletAddress: string, networkId: number) => [
			'trades',
			'walletTrades',
			walletAddress,
			networkId,
		],
	},
	SystemStatus: {
		IsUpgrading: ['systemStatus', 'isUpgrading'],
	},
	Convert: {
		quote1Inch: (
			quoteCurrencyKey: string | undefined,
			baseCurrencyKey: string | undefined,
			amount: string,
			synthUsdRate: number,
			networkId: number
		) => ['convert', '1inch', quoteCurrencyKey, baseCurrencyKey, amount, networkId, synthUsdRate],
		quoteSynthSwap: (
			quoteCurrencyKey: string | undefined,
			baseCurrencyKey: string | undefined,
			amount: string,
			networkId: number
		) => ['convert', 'synthSwap', quoteCurrencyKey, baseCurrencyKey, amount, networkId],
		approveAddress1Inch: ['convert', '1inch', 'approve', 'address'],
	},
	TokenLists: {
		Synthetix: ['tokenLists', 'synthetix'],
		Zapper: ['tokenLists', 'zapper'],
		OneInch: (networkId: number) => ['tokenLists', 'oneInch', networkId],
	},
	CMC: {
		Quotes: (currencyKeys: string[]) => ['cmc', 'quotes', currencyKeys.join('|')],
	},
	CoinGecko: {
		CoinList: ['cg', 'coinList'],
		Prices: (priceIds: string[]) => ['cg', 'prices', priceIds.join('|')],
		Price: (priceId: string) => ['cg', 'price', priceId],
		TokenPrices: (tokenAddresses: string[], platform: string) => [
			'cg',
			'prices',
			tokenAddresses.join('|'),
			platform,
		],
	},
	Futures: {
		DayTradeStats: (networkId: number, currencyKey: string | null) => [
			'futures',
			'dayTradeStats',
			networkId,
			currencyKey,
		],
		Market: (networkId: number, currencyKey: string | null) => [
			'futures',
			currencyKey,
			networkId,
		],
		Trades: (networkId: number, currencyKey: string) => [
			'futures',
			'trades',
			networkId,
			currencyKey,
		],
		TradesAccount: (
			networkId: number,
			currencyKey: string | null,
			account: string | null,
			selectedAccountType: string
		) => ['futures', 'trades', networkId, currencyKey, account, selectedAccountType],
		AllTradesAccount: (networkId: number, account: string | null) => [
			'futures',
			'trades',
			networkId,
			account,
		],
		MarketClosure: (networkId: number, currencyKey: string | null) => [
			'futures',
			'closures',
			networkId,
			currencyKey,
		],
		OpenInterest: (currencyKeys: string[]) => ['futures', 'openInterest', currencyKeys],
		TradingVolume: (networkId: number, currencyKey: string | null) => [
			'futures',
			'tradingVolume',
			networkId,
			currencyKey,
		],
		MarginTransfers: (
			networkId: number,
			walletAddress: string | null,
			marketAddress: string | null
		) => ['futures', 'futuresMarginTransfers', networkId, walletAddress, marketAddress],
		FundingRate: (networkId: number, currencyKey: string | null) => [
			'futures',
			'fundingRates',
			networkId,
			currencyKey,
		],
		TradingVolumeForAll: (networkId: number) => ['futures', 'tradingVolumeForAll', networkId],
		Position: (networkId: number, market: string | null, walletAddress: string) => [
			'futures',
			'position',
			networkId,
			market,
			walletAddress,
		],
		PositionHistory: (walletAddress: string | null, networkId: number) => [
			'futures',
			'accountPositions',
			walletAddress,
			networkId,
		],
		Participants: () => ['futures', 'participants'],
		Participant: (walletAddress: string) => ['futures', 'participant', walletAddress],
		Stats: (networkId: number) => ['futures', 'stats', networkId],
		Leaderboard: (networkId: number, searchTerm: string) => [
			'futures',
			'leaderboard',
			networkId,
			searchTerm,
		],
		AverageLeverage: ['futures', 'averageLeverage'],
		CumulativeVolume: ['futures', 'cumulativeVolume'],
		TotalLiquidations: ['futures', 'totalLiquidations'],
		TotalTrades: (networkId: number) => ['futures', 'totalTrades', networkId],
		TotalVolume: ['futures', 'totalVolume'],
		MarketLimit: (networkId: number, market: string | null) => [
			'futures',
			'marketLimit',
			networkId,
			market,
		],
		OpenOrders: (networkId: number, walletAddress: string | null) => [
			'futures',
			'openOrders',
			networkId,
			walletAddress,
		],
		LatestUpdate: (networkId: number, market: string | null) => [
			'futures',
			'latestUpdate',
			networkId,
			market,
		],
		OverviewStats: (networkId: number) => ['futures', 'overview-stats', networkId],
	},
	Files: {
		Get: (fileName: string) => ['files', 'get', fileName],
		GetMultiple: (fileNames: string[]) => ['files', 'getMultiple', fileNames],
	},
	Staking: {
		TotalFuturesFee: (start: number, end: number) => [
			'staking',
			'rewards',
			'total-futures-fee',
			start,
			end,
		],
		FuturesFee: (walletAddress: string | null, start: number, end: number) => [
			'staking',
			'rewards',
			'futures-fee',
			walletAddress,
			start,
			end,
		],
	},
}

export default QUERY_KEYS
