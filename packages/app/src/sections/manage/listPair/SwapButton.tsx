import { useConnectModal } from '@rainbow-me/rainbowkit'
import { FC, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import Button from 'components/Button'
import Connector from 'containers/Connector'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { selectBaseToken, selectQuoteToken } from 'state/manage/selectors'
import { listPair } from 'state/exchange/actions'

const ListPairButton: FC = () => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const { isWalletConnected } = Connector.useContainer()
	const { openConnectModal: connectWallet } = useConnectModal()
	const baseToken = useAppSelector(selectBaseToken)
	const quoteToken = useAppSelector(selectQuoteToken)

	const disabled = useMemo(() => {
		return baseToken === '' || quoteToken === ''
	}, [baseToken, quoteToken])

	const handleSubmit = useCallback(() => {
		dispatch(listPair({base: baseToken, quote: quoteToken}))
	}, [dispatch, baseToken, quoteToken])

	return isWalletConnected ? (
		<Button
			disabled={disabled}
			onClick={handleSubmit}
			size="medium"
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
