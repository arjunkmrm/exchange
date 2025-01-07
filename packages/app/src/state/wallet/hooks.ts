import { DEFAULT_TIME_SPAN } from 'constants/defaults'
import { useAppDispatch, useAppSelector, useFetchAction } from 'state/hooks'
import { fetchPricesSeries } from 'state/prices/actions'
import { fetchBalance, fetchBalanceSeries } from 'state/wallet/actions'
import { selectMarketName, selectNetwork, selectWallet } from '../app/selectors'

export function useFetchWalletData() {
	const dispatch = useAppDispatch()
	const wallet = useAppSelector(selectWallet)
	const network = useAppSelector(selectNetwork)
	const curMarketName = useAppSelector(selectMarketName)

	useFetchAction(()=>fetchPricesSeries(DEFAULT_TIME_SPAN), { 
		dependencies: [network, curMarketName],
		disabled: curMarketName === undefined || network === undefined || wallet === null,
	})

	useFetchAction(()=>fetchBalanceSeries(DEFAULT_TIME_SPAN), { 
		dependencies: [network, curMarketName],
		disabled: curMarketName === undefined || network === undefined || wallet === null,
	})

	useFetchAction(fetchBalance, { 
		dependencies: [network, curMarketName, wallet],
		disabled: curMarketName === undefined || network === undefined || wallet === null,
	})
}
