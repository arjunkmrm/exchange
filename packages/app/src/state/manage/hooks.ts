import { useAppSelector, useFetchAction } from 'state/hooks'
import { selectNetwork, selectWallet } from '../app/selectors'
import { fetchAllMarkets, fetchAllTokens, fetchMarketsByOwner } from './actions'

export function useFetchManageData() {
	const wallet = useAppSelector(selectWallet)
	const network = useAppSelector(selectNetwork)

	useFetchAction(fetchMarketsByOwner, { 
		dependencies: [network, wallet],
		disabled: network === undefined || wallet === null,
	})

	useFetchAction(fetchAllTokens, { 
		dependencies: [network],
		disabled: network === undefined,
	})

	useFetchAction(fetchAllMarkets, { 
		dependencies: [network],
		disabled: network === undefined,
	})
}
