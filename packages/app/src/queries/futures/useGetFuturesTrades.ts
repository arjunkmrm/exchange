import {  notNill } from '@bitly/sdk/utils'
import { utils as ethersUtils } from 'ethers'
import { useInfiniteQuery } from 'react-query'

import { DEFAULT_NUMBER_OF_TRADES, MAX_TIMESTAMP } from 'constants/defaults'
import QUERY_KEYS from 'constants/queryKeys'
import Connector from 'containers/Connector'
import logError from 'utils/logError'
import sdk from 'state/sdk'
import { useState } from 'react'
import { PERIOD_IN_SECONDS } from '@bitly/sdk/dist/constants'
import { ExchangeOrdersType } from '@bitly/sdk/dist/types'

const useGetFuturesTrades = (
	currencyKey: string
) => {
	const { network } = Connector.useContainer()
	const [lastRelativeTimeSec, setLastRelativeTimeSec] = useState(0)

	return useInfiniteQuery(
		QUERY_KEYS.Futures.Trades(network?.id as number, currencyKey),
		async ({ pageParam = 0 }) => {
			if (!currencyKey) return null

			const relativeToInSec: number = pageParam
			const relativeFromInSec: number = pageParam - PERIOD_IN_SECONDS.ONE_DAY
			try {
				const response: ExchangeOrdersType = await sdk.exchange.getFinishedOrders(
					[currencyKey], 
					relativeFromInSec,
					relativeToInSec
				)
				

				return response[currencyKey]
			} catch (e) {
				logError(e)
				return null
			}
		},
		{
			// refetchInterval: 15000,
			getNextPageParam: (lastPage) => {
				const nextPageParam = lastRelativeTimeSec-PERIOD_IN_SECONDS.ONE_DAY
				setLastRelativeTimeSec(nextPageParam)
				return (notNill(lastPage) && lastPage?.length > 0) ?? nextPageParam
			},
		}
	)
}

export default useGetFuturesTrades
