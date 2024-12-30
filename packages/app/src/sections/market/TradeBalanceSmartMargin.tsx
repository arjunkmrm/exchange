import { useConnectModal } from '@rainbow-me/rainbowkit'
import { FC, memo, useCallback, useMemo, useReducer } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

import HelpIcon from 'assets/svg/app/question-mark.svg'
import Button from 'components/Button'
import { FlexDivCol, FlexDivRow, FlexDivRowCentered } from 'components/layout/flex'
import { StyledCaretDownIcon } from 'components/Select'
import { Body, NumericValue } from 'components/Text'
import Tooltip from 'components/Tooltip/Tooltip'
import Connector from 'containers/Connector'
import useWindowSize from 'hooks/useWindowSize'
import { setOpenModal } from 'state/app/reducer'
import { selectShowModal } from 'state/app/selectors'
import { ModalType } from 'state/app/types'
import { useAppDispatch, useAppSelector } from 'state/hooks'

import PencilButton from 'components/Button/PencilButton'
import { formatDollars } from 'utils/prices'
// import SmartMarginInfoBox from '../TradeSmartMargin/SmartMarginInfoBox'

type BridgeAndWithdrawButtonProps = {
	modalType: ModalType
}

const BridgeAndWithdrawButton: FC<BridgeAndWithdrawButtonProps> = ({ modalType }) => {
	const dispatch = useAppDispatch()

	return (
		<PencilButton
			width={11}
			height={11}
			onClick={(e) => {
				e.stopPropagation()
				dispatch(setOpenModal(modalType))
			}}
		/>
	)
}

const TradeBalance = memo(() => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const [expanded, toggleExpanded] = useReducer((e) => !e, false)

	const { deviceType } = useWindowSize()
	// const accountMargin = useAppSelector(selectTotalAvailableMargin)
	// const ethBal = useAppSelector(selectKeeperEthBalance)
	const openModal = useAppSelector(selectShowModal)
	const { isWalletConnected } = Connector.useContainer()
	const { openConnectModal } = useConnectModal()

	const { isMobile, size } = useMemo(() => {
		const isMobile = deviceType === 'mobile'
		const size: 'small' | 'medium' = isMobile ? 'small' : 'medium'
		return { isMobile, size }
	}, [deviceType])

	const isDepositRequired = useMemo(() => {
		// return accountMargin.lt(MIN_MARGIN_AMOUNT) && lockedMargin.eq(0) && ethBal.eq(0)
		return false
	// }, [accountMargin, lockedMargin, ethBal])
	}, [])

	const dismissModal = useCallback(() => {
		dispatch(setOpenModal(null))
	}, [dispatch])

	return (
		<Container mobile={isMobile}>
			<BalanceContainer>
				{!isWalletConnected ? (
					<DepositContainer>
						<FlexDivCol>
							<Body size="medium" color="secondary">
								{t('futures.market.trade.trade-balance.no-wallet-connected')}
							</Body>
							<Body size={size} color="preview">
								{t('futures.market.trade.trade-balance.no-wallet-connected-detail')}
							</Body>
						</FlexDivCol>
						<Button variant="yellow" size="xsmall" textTransform="none" onClick={openConnectModal}>
							{t('futures.market.trade.trade-balance.connect-wallet-button')}
						</Button>
					</DepositContainer>
				) : isDepositRequired ? (
					<DepositContainer>
						<FlexDivCol>
							<FlexDivRow columnGap="5px" justifyContent="flex-start">
								<Body size={size} color="secondary">
									{false ? (
										t('futures.market.trade.trade-balance.no-available-margin')
									) : (
										<Trans
											i18nKey="futures.market.trade.trade-balance.only-available-margin"
											values={{ balance: formatDollars(12345) }}
										/>
									)}
								</Body>
							</FlexDivRow>
							<Body size={size} color="preview">
								{t('futures.market.trade.trade-balance.min-margin')}
							</Body>
						</FlexDivCol>
						{false ? (
							<Button
								variant="yellow"
								size="xsmall"
								textTransform="none"
								onClick={() => dispatch(setOpenModal('futures_deposit_withdraw_smart_margin'))}
							>
								{t('header.balance.get-susd')}
							</Button>
						) : (
							<BridgeAndWithdrawButton modalType="futures_deposit_withdraw_smart_margin" />
						)}
					</DepositContainer>
				) : (
					<>
						<DepositContainer>
							<FlexDivRow columnGap="5px" onClick={toggleExpanded} style={{ cursor: 'pointer' }}>
								<FlexDivCol rowGap="2px">
									<Body size={size} color="secondary">
										{t('futures.market.trade.trade-balance.available-margin')}
									</Body>
									<NumericValue size="large" weight="bold">
										{formatDollars(54321)}
									</NumericValue>
								</FlexDivCol>
								<StyledCaretDownIcon $flip={expanded} />
							</FlexDivRow>
							{true && (
								<StyledFlexDivCol>
									<FlexDivRowCentered columnGap="5px">
										<Body size="medium" color="secondary">
											{t('futures.market.trade.trade-balance.locked-margin')}
										</Body>
										<Tooltip
											position="fixed"
											content={t('futures.market.trade.trade-balance.tooltip')}
											width="280px"
										>
											<HelpIcon />
										</Tooltip>
									</FlexDivRowCentered>
									<NumericValue size="large" weight="bold" color="secondary">
										{formatDollars(67890)}
									</NumericValue>
								</StyledFlexDivCol>
							)}
							<Button
								variant="yellow"
								size="xsmall"
								textTransform="none"
								onClick={() => dispatch(setOpenModal('futures_deposit_withdraw_smart_margin'))}
							>
								{t('futures.market.trade.trade-balance.manage-button')}
							</Button>
						</DepositContainer>
					</>
				)}
			</BalanceContainer>

			{/* {isWalletConnected && smartMarginAccount && !isDepositRequired && expanded && (
				<DetailsContainer>
					<SmartMarginInfoBox />
				</DetailsContainer>
			)} */}

		</Container>
	)
})

const DepositContainer = styled(FlexDivRowCentered)`
	width: 100%;
`

const StyledFlexDivCol = styled(FlexDivCol)`
	border-left: ${(props) => props.theme.colors.selectedTheme.border};
	padding-left: 10px;
`

const Container = styled.div<{ mobile?: boolean }>`
	width: 100%;
	padding: 13px 15px;
	border-bottom: ${(props) => (props.mobile ? props.theme.colors.selectedTheme.border : 0)};
`

const BalanceContainer = styled(FlexDivRowCentered)<{ clickable?: boolean }>`
	cursor: ${(props) => (props.clickable ? 'pointer' : 'default')};
	width: 100%;
`

const DetailsContainer = styled.div`
	margin-top: 7.5px;
`

export default TradeBalance
