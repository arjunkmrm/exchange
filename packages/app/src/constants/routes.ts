import { EXTERNAL_LINKS } from './links'

const prettyURLsDisabled = !!process.env.NEXT_PUBLIC_DISABLE_PRETTY_URLS

const normalizeRoute = (baseURL: string, path: string, queryParam: string) =>
	prettyURLsDisabled ? `${baseURL}?${queryParam}=${path}` : `${baseURL}/${path}`

export const formatUrl = (route: string, params: Record<string, string>) => {
	return route + '?' + new URLSearchParams(params)
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
	Markets: {
		Home: (asset: string) =>
			formatUrl('/market', { asset }),
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
