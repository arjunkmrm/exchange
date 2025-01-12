import { FC, memo } from 'react'
import styled from 'styled-components'

import MobileBaseCurrencyCard from './MobileBaseCurrencyCard'
import MobileQuoteCurrencyCard from './MobileQuoteCurrencyCard'
import ListPairButton from './SwapButton'

const MobileSwap: FC = memo(() => (
	<MobileSwapContainer>
		<MobileBaseCurrencyCard />
		<MobileQuoteCurrencyCard />
		<ListPairButton />
	</MobileSwapContainer>
))

const MobileSwapContainer = styled.div`
	padding: 15px;
`

export default MobileSwap
