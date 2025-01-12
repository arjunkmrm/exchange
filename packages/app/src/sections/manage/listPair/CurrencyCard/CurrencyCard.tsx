import { FC, memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import Card, { CardBody } from 'components/Card'
import { FlexDivRowCentered } from 'components/layout/flex'
import CurrencyCardSelector from './CurrencyCardSelector'

type CurrencyCardProps = {
	side: string
	currencyKey?: string
	currencyName?: string
	onCurrencySelect?: () => void
	className?: string
	label: string
	disableInput?: boolean
	isLoading?: boolean
	disabled?: boolean
}

const CurrencyCard: FC<CurrencyCardProps> = memo(
	({
		side,
		currencyKey,
		label,
		onCurrencySelect,
		...rest
	}) => {
		const { t } = useTranslation()

		const hasCurrencySelectCallback = !!onCurrencySelect

		return (
			<CardContainer>
				<StyledCard
					data-testid={`currency-card-${side}`}
					className={`currency-card currency-card-${side}`}
					interactive
					{...rest}
				>
					<StyledCardBody className="currency-card-body">
						<CurrencyContainer className="currency-container">
							<CurrencyCardSelector
								tokenName={label ?? ''}
								onCurrencySelect={onCurrencySelect}
								currencyKey={currencyKey}
								hasCurrencySelectCallback={hasCurrencySelectCallback}
							/>
						</CurrencyContainer>
					</StyledCardBody>
				</StyledCard>
			</CardContainer>
		)
	}
)

const CardContainer = styled.div`
	display: grid;
	height: 183px;
`

const StyledCard = styled(Card)<{ interactive?: boolean }>`
	${(props) =>
		!props.interactive &&
		css`
			pointer-events: none;
		`}
`

const StyledCardBody = styled(CardBody)`
	padding: 20px 32px;
`

const CurrencyContainer = styled(FlexDivRowCentered)`
	gap: 20px;
`

export default CurrencyCard
