import { DEFAULT_POLL_DELAY_TIME_MS, POLL_INTERVAL_MS } from 'constants/defaults'
import { useEffect } from 'react'
import { fetchOpenOrders, fetchTokenList } from 'state/exchange/actions'

import { useAppDispatch, useAppSelector, usePollAction, useFetchAction } from 'state/hooks'
import { fetchPreviousDayPrices, updatePrices } from 'state/prices/actions'
import sdk from 'state/sdk'
import { fetchBalance } from 'state/wallet/actions'
import { setMarketName } from './actions'
import { selectMarketName, selectNetwork, selectWallet } from './selectors'

export function useAppData(ready: boolean, marketName: string = '') {
	const dispatch = useAppDispatch()
	const wallet = useAppSelector(selectWallet)
	const network = useAppSelector(selectNetwork)
	const curMarketName = useAppSelector(selectMarketName)

	useEffect(()=> {
		dispatch(setMarketName(marketName))
	}, [])

	usePollAction('fetchBalances', fetchBalance, { 
		intervalTime: POLL_INTERVAL_MS,
		dependencies: [wallet, network, curMarketName],
		disabled: curMarketName === undefined || !ready || network === undefined,
	})

	useFetchAction(fetchTokenList, { 
		dependencies: [network, curMarketName],
		disabled: curMarketName === undefined,
	})

	usePollAction('fetchOpenOrders', fetchOpenOrders, { 
		intervalTime: POLL_INTERVAL_MS,
		dependencies: [wallet, network, curMarketName],
		disabled: curMarketName === undefined || !ready || network === undefined,
	})

	usePollAction('fetchPreviousDayPrices', fetchPreviousDayPrices, {
		intervalTime: POLL_INTERVAL_MS,
		dependencies: [network, curMarketName],
		disabled: curMarketName === undefined || !ready || network === undefined,
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
