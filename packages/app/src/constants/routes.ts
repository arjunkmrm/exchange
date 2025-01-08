import { EXTERNAL_LINKS } from './links'

const prettyURLsDisabled = !!process.env.NEXT_PUBLIC_DISABLE_PRETTY_URLS

const normalizeRoute = (baseURL: string, path: string, queryParam: string) =>
	prettyURLsDisabled ? `${baseURL}?${queryParam}=${path}` : `${baseURL}/${path}`

export const formatUrl = (route: string, params: Record<string, string>) => {
	return route + '?' + new URLSearchParams(params)
}

export enum MarketInfoTab {
	INFO = 'info',
	MARKET_HISTORY = 'market_history',
	MY_ORDERS = 'my_orders',
	MY_HISTORY = 'my_history',
}

export const ROUTES = {
	Home: {
		Root: '/',
	},
	Dashboard: {
		Home: '/dashboard',
		Overview: normalizeRoute('/dashboard', 'overview', 'tab'),
		History: normalizeRoute('/dashboard', 'history', 'tab'),
		Markets: normalizeRoute('/dashboard', 'markets', 'tab'),
		Earn: normalizeRoute('/dashboard', 'earn', 'tab'),
		Stake: normalizeRoute('/dashboard', 'staking', 'tab'),
		Rewards: normalizeRoute('/dashboard', 'rewards', 'tab'),
		Migrate: normalizeRoute('/dashboard', 'migrate', 'tab'),
		Redeem: normalizeRoute('/dashboard', 'redeem', 'tab'),
		TradingRewards: formatUrl('/dashboard/staking', { tab: 'trading-rewards' }),
	},
	Manage: {
		Home: '/manage/list-token',
		ListToken: '/manage/list-token',
		ListPair: '/manage/list-pair',
		ManageExchange: '/manage/manage-exchange',
	},
	Markets: {
		Home: (asset: string) =>
			formatUrl('/market', { asset }),
		Info: (asset: string) =>
			formatUrl('/market', { asset, tab: MarketInfoTab.INFO }),
		MarketHistory: (asset: string) =>
			formatUrl('/market', { asset, tab: MarketInfoTab.MARKET_HISTORY }),
		MyOrders: (asset: string) =>
			formatUrl('/market', { asset, tab: MarketInfoTab.MY_ORDERS }),
		MyHistory: (asset: string) =>
			formatUrl('/market', { asset, tab: MarketInfoTab.MY_HISTORY }),
	},
	Wallet: {
		Home: '/wallet',
		Asset: (address: string) => `/wallet/asset?address=${address}`,
	},
	Referrals: {
		Home: '/referrals',
		nftMint: (asset: string, ref: string) => formatUrl('/market', { asset, ref }),
	},
	NotFound: {
		Home: '/404'
	},
}

export const SUB_MENUS = {
	[ROUTES.Dashboard.Overview]: [
		{ label: 'Overview', link: '/dashboard/overview' },
		{ label: 'Markets', link: '/dashboard/markets' },
		// { label: 'Governance', link: '/governance' },
	],
	[ROUTES.Home.Root]: [
		{ label: 'Overview', link: EXTERNAL_LINKS.Docs.Governance },
		{ label: 'KIPs', link: EXTERNAL_LINKS.Governance.Kips },
	],
}

export const setLastVisited = (
	baseCurrencyPair: string,
): void => {
	localStorage.setItem('lastVisited', ROUTES.Markets.Home(baseCurrencyPair))
}

export default ROUTES
