import { FC, memo, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { setOpenModal } from 'state/app/reducer'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { selectQuoteToken } from 'state/manage/selectors'

import CurrencyCard from './CurrencyCard'

// TODO: Reconsider consolidating the mobile and desktop currency cards.
// A number of performance considerations have changed, given the move
// away from Recoil to Redux.

const BaseCurrencyCard: FC = memo(() => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const openQuoteModal = useCallback(() => dispatch(setOpenModal({type: 'quote-select'})), [dispatch])
	const quoteToken = useAppSelector(selectQuoteToken)

	return (
		<CurrencyCard
			side="quote"
			currencyKey={quoteToken}
			onCurrencySelect={openQuoteModal}
			label={t('manage.list-pair.modal.quote-token')}
		/>
	)
})

export default BaseCurrencyCard
