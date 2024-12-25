import { FC, memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import Button from 'components/Button'
import NumericInput from 'components/Input/NumericInput'
import { FlexDivCol, FlexDivRowCentered } from 'components/layout/flex'
import SegmentedControl from 'components/SegmentedControl'
import { DEFAULT_CRYPTO_DECIMALS, DEFAULT_TOKEN_DECIMALS } from 'constants/defaults'
import media from 'styles/media'

import { Body, NumericValue } from './Text'
import { truncateNumbers } from 'utils/number'

type DWCardProps = {
	title: string
	stakeBalance: number
	unstakeBalance: number
	onStake(amount: string): void
	onUnstake(amount: string): void
	isStaked?: boolean | undefined
	isUnstaked?: boolean | undefined
	isApproved?: boolean
	onApprove?: (amount: string) => void
	isStaking?: boolean
	isUnstaking?: boolean
	isApproving?: boolean
}

const DWCard: FC<DWCardProps> = memo(
	({
		title,
		stakeBalance,
		unstakeBalance,
		onStake,
		onUnstake,
		isStaked = false,
		isUnstaked = false,
		isApproved,
		onApprove,
		isStaking = false,
		isUnstaking = false,
		isApproving = false,
	}) => {
		const { t } = useTranslation()
		const [amount, setAmount] = useState('')
		const [activeTab, setActiveTab] = useState(0)

		const balance = useMemo(() => {
			return activeTab === 0 ? stakeBalance : unstakeBalance
		}, [activeTab, stakeBalance, unstakeBalance])

		const isEnabled = useMemo(() => {
			return Number(amount) > 0 && balance > 0
		}, [amount, balance])

		const isStakeEnabled = useMemo(() => {
			return activeTab === 0 && isEnabled
		}, [activeTab, isEnabled])

		const isUnstakeEnabled = useMemo(() => {
			return activeTab === 1 && isEnabled
		}, [activeTab, isEnabled])

		const isDisabled = useMemo(() => {
			return activeTab === 0 ? !isStakeEnabled : !isUnstakeEnabled
		}, [activeTab, isStakeEnabled, isUnstakeEnabled])

		const balanceString = useMemo(() => {
			return truncateNumbers(balance, DEFAULT_CRYPTO_DECIMALS)
		}, [balance])

		const isLoading = useMemo(() => {
			return activeTab === 0 ? (isApproved ? isStaking : isApproving) : isUnstaking
		}, [activeTab, isApproved, isApproving, isStaking, isUnstaking])

		const onMaxClick = useCallback(() => {
			setAmount(truncateNumbers(balance, DEFAULT_TOKEN_DECIMALS))
		}, [balance])

		const handleTabChange = useCallback((tabIndex: number) => {
			setAmount('')
			setActiveTab(tabIndex)
		}, [])

		const handleSubmit = useCallback(() => {
			if (isStakeEnabled) {
				if (isApproved) {
					onStake(amount)
				} else {
					onApprove?.(amount)
				}
			} else if (isUnstakeEnabled) {
				onUnstake(amount)
			}
		}, [isStakeEnabled, isUnstakeEnabled, onStake, onUnstake, amount, onApprove, isApproved])

		const handleChange = useCallback((_: any, newValue: string) => {
			if (newValue !== '' && newValue.indexOf('.') === -1) {
				setAmount(parseFloat(newValue).toString())
			} else {
				setAmount(newValue)
			}
		}, [])

		useEffect(() => {
			if ((activeTab === 0 && isStaked) || (activeTab === 1 && isUnstaked)) {
				setAmount('')
			}
		}, [activeTab, isStaked, isUnstaked])

		return (
			<CardGridContainer>
				<SegmentedControl
					values={[
						t('dashboard.stake.tabs.stake-table.stake'),
						t('dashboard.stake.tabs.stake-table.unstake'),
					]}
					onChange={handleTabChange}
					selectedIndex={activeTab}
				/>
				<FlexDivCol rowGap="50px" style={{ marginTop: '15px' }}>
					<FlexDivCol>
						<StakeInputHeader>
							<Body color="secondary">{title}</Body>
							<StyledFlexDivRowCentered>
								<Body color="secondary">{t('dashboard.stake.tabs.stake-table.balance')}</Body>
								<NumericValueButton onClick={onMaxClick}>{balanceString}</NumericValueButton>
							</StyledFlexDivRowCentered>
						</StakeInputHeader>
						<NumericInput value={amount} onChange={handleChange} bold />
					</FlexDivCol>
					<FlexDivCol>
						<Button
							fullWidth
							variant="flat"
							size="small"
							disabled={isDisabled}
							loading={isLoading}
							onClick={handleSubmit}
						>
							{activeTab === 0
								? isApproved
									? t('dashboard.stake.tabs.stake-table.stake')
									: t('dashboard.stake.tabs.stake-table.approve')
								: t('dashboard.stake.tabs.stake-table.unstake')}
						</Button>
					</FlexDivCol>
				</FlexDivCol>
			</CardGridContainer>
		)
	}
)

const StyledFlexDivRowCentered = styled(FlexDivRowCentered)`
	column-gap: 5px;
`

const StakeInputHeader = styled(FlexDivRowCentered)`
	margin: 25px 0 10px;
	color: ${(props) => props.theme.colors.selectedTheme.title};
	font-size: 14px;
`

const NumericValueButton = styled(NumericValue)`
	cursor: pointer;
`

const StakingCard = styled.div<{ $noPadding?: boolean }>`
	background: ${(props) => props.theme.colors.selectedTheme.newTheme.containers.cards.background};
	padding: 25px;
	border-radius: 15px;
	border: 1px solid ${(props) => props.theme.colors.selectedTheme.newTheme.border.color};

	.title {
		font-size: 15px;
		color: ${(props) => props.theme.colors.selectedTheme.title};
	}

	.value {
		font-family: ${(props) => props.theme.fonts.monoBold};
		font-size: 26px;
		color: ${(props) => props.theme.colors.selectedTheme.yellow};
		margin-top: 10px;
	}

	.label {
		font-size: 13px;
		color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.primary};
	}

	${(props) =>
		props.$noPadding &&
		css`
			padding: 0;
			overflow: hidden;
		`}
`

const SplitStakingCard = styled(StakingCard)`
	display: flex;
	padding: 0;
	cursor: pointer;

	& > div {
		display: flex;
		flex: 1;
		flex-direction: column;
		padding: 30px 0;
		padding-left: 30px;

		&:first-of-type {
			border-right: ${(props) => props.theme.colors.selectedTheme.border};
		}
	}
`

const CardGridContainer = styled(StakingCard)`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	${media.lessThan('lg')`
		justify-content: flex-start;
	`}
`

export default DWCard
