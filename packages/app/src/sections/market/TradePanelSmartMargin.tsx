import { FC, memo, useCallback, useState, useEffect } from 'react'
import styled, { css } from 'styled-components'

import { useAppDispatch, useAppSelector } from 'state/hooks'
import { selectPricesConnectionError } from 'state/prices/selectors'
import Error from 'components/ErrorView'
import Spacer from 'components/Spacer'
import MarketsDropdown from './MarketsDropdown'
import { OrderDirection } from '@bitly/sdk/types'
import { selectOrderDirection, selectOrderType } from 'state/exchange/selectors'
import { setOrderDirection, setOrderType } from 'state/exchange/reducer'
import CloseOnlyPrompt from './CloseOnlyPrompt'
import PositionButtons from './PositionButtons'
import OrderTypeSelector from './OrderTypeSelector'
import MarginInput from './MarginInput'
import TradePanelPriceInput from './TradePanelPriceInput'
import ManagePosition from './ManagePosition'
import TradeBalance from 'sections/market/TradeBalanceSmartMargin'

type Props = {
	mobile?: boolean
	closeDrawer?: () => void
}

const TradePanelSmartMargin: FC<Props> = memo(({ mobile, closeDrawer }) => {
	const dispatch = useAppDispatch()

	const orderDirection = useAppSelector(selectOrderDirection)
	const orderType = useAppSelector(selectOrderType)
	const pricesConnectionError = useAppSelector(selectPricesConnectionError)

	const handleChangeSide = useCallback(
		(side: OrderDirection) => {
			dispatch(setOrderDirection(side))
		},
		[dispatch]
	)

	return (
		<TradePanelContainer $mobile={mobile}>
			{!mobile && (
				<>
					<MarketsDropdown />
					{/* <TradeBalance /> */}
				</>
			)}

			{process.env.NEXT_PUBLIC_CLOSE_ONLY === 'true' ? (
				<CloseOnlyPrompt $mobile={mobile} />
			) : (
				<>
					<PositionButtons
						selected={orderDirection}
						onSelect={handleChangeSide}
						mobile={mobile}
						closeDrawer={closeDrawer}
					/>

					<MainPanelContent $mobile={mobile}>
						{pricesConnectionError && (
							<Error message="Failed to connect to price feed. Please try disabling any ad blockers and refresh." />
						)}
						<OrderTypeSelector orderType={orderType} setOrderTypeAction={setOrderType} />

						<MarginInput />
						{orderType !== 'market' && (
							<>
								<TradePanelPriceInput />
								<Spacer height={16} />
							</>
						)}
						<Spacer height={16} />
						<ManagePosition /> 
					</MainPanelContent>
				</>
			)}
		</TradePanelContainer>
	)
})

const TradePanelContainer = styled.div<{ $mobile?: boolean }>`
	overflow-y: scroll;
	height: 100%;
	scrollbar-width: none;
	border-right: ${(props) => props.theme.colors.selectedTheme.border};
`

const MainPanelContent = styled.div<{ $mobile?: boolean }>`
	padding: 0 15px;

	${(props) =>
		props.$mobile &&
		css`
			padding: 65px 15px 0;
		`}
`

export default TradePanelSmartMargin
