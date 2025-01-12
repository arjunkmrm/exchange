import { FC, memo, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { setOpenModal } from 'state/app/reducer'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { selectBaseToken } from 'state/manage/selectors'

import CurrencyCard from './CurrencyCard'

// TODO: Reconsider consolidating the mobile and desktop currency cards.
// A number of performance considerations have changed, given the move
// away from Recoil to Redux.

const BaseCurrencyCard: FC = memo(() => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const openBaseModal = useCallback(() => dispatch(setOpenModal('base-select')), [dispatch])
	const baseToken = useAppSelector(selectBaseToken)

	return (
		<CurrencyCard
			side="base"
			currencyKey={baseToken}
			onCurrencySelect={openBaseModal}
			label={t('manage.list-pair.modal.base-token')}
		/>
	)
})

export default BaseCurrencyCard
