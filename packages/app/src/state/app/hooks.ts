import { DEFAULT_POLL_DELAY_TIME_MS, POLL_INTERVAL_MS } from 'constants/defaults'
import { useEffect } from 'react'
import { fetchMarkets, fetchTokenList } from 'state/exchange/actions'

import { useAppDispatch, useAppSelector, useFetchAction } from 'state/hooks'
import { updatePrices } from 'state/prices/actions'
import sdk from 'state/sdk'
import { setMarketName } from './actions'
import { selectMarketName, selectNetwork, selectWallet } from './selectors'

export function useFetchAppData(ready: boolean, marketName: string = '') {
	const dispatch = useAppDispatch()
	const wallet = useAppSelector(selectWallet)
	const network = useAppSelector(selectNetwork)
	const curMarketName = useAppSelector(selectMarketName)

	useEffect(()=> {
		dispatch(setMarketName(marketName))
	}, [marketName])

	useFetchAction(fetchTokenList, { 
		dependencies: [network, curMarketName],
		disabled: curMarketName === undefined,
	})

	useFetchAction(fetchMarkets, { 
		dependencies: [network, curMarketName],
		disabled: curMarketName === undefined,
	})

	useEffect(() => {
		if (ready && curMarketName !== undefined) {
			setTimeout(()=>sdk.prices.startPriceUpdates(POLL_INTERVAL_MS), DEFAULT_POLL_DELAY_TIME_MS)
		}
	}, [ready, curMarketName, network])

	useEffect(() => {
		sdk.prices.onPricesUpdated(({ prices }) => {
			dispatch(updatePrices(prices))
		})

		return () => {
			sdk.prices.removePricesListeners()
		}
	}, [dispatch])
}
