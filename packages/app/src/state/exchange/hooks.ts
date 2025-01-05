import { POLL_INTERVAL_MS } from 'constants/defaults'
import { selectMarketName, selectNetwork, selectWallet } from 'state/app/selectors'
import { useAppSelector, useFetchAction, usePollAction } from 'state/hooks'
import { selectCurrentMarketPrice } from 'state/prices/selectors'
import { fetchDailyVolumes, fetchMarkets, fetchOrderbook } from "./actions"

export const usePollExchangeData = () => {
	const wallet = useAppSelector(selectWallet)
	const network = useAppSelector(selectNetwork)
	const curMarketName = useAppSelector(selectMarketName)

	usePollAction('fetchDailyVolumes', fetchDailyVolumes, {
		dependencies: [network],
		intervalTime: POLL_INTERVAL_MS,
		disabled: curMarketName === undefined,
	})

	useFetchAction(fetchMarkets, { 
		dependencies: [network, curMarketName],
		disabled: curMarketName === undefined,
	})
}

export const usePollMarketData = () => {
	const wallet = useAppSelector(selectWallet)
	const network = useAppSelector(selectNetwork)
	const curMarketName = useAppSelector(selectMarketName)
	const curPrice = useAppSelector(selectCurrentMarketPrice)

	usePollAction('fetchOrderbook', fetchOrderbook, {
		dependencies: [network, curMarketName],
		intervalTime: POLL_INTERVAL_MS,
		disabled: curMarketName === undefined || curPrice === undefined,
	})
}

