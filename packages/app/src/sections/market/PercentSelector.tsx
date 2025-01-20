import React, { ChangeEvent, memo, useMemo } from 'react'
import styled from 'styled-components'

import InputTitle from 'components/Input/InputTitle'
import NumericInput from 'components/Input/NumericInput'
import { FlexDivRow } from 'components/layout/flex'
import SelectorButtons from 'components/SelectorButtons'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { setOrderSize, setOrderTotal } from 'state/exchange/reducer'
import { selectCurrentMarketInfo, selectOrderDirection, selectOrderPrice, selectOrderSize } from 'state/exchange/selectors'
import { selectBalanceInBank } from 'state/wallet/selectors'
import { OrderDirection } from '@bitly/sdk/types'

const PERCENT_OPTIONS = ['10%', '25%', '50%', '75%', '100%']

type PercentSelectorProps = {
	isMobile?: boolean
}

const PercentSelector: React.FC<PercentSelectorProps> = memo(({ isMobile }) => {
	const dispatch = useAppDispatch()
	const marketInfo = useAppSelector(selectCurrentMarketInfo)
	const balances = useAppSelector(selectBalanceInBank)
	const orderDirection = useAppSelector(selectOrderDirection)
	const orderPrice = Number(useAppSelector(selectOrderPrice))

	const originTokenbalances = useMemo(() => {
		if (orderDirection == OrderDirection.buy) {
			return balances[marketInfo?.tokenY.address ?? ''] ?? 0
		} else {
			return balances[marketInfo?.tokenX.address ?? ''] ?? 0
		}
	}, [balances, marketInfo, orderDirection])

	const onSelectPercent = (index: number) => {
		const percent = Number(PERCENT_OPTIONS[index].replace('%', '')) * 0.01
		let amount = 0
		let total = 0
		if (orderDirection == OrderDirection.buy) {
			total = originTokenbalances * percent
			amount = orderPrice > 0 ? total / orderPrice : 0
		} else {
			amount = originTokenbalances * percent
			total = amount * orderPrice
		}
		dispatch(setOrderSize(amount.toString()))
		dispatch(setOrderTotal(total.toString()))
	}

	return (
			<InputHelpers>
				<SelectorButtons onSelect={onSelectPercent} options={PERCENT_OPTIONS} />
			</InputHelpers>
	)
})

const InputHelpers = styled.div`
	display: grid;
	grid-template-columns: repeat(1, 1fr);
`

export default PercentSelector
