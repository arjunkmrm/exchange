import { useConnectModal } from '@rainbow-me/rainbowkit'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from 'components/Button'
import Connector from 'containers/Connector'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { listToken } from 'state/exchange/actions'
import { ListTokenProps } from '@bitly/sdk/types'
import { selectListTokenStatus } from 'state/exchange/selectors'
import { FetchStatus } from 'state/types'

const ListTokenButton: FC<ListTokenProps> = (token) => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const { isWalletConnected } = Connector.useContainer()
	const { openConnectModal: connectWallet } = useConnectModal()
	const listTokenStatus = useAppSelector(selectListTokenStatus)
	const [loading, setLoading] = useState<boolean>(false)

	const disabled = useMemo(() => {
		return !token.address || !token.description || !token.url || !token.logo
	}, [token])

	useEffect(() => {
		if (listTokenStatus === FetchStatus.Loading) {
			setLoading(true)
		} else {
			setLoading(false)
		}
	}, [listTokenStatus])

	const handleSubmit = useCallback(() => {
		dispatch(listToken({
			address: token.address, 
			description: token.description,
			url: token.url, 
			logo: token.logo,
		}))
	}, [token])

	return isWalletConnected ? (
		<Button
			disabled={disabled}
			onClick={handleSubmit}
			size="medium"
			data-testid="submit-order"
			fullWidth
		>
			{t('manage.list-token.button.submit')}
		</Button>
	) : (
		<Button onClick={connectWallet} size="medium" fullWidth noOutline>
			{t('common.wallet.connect-wallet')}
		</Button>
	)
}

export default ListTokenButton
