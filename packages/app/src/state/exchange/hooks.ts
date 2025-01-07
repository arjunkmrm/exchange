import { POLL_INTERVAL_MS } from 'constants/defaults'
import { selectMarketName, selectNetwork, selectWallet } from 'state/app/selectors'
import { useAppSelector, useFetchAction, usePollAction } from 'state/hooks'
import { fetchPreviousDayPrices } from 'state/prices/actions'
import { selectCurrentMarketPrice } from 'state/prices/selectors'
import { fetchBalance } from 'state/wallet/actions'
import { fetchDailyVolumes, fetchMarkets, fetchOpenOrders, fetchOrderbook } from "./actions"

export const useFetchExchangeData = () => {
	const wallet = useAppSelector(selectWallet)
	const network = useAppSelector(selectNetwork)
	const curMarketName = useAppSelector(selectMarketName)

	usePollAction('fetchDailyVolumes', fetchDailyVolumes, {
		dependencies: [network],
		intervalTime: POLL_INTERVAL_MS,
		disabled: curMarketName === undefined || network === undefined,
	})
	useFetchAction(fetchPreviousDayPrices, { 
		dependencies: [network, curMarketName],
		disabled: curMarketName === undefined || network === undefined,
	})
}

export const useFetchMarketData = () => {
	const wallet = useAppSelector(selectWallet)
	const network = useAppSelector(selectNetwork)
	const curMarketName = useAppSelector(selectMarketName)
	const curPrice = useAppSelector(selectCurrentMarketPrice)

	usePollAction('fetchOrderbook', fetchOrderbook, {
		dependencies: [network, curMarketName],
		intervalTime: POLL_INTERVAL_MS,
		disabled: curMarketName === undefined || curPrice === undefined,
	})

	useFetchAction(fetchOpenOrders, { 
		dependencies: [network, curMarketName],
		disabled: curMarketName === undefined || network === undefined || wallet === null,
	})

	useFetchAction(fetchBalance, { 
		dependencies: [network, curMarketName, wallet],
		disabled: curMarketName === undefined || network === undefined || wallet === null,
	})
}

