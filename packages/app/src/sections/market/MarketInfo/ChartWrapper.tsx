import styled from 'styled-components'
import { useAppSelector } from 'state/hooks'
import PositionChart from '../PositionChart'
import { selectIsShowOrderbook } from 'state/app/selectors'
import Orderbook from './Orderbook'

const ChartWrapper = () => {
	const showOrderbook = useAppSelector(selectIsShowOrderbook)

	return (
		<Container $showOrderbook={showOrderbook}>
			<div className="charts-container">
				<PositionChart display={true} />
			</div>
			<Orderbook display={showOrderbook} />
		</Container>
	)
}

const Container = styled.div<{ $showOrderbook: boolean }>`
	display: flex;
	height: 100%;
	overflow: hidden;

	.charts-container {
		width: ${(props) => (props.$showOrderbook ? 'calc(100% - 300px)' : '100%')};
	}
`

export default ChartWrapper
