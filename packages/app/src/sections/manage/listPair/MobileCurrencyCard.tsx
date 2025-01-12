import { FC, memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import CaretDownIcon from 'assets/svg/app/caret-down-gray.svg'
import CurrencyIcon from 'components/Currency/CurrencyIcon'
import NumericInput from 'components/Input/NumericInput'
import { SectionHeader, SectionTitle } from 'sections/market/mobile'
import { truncateAddress } from 'utils/string'

type MobileCurrencyCardProps = {
	currencyKey?: string
	onCurrencySelect?: () => void
	label: string
	disabled?: boolean
}

const MobileCurrencyCard: FC<MobileCurrencyCardProps> = memo(
	({
		currencyKey,
		onCurrencySelect,
		label,
	}) => {
		const { t } = useTranslation()
		const hasCurrencySelectCallback = useMemo(() => !!onCurrencySelect, [onCurrencySelect])

		return (
			<div>
				<SectionHeader>
					<SectionTitle>{label}</SectionTitle>
				</SectionHeader>
				<MainInput>
					<MobileCurrencySelector
						currencyKeySelected={!!currencyKey}
						onClick={hasCurrencySelectCallback ? onCurrencySelect : undefined}
						data-testid="currency-selector"
					>
						{!!currencyKey && <CurrencyIcon currencyKey={currencyKey} width={20} height={20} />}
						<div className="label">
							{currencyKey === '' ? 'Select': truncateAddress(currencyKey ?? '')}
						</div>
						{hasCurrencySelectCallback && <CaretDownIcon width="9" />}
					</MobileCurrencySelector>
				</MainInput>
			</div>
		)
	}
)

const MobileCurrencySelector = styled.button<{
	currencyKeySelected: boolean
}>`
	background: ${(props) => props.theme.colors.selectedTheme.button.fill};
	padding: 6px;
	padding-left: 5px;
	margin-left: 10px;
	border-radius: 8px;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	color: ${(props) => props.theme.colors.selectedTheme.text.value};
	display: flex;
	align-items: center;

	.label {
		margin-left: 6px;
		margin-right: 6px;
		font-family: ${(props) => props.theme.fonts.regular};
		font-size: 15px;
	}

	svg {
		margin-top: -2px;
	}
`

const MainInput = styled.div`
	box-sizing: border-box;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 10px;
	padding: 10px;
	padding-left: 0;
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 15px;
`

export default MobileCurrencyCard
