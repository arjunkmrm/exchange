import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { ThemeProvider } from 'styled-components'

import TwitterLogo from 'assets/svg/marketing/twitter-icon.svg'
import EmailLogo from 'assets/svg/social/email.svg'
import MirrorLogo from 'assets/svg/social/mirror.svg'
import { FlexDivCentered } from 'components/layout/flex'
import PoweredBySynthetix from 'components/PoweredBySynthetix'
import { Body } from 'components/Text'
import { EXTERNAL_LINKS } from 'constants/links'
import ROUTES from 'constants/routes'
import { GridContainer } from 'sections/homepage/section'
import { ExternalLink } from 'styles/common'
import media from 'styles/media'
import { themes } from 'styles/theme'

import Logo from '../Logo'

const Footer = memo(() => {
	const { t } = useTranslation()
	const DOC_LINKS = [
		{
			key: 'about-bitly',
			title: t('homepage.footer.about-bitly.title'),
			links: [
                {
					key: 'website',
					title: t('homepage.footer.about-bitly.website'),
					link: EXTERNAL_LINKS.Website.Home,
				},
				{
					key: 'docs',
					title: t('homepage.footer.about-bitly.docs'),
					link: EXTERNAL_LINKS.Docs.DocsRoot,
				},
				{
					key: 'news',
					title: t('homepage.footer.about-bitly.news'),
					link: EXTERNAL_LINKS.Website.Blogs,
				},
				{
					key: 'faq',
					title: t('homepage.footer.about-bitly.faq'),
					link: EXTERNAL_LINKS.Docs.Faq,
				},
			],
		},
		{
			key: 'use-bitly',
			title: t('homepage.footer.use-bitly.title'),
			links: [
				{
					key: 'trade',
					title: t('homepage.footer.use-bitly.trade'),
					link: EXTERNAL_LINKS.Trade.Markets,
				},
				{
					key: 'referrals',
					title: t('homepage.footer.use-bitly.referrals'),
					link: ROUTES.Referrals.Home,
				},
			],
		},
		// {
		// 	key: 'more',
		// 	title: t('homepage.footer.community.title'),
		// 	links: [
		// 		{
		// 			key: 'governance',
		// 			title: t('homepage.footer.community.governance'),
		// 			link: EXTERNAL_LINKS.Docs.Governance,
		// 		},
		// 		{
		// 			key: 'dev-dao',
		// 			title: t('homepage.footer.community.dev-dao'),
		// 			link: EXTERNAL_LINKS.Docs.DevDao,
		// 		},
		// 		{
		// 			key: 'marketing-dao',
		// 			title: t('homepage.footer.community.marketing-dao'),
		// 			link: EXTERNAL_LINKS.Docs.MarketingDao,
		// 		},
		// 		{
		// 			key: 'kips',
		// 			title: t('homepage.footer.community.kips'),
		// 			link: EXTERNAL_LINKS.Governance.Kips,
		// 		},
		// 	],
		// },
	]
	return (
		<ThemeProvider theme={themes.dark}>
			<StyledGridContainer>
				<LogoFooter>
					<Logo />
					<SocialIcons>
						<ExternalLink href={EXTERNAL_LINKS.Social.Twitter}>
							<TwitterLogo />
						</ExternalLink>
						<ExternalLink href={EXTERNAL_LINKS.Website.Home}>
							<MirrorLogo />
						</ExternalLink>
					</SocialIcons>
				</LogoFooter>
				<MultiListContainer>
					{DOC_LINKS.map(({ key, title, links }) => (
						<ListContainer key={key}>
							<ListTitle>{title}</ListTitle>
							{links.map(({ key, title, link }) => (
								<StyledLink key={key} href={link} target="_blank">
									<Body fontSize={18}>{title}</Body>
								</StyledLink>
							))}
						</ListContainer>
					))}
				</MultiListContainer>
				<PowerContainer>
					{/* <PoweredBySynthetix /> */}
					<CopyRight>{t('homepage.footer.copyright')}</CopyRight>
				</PowerContainer>
			</StyledGridContainer>
		</ThemeProvider>
	)
})

const StyledLink = styled.a`
	cursor: pointer;
	p {
		line-height: 1.5;
		margin: 18px 0;
		${media.lessThan('sm')`
			font-size: 15px;
		`};
	}
`

const CopyRight = styled.div`
	font-size: 12px;
	text-align: center;
	text-transform: uppercase;
	color: ${(props) => props.theme.colors.common.primaryWhite};
	opacity: 0.5;
	padding-top: 10px;
	${media.lessThan('sm')`
		margin-right: 0px;
		padding-top: 0px;
	`};
`

const ListTitle = styled.div`
	font-size: 15px;
	line-height: 150%;
	color: ${(props) => props.theme.colors.common.secondaryGray};
	text-transform: uppercase;
`

const PowerContainer = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	padding-top: 45px;
	border-top: 1px solid #3d3c3c;
	margin-bottom: 50px;
	${media.lessThan('lgUp')`
		width: 720px;
		margin-bottom: 120px;
	`}
	${media.lessThan('sm')`
		width: 355px;
		padding-left: 10px;
		padding-right: 10px;
		gap: 20px 80px;
		flex-wrap: wrap;
		padding-top: 60px;
		border-top: 1px solid #3d3c3c;
		justify-content: center;
		margin-bottom: 100px;
	`};
`

const MultiListContainer = styled.div`
	display: flex;
	flex-direction: row;
	column-gap: calc(100vw / 3 - 350px);
	margin-top: 80px;
	margin-bottom: 42.5px;
	${media.lessThan('lgUp')`
		width: 100%;
		padding-left: 10px;
		padding-right: 10px;
		gap: 20px 80px;
		justify-content: space-between;
		flex-wrap: wrap;
		padding-top: 60px;
		border-top: 1px solid #3d3c3c;
		margin-top: 45px;
		margin-bottom: 60px;
	`};
	${media.lessThan('sm')`
		width: 355px;
		padding-left: 10px;
		padding-right: 10px;
		gap: 20px 80px;
		flex-wrap: wrap;
		padding-top: 60px;
		border-top: 1px solid #3d3c3c;
		margin-top: 45px;
		margin-bottom: 60px;
	`};
`

const ListContainer = styled.div`
	font-size: 18px;
	line-height: 150%;
	color: ${(props) => props.theme.colors.common.primaryWhite};
	${media.lessThan('sm')`
		font-size: 15px;
	`};
`

const LogoFooter = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	${media.lessThan('sm')`
		width: 355px;
		padding: 5px;
		align-items: center;
		align-content: center;
	`};
`

const StyledGridContainer = styled(GridContainer)`
	grid-template-columns: repeat(1, auto);
	grid-column-gap: 20px;
	${media.lessThan('sm')`
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
	`};
`

const SocialIcons = styled(FlexDivCentered)`
	> * + * {
		margin-left: 24px;
	}

	${media.lessThan('sm')`
		padding-top: 5px;
	`};

	svg {
		color: ${(props) => props.theme.colors.common.primaryWhite};
	}
`

export default Footer
