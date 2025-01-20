import React, { ChangeEvent, memo, useMemo } from 'react'
import styled from 'styled-components'

import InputTitle from 'components/Input/InputTitle'
import InputHeaderRow from 'components/Input/InputHeaderRow'
import NumericInput from 'components/Input/NumericInput'
import { FlexDivRow } from 'components/layout/flex'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { setOrderSize, setOrderTotal } from 'state/exchange/reducer'
import { selectCurrentMarketInfo, selectOrderDirection, selectOrderPrice, selectOrderTotal } from 'state/exchange/selectors'
import { selectBalanceInBank } from 'state/wallet/selectors'
import { OrderDirection } from '@bitly/sdk/types'

type MarginInputProps = {
	isMobile?: boolean
}

const TotalInput: React.FC<MarginInputProps> = memo(({ isMobile }) => {
	const dispatch = useAppDispatch()
	const orderTotal = useAppSelector(selectOrderTotal)
	const marketInfo = useAppSelector(selectCurrentMarketInfo)
	const orderPrice = Number(useAppSelector(selectOrderPrice))
	const orderDirection = useAppSelector(selectOrderDirection)
	const balances = useAppSelector(selectBalanceInBank)

	const originTokenbalance = useMemo(() => {
		if (orderDirection == OrderDirection.buy) {
			return balances[marketInfo?.tokenY.address ?? ''] ?? 0
		} else {
			return balances[marketInfo?.tokenX.address ?? ''] ?? 0
		}
	}, [balances, marketInfo, orderDirection])

	const onChangeValue = (_: ChangeEvent<HTMLInputElement>, v: string) => {
		const total = Number(v)
		const amount = orderPrice > 0 ? total / orderPrice : 0
		dispatch(setOrderSize(amount.toString()))
		dispatch(setOrderTotal(total.toString()))
	}

	const maxLableSring = useMemo(() => {
		const maxValue = orderDirection === OrderDirection.buy 
			? originTokenbalance
			: originTokenbalance * orderPrice

		if (Number(orderTotal) > maxValue) {
			return '- Max ' + maxValue
		}

		return null;
	}, [originTokenbalance, orderTotal, orderDirection, orderPrice])

	return (
		<>
			<InputHeaderRow
				label={
					<StyledInputTitle>
						Total ({marketInfo?.tokenY.symbol}) {' '}
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
				value={orderTotal}
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

export default TotalInput
