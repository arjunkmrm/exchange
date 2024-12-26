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

const DepositWithdraw: FC<{address: string; symbol: string}> = ({address, symbol}) => {
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
		return depositAmount <= allowances[address]
	}, [depositAmount, allowances, address])

	const balanceInWallet = useMemo(() => {
		return balancesInWallet[address] ?? 0
	}, [balancesInWallet, address])

	const balanceInBank = useMemo(() => {
		return balancesInBank[address] ?? 0
	}, [balancesInBank, address])

	const handleApprove = useCallback((amount: string) => {
		dispatch(approve({
			amount: Number(amount),
			token: address
		}))
	}, [dispatch, address])

	const handleStakeKwenta = useCallback(
		(amount: string) => {
			setDepositAmount(Number(amount))
			dispatch(deposit({
				amount: Number(amount),
				token: address
			}))
		},
		[dispatch, address]
	)

	const handleUnstakeKwenta = useCallback(
		(amount: string) => {
			dispatch(withdraw({
				amount: Number(amount),
				token: address
			}))
		},
		[dispatch, address]
	)

	return (
		<DWCard
			tokenSymbol={symbol}
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
