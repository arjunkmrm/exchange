import { useInfiniteQuery } from 'react-query'
import QUERY_KEYS from 'constants/queryKeys'
import Connector from 'containers/Connector'
import logError from 'utils/logError'
import sdk from 'state/sdk'
import { useState } from 'react'
import { PERIOD_IN_SECONDS } from '@bitly/sdk/constants'
import { ExchangeOrdersType } from '@bitly/sdk/types'
import { POLL_INTERVAL_MS } from 'constants/defaults'

const useGetMyTradeHistory = (
	currencyKey: string
) => {
	const { network } = Connector.useContainer()
	const [lastRelativeTimeSec, setLastRelativeTimeSec] = useState(0)

	return useInfiniteQuery(
		QUERY_KEYS.Futures.Trades(network?.id as number, currencyKey),
		async ({ pageParam = 0 }) => {
			if (!currencyKey) return []

			const relativeToInSec: number = pageParam
			const relativeFromInSec: number = pageParam - PERIOD_IN_SECONDS.ONE_WEEK
			try {
				const response: ExchangeOrdersType = await sdk.exchange.getFinishedOrders(
					[currencyKey], 
					relativeFromInSec,
					relativeToInSec
				)
				setLastRelativeTimeSec(relativeFromInSec)
				return response[currencyKey]
			} catch (e) {
				logError(e)
				return null
			}
		},
		{
			refetchInterval: POLL_INTERVAL_MS,
			getNextPageParam: (lastPage) => {
				return lastRelativeTimeSec < -PERIOD_IN_SECONDS.ONE_YEAR ? undefined : lastRelativeTimeSec
			},
		}
	)
}

export default useGetMyTradeHistory
