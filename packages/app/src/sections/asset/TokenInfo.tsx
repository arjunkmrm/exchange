import { FC, memo } from 'react'
import styled from 'styled-components'

import Button from 'components/Button'
import { FlexDivCol, FlexDivRowCentered } from 'components/layout/flex'
import { Body, Heading } from 'components/Text'
import Currency from 'components/Currency'

interface TokenInfoProps {
	name: string
	symbol: string
	logo: string
	address: string
	description?: string
}

export const TokenInfo: FC<TokenInfoProps> = memo(({ name, symbol, logo, address, description }) => {
	return (
		<FlexDivCol>
			<TitleContainer>
				<FlexDivCol rowGap="5px">
					<StyledCurrencyIcon
						currencyKey={address}
						url={logo}
					/>
					<StyledHeading variant="h4">{`${name} (${symbol})`}</StyledHeading>
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
