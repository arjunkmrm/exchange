import { useConnectModal } from '@rainbow-me/rainbowkit'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from 'components/Button'
import Connector from 'containers/Connector'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { FetchStatus } from 'state/types'
import { selectAddPairToMarketStatus } from 'state/manage/selectors'
import { addPairToMarket } from 'state/manage/actions'

const AddPairButton: FC<{marketName?: string; address?: string}> = ({marketName, address}) => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const { isWalletConnected } = Connector.useContainer()
	const { openConnectModal: connectWallet } = useConnectModal()
	const addPairStatus = useAppSelector(selectAddPairToMarketStatus)
	const [loading, setLoading] = useState<boolean>(false)

	const disabled = useMemo(() => {
		return !address || !marketName
	}, [address, marketName])

	useEffect(() => {
		if (addPairStatus === FetchStatus.Loading) {
			setLoading(true)
		} else {
			setLoading(false)
		}
	}, [addPairStatus])

	const handleSubmit = useCallback(() => {
		setLoading(true)
		dispatch(addPairToMarket({
			marketName: marketName ?? '', 
			address: address ?? '',
		}))
	}, [address, marketName, dispatch])

	return isWalletConnected ? (
		<Button
			disabled={disabled}
			onClick={handleSubmit}
			size="small"
			loading={loading}
			data-testid="submit-order"
			fullWidth
		>
			{t('modals.manage-custom-market.submit')}
		</Button>
	) : (
		<Button loading={loading} onClick={connectWallet} size="medium" fullWidth noOutline>
			{t('common.wallet.connect-wallet')}
		</Button>
	)
}

export default AddPairButton
