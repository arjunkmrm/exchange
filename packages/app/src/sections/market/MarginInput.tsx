import React, { ChangeEvent, memo, useMemo } from 'react'
import styled from 'styled-components'

import InputTitle from 'components/Input/InputTitle'
import NumericInput from 'components/Input/NumericInput'
import { FlexDivRow } from 'components/layout/flex'
import SelectorButtons from 'components/SelectorButtons'
import { Body } from 'components/Text'
// import { selectSelectedInputDenomination, selectPosition } from 'state/futures/selectors'
// import { editSmartMarginTradeMarginDelta } from 'state/futures/smartMargin/actions'
// import {
// 	selectTotalAvailableMargin,
// 	selectMarginDeltaInputValue,
// } from 'state/futures/smartMargin/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { setOrderSize } from 'state/exchange/reducer'
import { selectCurrentMarketInfo, selectOrderDirection, selectOrderSize } from 'state/exchange/selectors'
import { selectBalanceInBank } from 'state/wallet/selectors'
import { OrderDirection } from '@bitly/sdk/types'
import { InfoBoxRow } from 'components/InfoBox'
import { formatCurrency } from 'utils/prices'

const PERCENT_OPTIONS = ['10%', '25%', '50%', '100%']

type MarginInputProps = {
	isMobile?: boolean
}

const MarginInput: React.FC<MarginInputProps> = memo(({ isMobile }) => {
	const dispatch = useAppDispatch()
	const size = useAppSelector(selectOrderSize)
	const marketInfo = useAppSelector(selectCurrentMarketInfo)
	const balances = useAppSelector(selectBalanceInBank)
	const orderDirection = useAppSelector(selectOrderDirection)

	const originTokenbalances = useMemo(() => {
		if (orderDirection == OrderDirection.buy) {
			return balances[marketInfo?.tokenY.address ?? ''] ?? 0
		} else {
			return balances[marketInfo?.tokenX.address ?? ''] ?? 0
		}
	}, [balances, marketInfo, orderDirection])

	const onChangeValue = (_: ChangeEvent<HTMLInputElement>, v: string) => {
		dispatch(setOrderSize(v))
	}

	const onSelectPercent = (index: number) => {
		const percent = Number(PERCENT_OPTIONS[index].replace('%', '')) * 0.01
		dispatch(setOrderSize((originTokenbalances * percent).toString()))
	}

	const originTokenSymbol = useMemo(() => {
		if (orderDirection == OrderDirection.buy) {
			return marketInfo?.tokenY.symbol ?? ''
		} else {
			return marketInfo?.tokenX.symbol ?? ''
		}
	}, [marketInfo, orderDirection])

	return (
		<>
			<Container>
				<OrderSizingRow>
					<InputTitle>Size</InputTitle>
					<InputHelpers>
						<SelectorButtons onSelect={onSelectPercent} options={PERCENT_OPTIONS} />
					</InputHelpers>
				</OrderSizingRow>

				<NumericInput
					invalid={false}
					dataTestId={'set-order-margin-susd' + (isMobile ? '-mobile' : '-desktop')}
					value={size}
					placeholder="0.00"
					right={false}
					onChange={onChangeValue}
				/>

				<InfoBoxRow
					title="Balance"
					textValue={formatCurrency(marketInfo?.marketAddress ?? '', originTokenbalances, {
						currencyKey: originTokenSymbol
					})}
				/>

			</Container>
		</>
	)
})

const Container = styled.div`
	margin-top: 18px;
	margin-bottom: 16px;
`

const OrderSizingRow = styled(FlexDivRow)`
	width: 100%;
	align-items: center;
	margin-bottom: 8px;
	cursor: default;
`

const InputHelpers = styled.div`
	display: flex;
`

export default MarginInput
