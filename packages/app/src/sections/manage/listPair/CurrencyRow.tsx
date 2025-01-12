import { FC, memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Currency from 'components/Currency'
import { SelectableCurrencyRow } from 'styles/common'
import { truncateAddress } from 'utils/string'

type Token = {
	name: string
	symbol: string
	logoURI: string
	address: string
}

type SynthRowProps = {
	token: Token
	onClick: () => void
}

const CurrencyRow: FC<SynthRowProps> = memo(({ token, onClick }) => {
	const currencyKey = token.symbol

	return (
		<StyledSelectableCurrencyRow key={token.symbol} onClick={onClick} isSelectable>
			<Currency.Name
				name={token.name}
				showIcon
				iconProps={{ url: token.logoURI }}
				{...{ currencyKey}}
			/>
			<AddressStyle>
				{truncateAddress(token.address)}
			</AddressStyle>
		</StyledSelectableCurrencyRow>
	)
})

const StyledSelectableCurrencyRow = styled(SelectableCurrencyRow)`
	padding: 5px 16px;
`

const AddressStyle = styled.span`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`

export default CurrencyRow
