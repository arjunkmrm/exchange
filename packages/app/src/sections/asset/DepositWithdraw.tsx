import { wei } from '@synthetixio/wei'
import _ from 'lodash'
import { FC, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import DWCard from 'components/DWCard'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { 
	selectAllowances, 
	selectBalanceInBank, 
	selectBalanceInWallet, 
	selectIsApproving, 
	selectIsDeposited, 
	selectIsDepositing, 
	selectIsWithdrawed, 
	selectIsWithdrawing
} from 'state/wallet/selectors'
import { approve, deposit, withdraw } from 'state/wallet/actions'

const DepositWithdraw: FC<{token: string}> = ({token}) => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const [depositAmount, setDepositAmount] = useState(0)

	const balancesInWallet = useAppSelector(selectBalanceInWallet)
	const balancesInBank = useAppSelector(selectBalanceInBank)
	const allowances = useAppSelector(selectAllowances)
	const isDeposited = useAppSelector(selectIsDeposited)
	const isWithdrawed = useAppSelector(selectIsWithdrawed)
	const isWithdrawing = useAppSelector(selectIsWithdrawing)
	const isDepositing = useAppSelector(selectIsDepositing)
	const isApproving = useAppSelector(selectIsApproving)

	const isApproved = useMemo(() => {
		return depositAmount <= allowances[token]
	}, [depositAmount, allowances, token])

	const balanceInWallet = useMemo(() => {
		return balancesInWallet[token] ?? 0
	}, [balancesInWallet, token])

	const balanceInBank = useMemo(() => {
		return balancesInBank[token] ?? 0
	}, [balancesInBank, token])

	const handleApprove = useCallback((amount: string) => {
		dispatch(approve({
			amount: Number(amount),
			token
		}))
	}, [dispatch, token])

	const handleStakeKwenta = useCallback(
		(amount: string) => {
			setDepositAmount(Number(amount))
			dispatch(deposit({
				amount: Number(amount),
				token
			}))
		},
		[dispatch, token]
	)

	const handleUnstakeKwenta = useCallback(
		(amount: string) => {
			dispatch(withdraw({
				amount: Number(amount),
				token
			}))
		},
		[dispatch, token]
	)

	return (
		<DWCard
			title={t('dashboard.stake.tabs.stake-table.kwenta-token')}
			stakeBalance={balanceInWallet}
			unstakeBalance={balanceInBank}
			onStake={handleStakeKwenta}
			onUnstake={handleUnstakeKwenta}
			isStaked={isDeposited}
			isUnstaked={isWithdrawed}
			isApproved={isApproved}
			onApprove={handleApprove}
			isStaking={isDepositing}
			isUnstaking={isWithdrawing}
			isApproving={isApproving}
		/>
	)
}

export default DepositWithdraw
