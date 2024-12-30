import { ChangeEvent, useCallback } from 'react'
import { setOrderPrice } from 'state/exchange/reducer'
import { selectOrderDirection, selectOrderPrice, selectOrderType } from 'state/exchange/selectors'

import { useAppDispatch, useAppSelector } from 'state/hooks'
import { selectCurrentMarketPrice } from 'state/prices/selectors'

import OrderPriceInput from './OrderPriceInput'

export default function TradePanelPriceInput() {
	const dispatch = useAppDispatch()

	const marketPrice = useAppSelector(selectCurrentMarketPrice)
	const leverageSide = useAppSelector(selectOrderDirection)
	const orderPrice = useAppSelector(selectOrderPrice)
	const orderType = useAppSelector(selectOrderType)

	const handleOnChange = useCallback(
		(_: ChangeEvent<HTMLInputElement>, v: string) => {
			dispatch(setOrderPrice(v))
		},
		[dispatch]
	)

	return (
		<OrderPriceInput
			orderType={orderType}
			orderPrice={orderPrice}
			positionSide={leverageSide}
			marketPrice={marketPrice}
			onChange={handleOnChange}
		/>
	)
}
