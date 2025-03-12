import { memo, useCallback, useMemo } from 'react'
import SelectCurrencyModal from './SelectCurrencyModal'
import { setOpenModal } from 'state/app/reducer'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { selectNetwork, selectShowModal } from 'state/app/selectors'
import { setBaseToken, setQuoteToken } from 'state/manage/reducer'
import { STABLE_COINS } from '@bitly/sdk/constants'
import { selectAllTokens } from 'state/manage/selectors'

const ListPairModals = memo(() => {
	const dispatch = useAppDispatch()
	const openModal = useAppSelector(selectShowModal)
	const networkId = useAppSelector(selectNetwork)
	const allTokens = useAppSelector(selectAllTokens)

	const closeModal = useCallback(() => {
		dispatch(setOpenModal({type: null}))
	}, [dispatch])

	const onQuoteCurrencyChange = useCallback((address: string) => {
		dispatch(setQuoteToken(address))
	}, [dispatch])

	const onBaseCurrencyChange = useCallback((address: string) => {
		dispatch(setBaseToken(address))
	}, [dispatch])

	const quoteTokens = useMemo(() => {
		return allTokens.filter(e=>STABLE_COINS?.[networkId.toString()]?.includes(e.address))
	}, [networkId, allTokens])

	const baseTokens = useMemo(() => {
		return allTokens.filter(e=>!STABLE_COINS?.[networkId.toString()]?.includes(e.address))
	}, [networkId, allTokens])

	return (
		<>
			{openModal?.type === 'quote-select' && (
				<SelectCurrencyModal tokens={quoteTokens} onDismiss={closeModal} onSelect={onQuoteCurrencyChange} />
			)}

			{openModal?.type === 'base-select' && (
				<SelectCurrencyModal tokens={baseTokens} onDismiss={closeModal} onSelect={onBaseCurrencyChange} />
			)}
		</>
	)
})

export default ListPairModals
