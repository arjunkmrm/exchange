import { CurrencyKey } from './currency'

export const PROD_URL = 'https://token.bitly.exchange'

export const EXTERNAL_LINKS = {
	Trading: {
		Legacy: 'https://legacy.bitly.exchange/exchange',
		PerpsV1: 'https://v1.kwenta.eth.limo',
		DexAG: 'https://dex.ag/',
		Uniswap: 'https://uniswap.exchange/',
		OneInch: `https://1inch.exchange/`,
		OneInchApi: {
			ethereum: 'https://api.1inch.io/v5.0/1/',
			optimism: 'https://api.1inch.io/v5.0/10/',
		},
		OneInchLink: (from: CurrencyKey, to: CurrencyKey) => `https://1inch.exchange/#/${from}/${to}`,
		OptimismTokenBridge: 'https://gateway.optimism.io',
	},
	Synthetix: {
		Home: 'https://www.synthetix.io',
		Litepaper: 'https://docs.synthetix.io/litepaper/',
	},
	Social: {
		Twitter: 'https://twitter.com/bitly_exchange',
		Email: 'mailto:bitly.dex@gmail.com',
		GitHub: 'https://github.com/BitlyExchange',
	},
	Website: {
		Home: 'https://bitly.exchange',
		Blogs: 'https://bitly.exchange/blog',
	},
	TokenLists: {
		Zapper: 'https://zapper.fi/api/token-list',
	},
	Docs: {
		DocsRoot: 'https://docs.bitly.exchange/',
		FeeReclamation: 'https://docs.bitly.exchange/resources/fee-reclamation',
		HowToTrade: 'https://docs.bitly.exchange/products/futures',
		Governance: 'https://gov.kwenta.eth.limo',
		DaoRoles: 'https://gov.kwenta.eth.limo/sections/2',
		HowToUse: 'https://docs.bitly.exchange/onboard/how-to-start-using-kwenta',
		Perpetuals: 'https://docs.bitly.exchange/products/futures',
		Spot: 'https://docs.bitly.exchange/products/swaps ',
		DevDao: 'https://docs.bitly.exchange/dao/contribute/devdao-contribute',
		MarketingDao: 'https://gov.kwenta.eth.limo/sections/2/#marketingdao-grants-council-trial',
		Faq: 'https://docs.bitly.exchange/resources/faq',
		CrossMarginFaq: 'https://docs.bitly.exchange/using-kwenta/smart-margin/trading-on-kwenta/faq',
		Staking: 'https://docs.bitly.exchange/using-kwenta/staking-kwenta',
		TradingRewardsV2: 'https://mirror.xyz/kwenta.eth/7k-5UYXXcCNJ_DRRWvYBsK5zDm5UA945My4QrInhxoI',
		RewardsGuide: 'https://mirror.xyz/kwenta.eth/8KyrISnjOcuAX_VW-GxVqxpcbWukB_RlP5XWWMz-UGk',
		StakingV2Migration: 'https://docs.bitly.exchange/kwenta-token/v2-migration',
		Referrals: 'https://docs.bitly.exchange/using-kwenta/referral',
	},
	Optimism: {
		Home: 'https://optimism.io/',
	},
	Trade: {
		Markets: 'https://token.bitly.exchange/dashboard/markets',
	},
	Governance: {
		Kips: 'https://gov.kwenta.eth.limo/all-kips',
		Vote: 'https://snapshot.org/#/kwenta.eth',
	},
	Competition: {
		LearnMore: 'https://mirror.xyz/kwenta.eth/s_PO64SxvuwDHz9fdHebsYeQAOOc73D3bL2q4nC6LvU',
	},
	Referrals: {
		BoostNFT: 'https://opensea.io/assets/optimism/0xD3B8876073949D790AB718CAD21d9326a3adA60f',
	},
}
