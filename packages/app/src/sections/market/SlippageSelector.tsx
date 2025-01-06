import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import Button from 'components/Button'
import InputHeaderRow from 'components/Input/InputHeaderRow'
import InputTitle from 'components/Input/InputTitle'
import { FlexDivRow } from 'components/layout/flex'
import { StyledCaretDownIcon } from 'components/Select'
import SelectorButtons from 'components/SelectorButtons'
import Spacer from 'components/Spacer'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { setSlippage } from 'state/exchange/reducer'
import { selectSlippage } from 'state/exchange/selectors'

const TP_OPTIONS = ['1%', '2%', '5%', '10%', '20%']

export default function SlippageSelector() {
	const dispatch = useAppDispatch()
	const [showInputs, setShowInputs] = useState(false)
	const slippage = useAppSelector(selectSlippage)

	const onSelectSlippage = useCallback(
		(index: number) => {
			const option = TP_OPTIONS[index]
			const percent = Math.abs(Number(option.replace('%', ''))) / 100
			dispatch(setSlippage(percent))
		},
		[dispatch]
	)

	const selectedIndex = useMemo(() => {
		const percents = TP_OPTIONS.map(e=>Math.abs(Number(e.replace('%', ''))) / 100)
		return percents.indexOf(slippage)
	}, [slippage])

	return (
		<Container>
			<ExpandRow onClick={() => setShowInputs(!showInputs)}>
				<InputTitle margin="1px 0 0 0">Options</InputTitle>
				<Button
					data-testid="expand-sl-tp-button"
					style={{
						height: '20px',
						borderRadius: '4px',
						padding: '3px 5px',
					}}
				>
					<StyledCaretDownIcon style={{ transform: [{ rotateY: '180deg' }] }} $flip={showInputs} />
				</Button>
			</ExpandRow>
			{showInputs &&
				<InputsContainer>
					<Spacer height={6} />
					<InputHeaderRow
						label="Slippage"
						rightElement={<SelectorButtons selectedIndex={selectedIndex} options={TP_OPTIONS} onSelect={onSelectSlippage} />}
					/>
				</InputsContainer>
			}
		</Container>
	)
}

const Container = styled.div`
	padding: 10px;
	background: ${(props) =>
		props.theme.colors.selectedTheme.newTheme.containers.secondary.background};
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 8px;
	margin-bottom: 16px;
`

const ExpandRow = styled(FlexDivRow)`
	padding: 0px 2px 0 4px;
	cursor: pointer;
	align-items: center;
`

const InputsContainer = styled.div`
	padding: 4px;
`