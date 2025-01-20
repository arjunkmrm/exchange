import React, { ChangeEvent, memo, useMemo } from 'react'
import styled from 'styled-components'

import InputHeaderRow from 'components/Input/InputHeaderRow'
import NumericInput from 'components/Input/NumericInput'
import InputTitle from 'components/Input/InputTitle'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { setOrderSize, setOrderTotal } from 'state/exchange/reducer'
import { selectCurrentMarketInfo, selectOrderDirection, selectOrderPrice, selectOrderSize } from 'state/exchange/selectors'
import { selectBalanceInBank } from 'state/wallet/selectors'
import { OrderDirection } from '@bitly/sdk/types'

type MarginInputProps = {
	isMobile?: boolean
}

const AmountInput: React.FC<MarginInputProps> = memo(({ isMobile }) => {
	const dispatch = useAppDispatch()
	const size = useAppSelector(selectOrderSize)
	const marketInfo = useAppSelector(selectCurrentMarketInfo)
	const orderPrice = Number(useAppSelector(selectOrderPrice))
	const orderDirection = useAppSelector(selectOrderDirection)
	const balances = useAppSelector(selectBalanceInBank)

	const onChangeValue = (_: ChangeEvent<HTMLInputElement>, v: string) => {
		const amount = Number(v)
		const total = amount * orderPrice
		dispatch(setOrderSize(amount.toString()))
		dispatch(setOrderTotal(total.toString()))
	}

	const originTokenbalance = useMemo(() => {
		if (orderDirection == OrderDirection.buy) {
			return balances[marketInfo?.tokenY.address ?? ''] ?? 0
		} else {
			return balances[marketInfo?.tokenX.address ?? ''] ?? 0
		}
	}, [balances, marketInfo, orderDirection])

	const maxLableSring = useMemo(() => {
		if (!orderPrice || orderPrice === 0) return null
		const maxValue = orderDirection === OrderDirection.sell 
			? originTokenbalance
			: originTokenbalance / orderPrice

		if (Number(size) > maxValue) {
			return '- Max ' + maxValue
		}

		return null;
	}, [originTokenbalance, size, orderDirection, orderPrice])

	return (
		<>
			<InputHeaderRow
				label={
					<StyledInputTitle>
						Amount ({marketInfo?.tokenX.symbol}) {' '}
						{maxLableSring && (
							<>
								&nbsp; —<span>&nbsp; {maxLableSring}</span>
							</>
						)}
					</StyledInputTitle>
				}
			></InputHeaderRow>

			<NumericInput
				invalid={false}
				dataTestId={'set-order-margin-susd' + (isMobile ? '-mobile' : '-desktop')}
				value={size}
				placeholder="0.00"
				right={false}
				onChange={onChangeValue}
			/>
		</>
	)
})

const StyledInputTitle = styled(InputTitle)`
	text-transform: capitalize;
	span {
		color: ${(props) => props.theme.colors.selectedTheme.red};
	}
`

export default AmountInput
