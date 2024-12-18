import React, { FC, memo } from 'react'
import styled from 'styled-components'

import ChangePercent from 'components/ChangePercent'
import { ContainerRowMixin } from 'components/layout/grid'
import { NumericValue } from 'components/Text'
import { CurrencyKey } from 'constants/currency'
import { formatCurrency } from 'utils/prices'

type CurrencyPriceProps = {
	currencyKey?: CurrencyKey
	showCurrencyKey?: boolean
	price: number
	sign?: string
	change?: number
	conversionRate?: number
	colorType?: 'secondary' | 'positive' | 'negative' | 'preview'
	colored?: boolean
}

export const CurrencyPrice: FC<CurrencyPriceProps> = memo(
	({
		price,
		change,
		colorType: side,
		sign,
		currencyKey = 'USD',
		conversionRate = 1,
		showCurrencyKey = false,
		colored = false,
		...rest
	}) => {
		return (
			<Container {...rest}>
				<NumericValue
					value={price/conversionRate}
					as="span"
					colored={colored}
					color={side}
				>
					{formatCurrency(currencyKey, price/conversionRate)}
				</NumericValue>
				{!!change && <ChangePercent className="percent" value={change} />}
			</Container>
		)
	}
)

const Container = styled.span`
	${ContainerRowMixin};
`

export default CurrencyPrice
