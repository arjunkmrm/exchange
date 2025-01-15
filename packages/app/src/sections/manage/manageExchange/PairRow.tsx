import { FC, memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Currency from 'components/Currency'
import { SelectableCurrencyRow } from 'styles/common'
import { truncateAddress } from 'utils/string'

type Pair = {
	displayName: string
	logoURI: string
	address: string
}

type SynthRowProps = {
	pair: Pair
	onClick: () => void
}

const PairRow: FC<SynthRowProps> = memo(({ pair, onClick }) => {
	const currencyKey = pair.displayName

	return (
		<StyledSelectableCurrencyRow key={currencyKey} onClick={onClick} isSelectable>
			<Currency.Name
				name={truncateAddress(pair.address, 10, 10)}
				showIcon
				iconProps={{ url: pair.logoURI }}
				{...{ currencyKey}}
			/>
			<AddressStyle>
				
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

export default PairRow
