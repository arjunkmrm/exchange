import { FC, memo } from 'react'
import styled from 'styled-components'

import { ContainerRowMixin } from 'components/layout/grid'
import { formatCurrency } from 'utils/prices'

type CurrencyAmountProps = {
	currencyKey: string
	amount: number
	totalValue: number
	sign?: string
	conversionRate?: number | null
	showTotalValue?: boolean
	showValue?: boolean
}

export const CurrencyAmount: FC<CurrencyAmountProps> = memo(
	({
		currencyKey,
		amount,
		totalValue,
		sign,
		conversionRate,
		showTotalValue = true,
		showValue = true,
		...rest
	}) => (
		<Container {...rest}>
			{!showValue ? null : (
				<Amount className="amount">
					{formatCurrency(currencyKey, amount)}
				</Amount>
			)}
			{!showTotalValue ? null : (
				<TotalValue className="total-value">
					{formatCurrency(currencyKey, amount)}
				</TotalValue>
			)}
		</Container>
	)
)

const Container = styled.span`
	${ContainerRowMixin};
	justify-items: end;
	font-family: ${(props) => props.theme.fonts.mono};
`

const Amount = styled.span`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
`
const TotalValue = styled.span`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`

export default CurrencyAmount
