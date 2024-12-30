import { POLL_INTERVAL_MS } from 'constants/defaults'
import { selectMarketName, selectNetwork, selectWallet } from 'state/app/selectors'
import { useAppSelector, useFetchAction, usePollAction } from 'state/hooks'
import { fetchDailyVolumes, fetchMarkets } from "./actions"

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

	// usePollAction('fetchDailyVolumes', fetchDailyVolumes, {
	// 	dependencies: [network],
	// 	intervalTime: POLL_INTERVAL_MS,
	// 	disabled: curMarketName === undefined,
	// })

	// useFetchAction(fetchMarkets, { 
	// 	dependencies: [network, curMarketName],
	// 	disabled: curMarketName === undefined,
	// })
}

