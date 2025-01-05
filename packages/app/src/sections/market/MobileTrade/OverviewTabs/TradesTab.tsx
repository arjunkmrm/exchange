import React from 'react'

import { Pane } from 'sections/market/mobile'
import Orderbook from '../../MarketInfo/Orderbook'

const TradesTab: React.FC = () => {
	return (
		<Pane>
			<Orderbook mobile />
		</Pane>
	)
}
export default TradesTab
