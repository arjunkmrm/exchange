import { useConnectModal } from '@rainbow-me/rainbowkit'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from 'components/Button'
import Connector from 'containers/Connector'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { selectBaseToken, selectQuoteToken } from 'state/manage/selectors'
import { listPair } from 'state/exchange/actions'
import { selectListPairStatus } from 'state/exchange/selectors'
import { FetchStatus } from 'state/types'

const ListPairButton: FC = () => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const { isWalletConnected } = Connector.useContainer()
	const { openConnectModal: connectWallet } = useConnectModal()
	const baseToken = useAppSelector(selectBaseToken)
	const quoteToken = useAppSelector(selectQuoteToken)
	const listPairStatus = useAppSelector(selectListPairStatus)
	const [loading, setLoading] = useState<boolean>(false)

	const disabled = useMemo(() => {
		return baseToken === '' || quoteToken === ''
	}, [baseToken, quoteToken])

	useEffect(() => {
		if (listPairStatus === FetchStatus.Loading) {
			setLoading(true)
		} else {
			setLoading(false)
		}
	}, [listPairStatus])

	const handleSubmit = useCallback(() => {
		dispatch(listPair({base: baseToken, quote: quoteToken}))
	}, [dispatch, baseToken, quoteToken])

	return isWalletConnected ? (
		<Button
			disabled={disabled}
			onClick={handleSubmit}
			size="medium"
			loading={loading}
			data-testid="submit-order"
			fullWidth
		>
			{t('manage.list-pair.button.submit')}
		</Button>
	) : (
		<Button onClick={connectWallet} size="medium" fullWidth noOutline>
			{t('common.wallet.connect-wallet')}
		</Button>
	)
}

export default ListPairButton
