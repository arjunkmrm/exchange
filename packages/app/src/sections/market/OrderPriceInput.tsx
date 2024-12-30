import { ChangeEvent, useMemo } from 'react'
import styled from 'styled-components'

import InputHeaderRow from 'components/Input/InputHeaderRow'
import InputTitle from 'components/Input/InputTitle'
import NumericInput from 'components/Input/NumericInput'
import { OrderType } from 'types/common'
import { OrderDirection } from '@bitly/sdk/types'
import { orderPriceInvalidLabel } from 'utils/prices'

type Props = {
	orderPrice: string
	marketPrice: number
	orderType: OrderType
	positionSide: OrderDirection
	onChange: (e: ChangeEvent<HTMLInputElement>, v: string) => any
}

export default function OrderPriceInput({
	orderPrice,
	orderType,
	positionSide,
	marketPrice,
	onChange,
}: Props) {
	const minMaxLabelString = useMemo(
		() => orderPriceInvalidLabel(Number(orderPrice), positionSide, marketPrice, orderType),
		[orderPrice, orderType, positionSide, marketPrice]
	)

	return (
		<>
			<InputHeaderRow
				label={
					<StyledInputTitle>
						{orderType} Price{' '}
						{minMaxLabelString && (
							<>
								&nbsp; —<span>&nbsp; {minMaxLabelString}</span>
							</>
						)}
					</StyledInputTitle>
				}
			></InputHeaderRow>
			<NumericInput
				invalid={!!minMaxLabelString}
				dataTestId="order-price-input"
				value={orderPrice}
				placeholder="0.0"
				onChange={onChange}
			/>
		</>
	)
}

const StyledInputTitle = styled(InputTitle)`
	text-transform: capitalize;
	span {
		color: ${(props) => props.theme.colors.selectedTheme.red};
	}
`
