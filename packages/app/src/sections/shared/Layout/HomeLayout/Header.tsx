import Link from 'next/link'
import router from 'next/router'
import { useMemo, memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import ArrowUpRightIcon from 'assets/svg/app/arrow-up-right-tg.svg'
import CaretDownGrayIcon from 'assets/svg/app/caret-down-gray-slim.svg'
import TwitterLogo from 'assets/svg/marketing/twitter-icon.svg'
import EMailLogo from 'assets/svg/social/email.svg'
import { FlexDivRow, FlexDivRowCentered } from 'components/layout/flex'
import { GridDivCenteredCol } from 'components/layout/grid'
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media'
import { Body } from 'components/Text'
import { EXTERNAL_LINKS } from 'constants/links'
import ROUTES from 'constants/routes'
import RefButton from 'sections/shared/components/RefButton'

import MobileUserMenu from '../AppLayout/Header/MobileUserMenu'
import Logo from '../Logo'

export type TPages = 'landing-page' | 'stats-page'

const Header = memo(() => {
	const { t } = useTranslation()

	const LINKS = useMemo(
		() => [
			{
				id: 'market',
				label: t('homepage.nav.markets'),
				onClick: () => router.push(ROUTES.Dashboard.Markets),
			},
			// {
			// 	id: 'stats',
			// 	label: t('homepage.nav.stats'),
			// 	onClick: () => router.push(ROUTES.Stats.Home),
			// },
			// {
			// 	id: 'governance',
			// 	label: t('homepage.nav.governance.title'),
			// 	icon: <CaretDownGrayIcon />,
			// },
			{
				id: 'socials',
				label: t('homepage.nav.socials.title'),
				icon: <CaretDownGrayIcon />,
			},
			{
				id: 'website',
				label: t('homepage.nav.website'),
				icon: <ArrowUpRightIcon />,
				onClick: () => window.open(EXTERNAL_LINKS.Website.Home, '_blank'),
			},
			{
				id: 'learn-more',
				label: t('homepage.nav.learn-more'),
				icon: <ArrowUpRightIcon />,
				onClick: () => window.open(EXTERNAL_LINKS.Docs.DocsRoot, '_blank'),
			},
		],
		[t]
	)

	const GOVERNANCE = [
		{
			id: 'overview',
			label: t('homepage.nav.governance.overview'),
			onClick: () => window.open(EXTERNAL_LINKS.Docs.Governance, '_blank'),
		},
		{
			id: 'kips',
			label: t('homepage.nav.governance.kips'),
			onClick: () => window.open(EXTERNAL_LINKS.Governance.Kips, '_blank'),
		},
	]

	const SOCIALS = [
		{
			id: 'E-mail',
			label: t('homepage.nav.socials.E-mail'),
			onClick: () => window.open(EXTERNAL_LINKS.Social.Email, '_blank'),
			icon: <EMailLogo />,
		},
		{
			id: 'twitter',
			label: t('homepage.nav.socials.twitter'),
			onClick: () => window.open(EXTERNAL_LINKS.Social.Twitter, '_blank'),
			icon: <TwitterLogo />,
		},
	]

	return (
		<>
			<DesktopOnlyView>
				<Container>
					<div onClick={() => router.push(ROUTES.Home.Root)}>
						<Logo />
					</div>
					<Links>
						{LINKS.map(({ id, label, icon, onClick }) => (
							<StyledTextButton key={id} className={id} onClick={onClick}>
								<FlexDivRowCentered>
									{label}
									{icon}
								</FlexDivRowCentered>
								{/* <StyledMenu className="governance">
									{GOVERNANCE.map(({ id, label, onClick }) => (
										<StyledMenuItem key={id} onClick={onClick}>
											{label}
										</StyledMenuItem>
									))}
								</StyledMenu>
								<StyledMenu className="socials">
									{SOCIALS.map(({ id, label, onClick, icon }) => (
										<StyledMenuItem key={id} onClick={onClick}>
											{icon}
											{label}
										</StyledMenuItem>
									))}
								</StyledMenu> */}
							</StyledTextButton>
						))}
					</Links>
					<MenuContainer>
						<Link href={ROUTES.Dashboard.Markets}>
							<RefButton noOutline size="medium">
								{t('homepage.nav.start-trade')}
							</RefButton>
						</Link>
					</MenuContainer>
				</Container>
			</DesktopOnlyView>
			<MobileOrTabletView>
				<MobileContainer>
					<div onClick={() => router.push(ROUTES.Dashboard.Markets)}>
						<Logo />
					</div>
					<MobileUserMenu />
				</MobileContainer>
			</MobileOrTabletView>
		</>
	)
})

const MobileContainer = styled(FlexDivRow)`
	justify-content: center;
	align-items: center;
`

const StyledMenu = styled.div`
	position: absolute;
	background: ${(props) => props.theme.colors.selectedTheme.cell.fill};
	border: 1px solid rgba(255, 255, 255, 0.1);
	z-index: 10;
	border-radius: 6px;
	max-width: 150px;
	margin: auto;
	padding: 10px 15px;
	margin-top: 35px;
	display: flex;
	flex-direction: column;
	align-items: center;

	&.governance {
		visibility: hidden;
		transition: visibility 0.1s;
		:hover {
			visibility: visible;
		}
	}

	&.socials {
		visibility: hidden;
		transition: visibility 0.1s;
		:hover {
			visibility: visible;
		}
	}
`

const StyledMenuItem = styled(Body).attrs({ weight: 'bold' })`
	cursor: pointer;
	width: 100%;
	font-size: 15px;
	height: 30px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: flex-start;
	padding-top: 0px;
	padding-bottom: 0px;
	margin: 0px;
	&:hover {
		color: ${(props) => props.theme.colors.selectedTheme.white};
	}
	svg {
		margin-right: 10px;
		width: 15px;
		height: 15px;
	}
`

const Container = styled.header`
	padding: 15px;
	display: grid;
	align-items: center;
	width: 100%;
	grid-template-columns: 1fr 1fr 1fr;
`

const Links = styled.div`
	display: flex;
	flex-direction: row;
	white-space: nowrap;
	justify-self: center;
`

const StyledTextButton = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	font-size: 15px;
	line-height: 15px;
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.common.tertiaryGray};
	cursor: pointer;
	padding: 8px 13px;
	border-radius: 100px;

	&:hover {
		background: #252525;
		color: ${(props) => props.theme.colors.selectedTheme.white};
	}

	&.governance:hover {
		> div.governance {
			visibility: visible;
		}
	}

	&.socials:hover {
		> div.socials {
			visibility: visible;
		}
	}

	margin: 0px 20px;
	svg {
		margin-left: 5px;
	}
`

const MenuContainer = styled(GridDivCenteredCol)`
	grid-gap: 24px;
	justify-self: end;
`

export default Header
function DEFAULT_FUTURES_MARGIN_TYPE(DEFAULT_FUTURES_MARGIN_TYPE: any): string | import("url").UrlObject {
	throw new Error('Function not implemented.')
}

