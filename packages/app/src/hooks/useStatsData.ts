import { useMemo } from 'react'
import {
	selectOptimismMarkPrices,
	selectOptimismMarkets,
} from 'state/futures/smartMargin/selectors'
import { useAppSelector } from 'state/hooks'
import { selectMinTimestamp } from 'state/stats/selectors'

export type StatsTimeframe = '4H' | '1D' | '1W' | '1M' | '1Y' | 'MAX'

export type DailyStat = {
	timestamp: number
	volume: number
	trades: number
	feesSynthetix: number
	feesKwenta: number
	cumulativeTrades: number
	uniqueTraders: number
	cumulativeTraders: number
}

const useStatsData = () => {
	const futuresMarkets = useAppSelector(selectOptimismMarkets)
	const prices = useAppSelector(selectOptimismMarkPrices)
	const minTimestamp = useAppSelector(selectMinTimestamp)

	const openInterestData = useMemo(() => {
		return futuresMarkets.map(({ marketKey, asset, marketSize }) => {
			return {
				asset,
				openInterest: marketSize.mul(prices[marketKey]).toNumber(),
			}
		})
	}, [futuresMarkets, prices])

	return {
		dailyStatsData: [],
		dailyStatsIsLoading: true,
		openInterestData,
	}
}

export default useStatsData
