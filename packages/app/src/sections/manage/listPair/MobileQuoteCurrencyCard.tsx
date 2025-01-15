import { FC, memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from 'state/hooks'

import MobileCurrencyCard from './MobileCurrencyCard'
import { selectQuoteToken } from 'state/manage/selectors'
import { setOpenModal } from 'state/app/reducer'

const MobileQuoteCurrencyCard: FC = memo(() => {
	const { t } = useTranslation()
	const quoteCurrencyKey = useAppSelector(selectQuoteToken)
	const dispatch = useAppDispatch()
	const openQuoteModal = useCallback(() => dispatch(setOpenModal({type: 'quote-select'})), [dispatch])

	return (
		<MobileCurrencyCard
			currencyKey={quoteCurrencyKey}
			onCurrencySelect={openQuoteModal}
			label={t('manage.list-pair.modal.quote-token')}
		/>
	)
})

export default MobileQuoteCurrencyCard
