import React, { useCallback } from 'react'

import TextToggle from 'components/TextToggle'
import { useAppSelector, useAppDispatch } from 'state/hooks'
import { toggleShowOrderbook } from 'state/app/reducer'
import { selectIsShowOrderbook } from 'state/app/selectors'

const HistoryToggle = () => {
	const dispatch = useAppDispatch()
	const showOrderbook = useAppSelector(selectIsShowOrderbook)

	const handleHistoryChange = useCallback(() => {
		dispatch(toggleShowOrderbook())
	}, [dispatch])

	return (
		<TextToggle
			title="Orderbook"
			options={['show', 'hide']}
			selectedOption={showOrderbook ? 'show' : 'hide'}
			onOptionChange={handleHistoryChange}
		/>
	)
}

export default HistoryToggle
