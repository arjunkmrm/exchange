import { useEffect } from 'react'

// import { fetchBalances } from 'state/balances/actions'
// import { selectMarkets } from 'state/futures/selectors'
import { useAppDispatch, useAppSelector, usePollAction } from 'state/hooks'
// import { fetchPreviousDayPrices, updatePrices } from 'state/prices/actions'
import sdk from 'state/sdk'
// import { selectNetwork, selectWallet } from 'state/wallet/selectors'

export function useAppData(ready: boolean) {
	const dispatch = useAppDispatch()
	// const wallet = useAppSelector(selectWallet)
	// const markets = useAppSelector(selectMarkets)
	// const network = useAppSelector(selectNetwork)

	// usePollAction('fetchBalances', fetchBalances, { dependencies: [wallet, network] })

	// usePollAction('fetchPreviousDayPrices', fetchPreviousDayPrices, {
	// 	intervalTime: 60000 * 15,
	// 	dependencies: [markets.length, network],
	// 	disabled: !markets.length,
	// })

	useEffect(() => {
		if (ready) {
			sdk.prices.startPriceUpdates(1500000)
		}
	}, [ready])

	// useEffect(() => {
	// 	sdk.prices.onPricesUpdated(({ prices }) => {
	// 		dispatch(updatePrices(prices))
	// 	})

	// 	return () => {
	// 		sdk.prices.removePricesListeners()
	// 	}
	// }, [dispatch])
}
