import SegmentedControl from 'components/SegmentedControl'
import { ORDER_TYPES } from 'constants/defaults'
import { setOrderPrice } from 'state/exchange/reducer'
import { useAppDispatch } from 'state/hooks'
import { OrderType } from 'types/common'

type Props = {
	orderType: OrderType
	setOrderTypeAction: (payload: any) => any
}

export default function OrderTypeSelector({ setOrderTypeAction, orderType }: Props) {
	const dispatch = useAppDispatch()

	return (
		<SegmentedControl
			values={ORDER_TYPES}
			selectedIndex={ORDER_TYPES.indexOf(orderType)}
			onChange={(index) => {
				const type = ORDER_TYPES[index]
				dispatch(setOrderTypeAction(type))
			}}
		/>
	)
}
