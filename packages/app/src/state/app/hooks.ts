import { useEffect } from 'react'

import { fetchBalances } from 'state/balances/actions'
import { selectMarkets } from 'state/exchange/selectors'
import { useAppDispatch, useAppSelector, useFetchAction, usePollAction } from 'state/hooks'
import { fetchPreviousDayPrices, updatePrices } from 'state/prices/actions'
import sdk from 'state/sdk'
import { selectNetwork, selectWallet } from 'state/wallet/selectors'
import { setMarketName } from './reducer'
import { selectMarketName } from './selectors'

export function useAppData(ready: boolean) {
	const dispatch = useAppDispatch()
	const wallet = useAppSelector(selectWallet)
	const markets = useAppSelector(selectMarkets)
	const network = useAppSelector(selectNetwork)
	const marketName = useAppSelector(selectMarketName)

	usePollAction('fetchBalances', fetchBalances, { dependencies: [wallet, network] })

	usePollAction('fetchPreviousDayPrices', fetchPreviousDayPrices, {
		intervalTime: 60000,
		dependencies: [markets.length, network, marketName],
		disabled: !markets.length,
	})

	useEffect(()=> {
		dispatch(setMarketName(''))
	}, [])

	useEffect(() => {
		if (ready && marketName !== undefined) {
			setTimeout(()=>sdk.prices.startPriceUpdates(60000), 5000)
		}
	}, [ready, marketName])

	useEffect(() => {
		sdk.prices.onPricesUpdated(({ prices }) => {
			dispatch(updatePrices(prices))
		})

		return () => {
			sdk.prices.removePricesListeners()
		}
	}, [dispatch])
}
