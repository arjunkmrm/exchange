import { FC, memo, useMemo } from 'react'
import styled from 'styled-components'

import Button from 'components/Button'
import { FlexDivCol, FlexDivRowCentered } from 'components/layout/flex'
import { Body, Heading } from 'components/Text'
import Currency from 'components/Currency'
import { TOKEN_BRIDGES } from 'constants/address'
import { blockExplorer } from 'containers/Connector/Connector'
import { useTranslation } from 'react-i18next'
import ArrowUpRightIcon from 'assets/svg/app/arrow-up-right-tg.svg'
import { ExternalLink } from 'styles/common'

interface TokenInfoProps {
	name: string
	symbol: string
	logo: string
	address: string
	description?: string
	networkId: number
	website?: string
}

export const TokenInfo: FC<TokenInfoProps> = memo(({ name, symbol, logo, address, description, networkId, website }) => {
	const { t } = useTranslation()

	const bridge = useMemo(() => {
		return TOKEN_BRIDGES[networkId][address]
	}, [address, networkId])

	const explorer = useMemo(() => {
		return blockExplorer.tokenLink?.(address)
	}, [networkId, address])

	const links = useMemo(() => {
		const ret = []
		if (explorer) {
			ret.push({
				href: explorer, 
				text: t('wallet.asset.base-info.explorer')
			})
		}
		if (website) {
			ret.push({
				href: website, 
				text: t('wallet.asset.base-info.website')
			})
		}
		if (bridge) {
			ret.push({
				href: bridge, 
				text: t('wallet.asset.base-info.bridge')
			})
		}
		return (
			<>
				{ret.map(e=>StyledLink(e))}
			</>
		)
	}, [explorer, bridge])

	return (
		<FlexDivCol>
			<TitleContainer>
				<FlexDivCol rowGap="5px">
					<StyledCurrencyIcon
						currencyKey={address}
						url={logo}
					/>
					<StyledHeading variant="h4">{`${name} (${symbol})`}</StyledHeading>
					<Body color='secondary'>
						{links}
					</Body>
					{description && <Body color="secondary">{description}</Body>}
				</FlexDivCol>
			</TitleContainer>
		</FlexDivCol>
	)
})

const TitleContainer = styled(FlexDivRowCentered)`
	margin-bottom: 30px;
	column-gap: 10%;
`

const StyledButton = styled(Button)`
	border-width: 0px;
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.secondary};
`

const StyledHeading = styled(Heading)`
	font-weight: 400;
`

const StyledCurrencyIcon = styled(Currency.Icon)`
	width: 50px;
	height: 50px;
	margin-right: 8px;
`

const StyledLink = ({text, href}: {text: string; href?: string}) => 
<span>
	<ExternalLink href={href}>
		{text}
		{href ? <ArrowUpRightIcon /> : <></>}
	</ExternalLink>
	&nbsp;&nbsp;
</span>
