import { useConnectModal } from '@rainbow-me/rainbowkit'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from 'components/Button'
import { ERROR_MESSAGES } from 'components/ErrorNotifier'
import Error from 'components/ErrorView'
import Connector from 'containers/Connector'
import { previewErrorI18n } from 'queries/futures/constants'
import { setOpenModal, setTradePanelDrawerOpen } from 'state/app/reducer'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { FetchStatus } from 'state/types'
import { selectMakeOrderFinished, selectOrderDirection, selectOrderPrice, selectOrderSize, selectOrderType } from 'state/exchange/selectors'
import { OrderDirection } from '@bitly/sdk/dist/types'
import { placeOrder } from 'state/exchange/actions'

const ManagePosition: React.FC = () => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const { isWalletConnected } = Connector.useContainer()
	const { openConnectModal } = useConnectModal()
	const [submitted, setSubmitted] = useState(false)

	const orderDirection = useAppSelector(selectOrderDirection)
	const orderType = useAppSelector(selectOrderType)
	const orderPrice = Number(useAppSelector(selectOrderPrice))
	const orderSize = Number(useAppSelector(selectOrderSize))
	const isFinished = useAppSelector(selectMakeOrderFinished)

	const submitButtonDisabled = useMemo(() => {
		let disabled = false
		if (orderType == 'market') {
			if (orderSize == 0) {
				disabled = true
			}
		} else {
			if (orderSize == 0 || orderPrice == 0) {
				disabled = true
			}
		}
		return disabled
	}, [orderType, orderSize, orderPrice])

	const onSubmit = useCallback(() => {
		dispatch(placeOrder())
		setSubmitted(true)
	}, [dispatch])

	useEffect(() => {
		if (isFinished && submitted) {
			dispatch(setTradePanelDrawerOpen(false))
		}
	}, [isFinished, submitted])

	const otherReason = useMemo(() => {
		if (!isWalletConnected) {
			return { key: 'futures.market.trade.button.connect-wallet', action: openConnectModal }
		} 
		return undefined
	}, [isWalletConnected, dispatch, openConnectModal])

	const placeOrderTextKey = useMemo(() => {
		if (orderType === 'limit') {
			return 'futures.market.trade.button.place-limit-order'
		} else {
			return 'futures.market.trade.button.place-market-order'
		}
	}, [orderType])

	return (
		<ManagePositionContainer>
			<PlaceOrderButton
				data-testid="trade-panel-submit-button"
				noOutline
				fullWidth
				loading={!isFinished}
				variant={otherReason ? 'yellow' : orderDirection}
				disabled={!otherReason && submitButtonDisabled}
				onClick={otherReason?.action ?? onSubmit}
			>
				{t(otherReason?.key ?? placeOrderTextKey)}
			</PlaceOrderButton>
		</ManagePositionContainer>
	)
}

const ManagePositionContainer = styled.div`
	display: flex;
	grid-gap: 15px;
	margin-bottom: 16px;
`

const PlaceOrderButton = styled(Button)`
	font-size: 16px;
	height: 55px;
	text-align: center;
	white-space: normal;
`

export default ManagePosition
