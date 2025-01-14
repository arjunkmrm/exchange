import { useConnectModal } from '@rainbow-me/rainbowkit'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from 'components/Button'
import Connector from 'containers/Connector'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { FetchStatus } from 'state/types'
import { createMarket } from 'state/manage/actions'
import { selectCreateMarketStatus } from 'state/manage/selectors'

type CreateMarketButtonProps = {
	marketName?: string
}

const CreateMarketButton: FC<CreateMarketButtonProps> = ({marketName}) => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const { isWalletConnected } = Connector.useContainer()
	const { openConnectModal: connectWallet } = useConnectModal()
	const createMarketStatus = useAppSelector(selectCreateMarketStatus)
	const [loading, setLoading] = useState<boolean>(false)

	const disabled = useMemo(() => {
		return !marketName
	}, [marketName])

	useEffect(() => {
		if (createMarketStatus === FetchStatus.Loading) {
			setLoading(true)
		} else {
			setLoading(false)
		}
	}, [createMarketStatus])

	const handleSubmit = useCallback(() => {
		setLoading(true)
		dispatch(createMarket({marketName: marketName ?? ''}))
	}, [marketName])

	return isWalletConnected ? (
		<Button
			disabled={disabled}
			onClick={handleSubmit}
			size="medium"
			data-testid="submit-order"
			loading={loading}
			fullWidth
		>
			{t('manage.custom-markets.button.submit')}
		</Button>
	) : (
		<Button loading={loading} onClick={connectWallet} size="medium" fullWidth noOutline>
			{t('common.wallet.connect-wallet')}
		</Button>
	)
}

export default CreateMarketButton
