import {
	HistoryCallback,
	IBasicDataFeed,
	LibrarySymbolInfo,
	OnReadyCallback,
	PeriodParams,
	ResolutionString,
	SearchSymbolsCallback,
	SubscribeBarsCallback,
} from 'charting_library/charting_library'
import sdk from 'state/sdk'
import { ChartBar } from './types'
import { resolutionToSeconds } from './utils'
import { ExchangeMarketType, KLINE_SOLUTION, PricesListener } from '@bitly/sdk/types'

const supportedResolutions = [
	'60',
	'240',
	'1D',
] as ResolutionString[]

const _pricesListener: { current: PricesListener | undefined } = {
	current: undefined,
}

const _latestChartBar: { current: { bar: ChartBar; asset: string } | undefined } = {
	current: undefined,
}

const config = {
	supports_search: false,
	supports_group_request: true,
	supported_resolutions: supportedResolutions,
}

const updateBar = (bar: ChartBar, price: number) => {
	const high = Math.max(bar.high, price)
	const low = Math.min(bar.low, price)
	return {
		...bar,
		low,
		high,
		close: price,
	}
}

const subscribeOnChainPrices = (
	asset: string,
	resolution: ResolutionString,
	onTick: SubscribeBarsCallback
) => {
	if (_pricesListener.current) {
		sdk.prices.removePricesListener(_pricesListener.current)
	}
	const listener: PricesListener = ({ prices }) => {
		const price = prices[asset]
		if (price) {
			if (_latestChartBar.current?.asset !== asset) return
			const priceNum = price
			if (_latestChartBar.current && priceNum !== _latestChartBar.current.bar.close) {
				const updatedBar = updateBar(_latestChartBar.current.bar, priceNum)
				const resolutionMs = resolutionToSeconds(resolution) * 1000
				const timeSinceUpdate = Date.now() - updatedBar.time

				if (timeSinceUpdate > resolutionMs) {
					const lastClose = _latestChartBar.current.bar.close
					const latestBar = {
						high: lastClose,
						low: lastClose,
						open: lastClose,
						close: lastClose,
						time: Date.now(),
					}
					onTick(latestBar)
					_latestChartBar.current = {
						bar: latestBar,
						asset: asset,
					}
				} else {
					onTick(updatedBar)
					_latestChartBar.current = {
						bar: updatedBar,
						asset: asset,
					}
				}
			}
		}
	}
	_pricesListener.current = listener
	sdk.prices.onPricesUpdated(listener)
	return listener
}

const DataFeedFactory = (
	markets: ExchangeMarketType[],
	chartScale: number,
	onSubscribe: (priceListener: PricesListener) => void
): IBasicDataFeed => {
	_latestChartBar.current = undefined
	return {
		onReady: (cb: OnReadyCallback) => {
			setTimeout(() => cb(config), 500)
		},
		resolveSymbol: (symbolName: string, onSymbolResolvedCallback: (val: any) => any) => {
			// const { base, quote } = splitBaseQuote(symbolName)
			const market = symbolName
			const marketInfo = markets.filter(e=>e.marketAddress==market)[0]
			if (!marketInfo) {
				return
			}

			var symbol_stub = {
				name: market,
				description: marketInfo.displayName,
				type: 'crypto',
				session: '24x7',
				timezone: 'UTC',
				ticker: marketInfo.displayName,
				exchange: '',
				minmov: 1,
				pricescale: chartScale,
				has_intraday: true,
				intraday_multipliers: supportedResolutions,
				supported_resolution: supportedResolutions,
				volume_precision: 8,
				data_status: 'streaming',
			}

			setTimeout(function () {
				onSymbolResolvedCallback(symbol_stub)
			}, 0)
		},
		getBars: function (
			symbolInfo: LibrarySymbolInfo,
			_resolution: ResolutionString,
			{ from, to }: PeriodParams,
			onHistoryCallback: HistoryCallback,
			onErrorCallback: (error: any) => any
		) {
			const market = symbolInfo.name

			try {
				const nowSec = Number(((new Date()).getTime() / 1000).toFixed())
				sdk.prices.getKlines([market], _resolution as KLINE_SOLUTION, from - nowSec, to - nowSec).then((bars) => {
					const chartBars = bars.map((b: any) => {
						return {
							high: b.high,
							low: b.low,
							open: b.open,
							close: b.close,
							time: (new Date(b.time as string)).getTime(),
						}
					})
					const latestBar = chartBars[chartBars.length - 1]
					if (latestBar && latestBar.time > (_latestChartBar.current?.bar.time ?? 0)) {
						_latestChartBar.current = {
							bar: chartBars[chartBars.length - 1],
							asset: market,
						}
					}

					onHistoryCallback(chartBars, { noData: !chartBars.length })
				})
			} catch (err) {
				onErrorCallback(err)
			}
		},
		subscribeBars: (
			symbolInfo: LibrarySymbolInfo,
			_resolution: ResolutionString,
			onTick: SubscribeBarsCallback
		) => {
			const market = symbolInfo.name;

			// subscribe to on-chain prices
			const listener = subscribeOnChainPrices(market as string, _resolution, onTick)
			onSubscribe(listener)
		},
		unsubscribeBars: () => {},
		searchSymbols: (
			userInput: string,
			exchange: string,
			symbolType: string,
			onResult: SearchSymbolsCallback
		) => {
			onResult([])
		},
	}
}

export default DataFeedFactory
