import { useState } from 'react'
import styled, { css } from 'styled-components'
import { FlexDiv } from 'components/layout/flex'
import TVChart from 'components/TVChart'
import { useAppSelector } from 'state/hooks'
import { selectCurrentMarketPrice } from 'state/prices/selectors'

type PositionChartProps = {
	display?: boolean
}

export default function PositionChart({ display = true }: PositionChartProps) {
	const initialPrice = useAppSelector(selectCurrentMarketPrice)
	const [isChartReady, setIsChartReady] = useState(false)
	return (
		<Container $visible={isChartReady} $display={display}>
			<TVChart
				initialPrice={initialPrice?.toString()}
				onChartReady={() => {
					setIsChartReady(true)
				}}
			/>
		</Container>
	)
}

const Container = styled(FlexDiv)<{ $visible: boolean; $display?: boolean }>`
	flex: 1;
	height: 100%;
	width: 100%;
	visibility: ${(props) => (props.$visible ? 'visible' : 'hidden')};
	${(props) =>
		!props.$display &&
		css`
			display: none;
		`}
`
