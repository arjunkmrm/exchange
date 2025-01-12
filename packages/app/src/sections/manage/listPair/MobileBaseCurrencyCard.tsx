import { FC, memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from 'state/hooks'

import MobileCurrencyCard from './MobileCurrencyCard'
import { selectBaseToken } from 'state/manage/selectors'
import { setOpenModal } from 'state/app/reducer'

const MobileBaseCurrencyCard: FC = memo(() => {
	const { t } = useTranslation()
	const quoteCurrencyKey = useAppSelector(selectBaseToken)
	const dispatch = useAppDispatch()
	const openBaseModal = useCallback(() => dispatch(setOpenModal('base-select')), [dispatch])

	return (
		<MobileCurrencyCard
			currencyKey={quoteCurrencyKey}
			onCurrencySelect={openBaseModal}
			label={t('manage.list-pair.modal.base-token')}
		/>
	)
})

export default MobileBaseCurrencyCard
