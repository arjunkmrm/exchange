import { useAppSelector, useFetchAction, usePollAction } from 'state/hooks'
import { selectNetwork, selectWallet } from "state/wallet/selectors"
import { fetchDailyVolumes, fetchMarkets, fetchTokenList } from "./actions"
import { selectMarkets } from "./selectors"

export const usePollExchangeData = () => {
	const networkId = useAppSelector(selectNetwork)
	const markets = useAppSelector(selectMarkets)
	const wallet = useAppSelector(selectWallet)

	usePollAction('fetchDailyVolumes', fetchDailyVolumes, {
		dependencies: [networkId],
		intervalTime: 60000,
	})

	useFetchAction(fetchMarkets, { dependencies: [networkId] })

	useFetchAction(fetchTokenList, { dependencies: [networkId] })
}

