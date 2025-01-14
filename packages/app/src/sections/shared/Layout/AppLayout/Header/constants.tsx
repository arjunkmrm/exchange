import { FunctionComponent } from 'react'
import { EXTERNAL_LINKS } from 'constants/links'
import ROUTES from 'constants/routes'

export type Badge = {
	i18nLabel: string
	color: 'yellow' | 'red' | 'gray'
}

export type SubMenuLink = {
	i18nLabel: string
	link: string
	badge?: Badge[]
	Icon?: FunctionComponent<any>
	externalLink?: boolean
}

export type MenuLink = {
	i18nLabel: string
	link: string
	links?: SubMenuLink[] | null
	hidden?: boolean
}

export type MenuLinks = MenuLink[]

export const HOMEPAGE_MENU_LINKS: MenuLinks = [
	{
		i18nLabel: 'homepage.nav.markets',
		link: ROUTES.Dashboard.Markets,
	},
	{
		i18nLabel: 'homepage.nav.governance.title',
		link: ROUTES.Home.Root,
	},
	{
		i18nLabel: 'homepage.nav.blog',
		link: EXTERNAL_LINKS.Website.Blogs,
	},
]

const MANAGE_LINKS = [
	{
		link: ROUTES.Manage.ListToken,
		i18nLabel: 'manage.tabs.list-token',
	},
	{
		link: ROUTES.Manage.ListPair,
		i18nLabel: 'manage.tabs.list-pair',
	},
	{
		link: ROUTES.Manage.Custom,
		i18nLabel: 'manage.tabs.custom',
	},
]

export const getMenuLinks = (isMobile: boolean): MenuLinks => [
	{
		i18nLabel: 'header.nav.markets',
		link: ROUTES.Dashboard.Markets,
	},
	{
		i18nLabel: 'header.nav.wallet',
		link: ROUTES.Wallet.Home,
		links: null,
	},
	{
		i18nLabel: 'header.nav.manage',
		link: ROUTES.Manage.Home,
		links: isMobile ? MANAGE_LINKS : null,
	},
]

export const DESKTOP_NAV_LINKS = getMenuLinks(false).filter((m) => !m.hidden)
export const MOBILE_NAV_LINKS = getMenuLinks(true).filter((m) => !m.hidden)

export const MENU_LINKS_WALLET_CONNECTED: MenuLinks = []
