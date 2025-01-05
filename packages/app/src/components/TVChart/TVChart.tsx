import {
	ChartingLibraryWidgetOptions,
	IChartingLibraryWidget,
	ResolutionString,
	TimeFrameItem,
	widget,
} from 'charting_library/charting_library'
import { useRouter } from 'next/router'
import { useRef, useContext, useEffect, useCallback, useMemo } from 'react'
import { ThemeContext } from 'styled-components'

import Connector from 'containers/Connector'
import { useAppSelector } from 'state/hooks'
import { selectCurrentTheme } from 'state/preferences/selectors'
import sdk from 'state/sdk'

import { DEFAULT_RESOLUTION } from './constants'
import DataFeedFactory from './DataFeed'
import { loadChartState, saveChartState } from './utils'
import { PricesListener } from '@bitly/sdk/types'

import styled from 'styled-components'
import { suggestedDecimals } from 'utils/prices'

export const ChartBody = styled.div<{ paddingTop?: string }>`
	padding-top: ${(props) => props.paddingTop || '0'};
	height: 100%;
	width: 100%;
`

export type ChartProps = {
	initialPrice: string
	onChartReady?: () => void
}

export type Props = ChartProps & {
	interval: string
	containerId: string
	libraryPath: string
	fullscreen: boolean
	autosize: boolean
	studiesOverrides: Record<string, any>
	overrides: Record<string, string>
}

export function TVChart({
	interval = DEFAULT_RESOLUTION,
	containerId = 'tv_chart_container',
	libraryPath = '/static/charting_library/',
	fullscreen = false,
	autosize = true,
	studiesOverrides = {},
	initialPrice,
	onChartReady = () => {
		return
	},
}: Props) {
	const currentTheme = useAppSelector(selectCurrentTheme)
	const _widget = useRef<IChartingLibraryWidget | null>(null)
	const _priceListener = useRef<PricesListener | undefined>()

	const router = useRouter()

	const { colors } = useContext(ThemeContext)
	const { network } = Connector.useContainer()

	const DEFAULT_OVERRIDES = {
		'paneProperties.background': colors.selectedTheme.newTheme.containers.primary.background,
		'chartProperties.background': colors.selectedTheme.newTheme.containers.primary.background,
		'paneProperties.backgroundType': 'solid',
	}

	const [marketAsset, marketAssetLoaded] = useMemo(() => {
		return router.query.asset ? [router.query.asset, true] : ['wETH', false]
	}, [router.query.asset])

	const decimals =
		Number(initialPrice) > 100 && Number(initialPrice) < 1000 ? 3 : suggestedDecimals(Number(initialPrice))
	const chartScale = 10 ** decimals

	useEffect(() => {
		return () => {
			if (_priceListener.current) {
				sdk.prices.removePricesListener(_priceListener.current)
			}
		}
	}, [])

	useEffect(() => {
		const chartData = loadChartState()

		const widgetOptions: ChartingLibraryWidgetOptions = {
			symbol: marketAsset as string,
			datafeed: DataFeedFactory(
				sdk.exchange.getMarketsInfo([]),
				chartScale,
				onSubscribe
			),
			interval: interval as ResolutionString,
			container: containerId,
			library_path: libraryPath,
			locale: 'en',
			disabled_features: [
				'header_compare',
				'hide_left_toolbar_by_default',
				'study_templates',
				'header_symbol_search',
				'display_market_status',
				'create_volume_indicator_by_default',
			],
			fullscreen: fullscreen,
			autosize: autosize,
			studies_overrides: studiesOverrides,
			theme: 'Dark',
			custom_css_url: './theme.css',
			loading_screen: {
				backgroundColor: colors.selectedTheme.newTheme.containers.primary.background,
			},
			overrides: DEFAULT_OVERRIDES,
			toolbar_bg: colors.selectedTheme.newTheme.containers.primary.background,
			time_frames: [
				{ text: '4H', resolution: '5', description: '4 hours' },
				{ text: '12H', resolution: '5', description: '1 Day' },
				{ text: '1D', resolution: '15', description: '1 Day' },
				{ text: '5D', resolution: '15', description: '5 Days' },
				{ text: '1M', resolution: '1H', description: '1 Month' },
				{ text: '3M', resolution: '1H', description: '3 Months' },
			] as TimeFrameItem[],
			saved_data: chartData,
		}

		const clearExistingWidget = () => {
			if (_widget.current !== null) {
				_widget.current.remove()
				_widget.current = null
			}
			if (_priceListener.current) {
				sdk.prices.removePricesListener(_priceListener.current)
			}
		}

		clearExistingWidget()

		// @ts-ignore complains about `container` item missing
		const tvWidget = new widget(widgetOptions)
		_widget.current = tvWidget

		_widget.current?.onChartReady(() => {
			_widget.current?.applyOverrides(DEFAULT_OVERRIDES)
			onChartReady()
		})

		return () => {
			clearExistingWidget()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network?.id, currentTheme, marketAssetLoaded, chartScale])

	useEffect(() => {
		_widget.current?.onChartReady(() => {
			const symbolInterval = _widget.current?.symbolInterval()
			_widget.current?.setSymbol(
				marketAsset as string,
				symbolInterval?.interval ?? DEFAULT_RESOLUTION,
				() => {}
			)
		})
	}, [marketAsset])

	useEffect(() => {
		const handleAutoSave = () => {
			_widget.current?.save(saveChartState)
		}

		_widget.current?.subscribe('onAutoSaveNeeded', handleAutoSave)

		return () => {
			_widget.current?.unsubscribe('onAutoSaveNeeded', handleAutoSave)
		}
	}, [])

	const onSubscribe = useCallback((priceListener: PricesListener) => {
		_priceListener.current = priceListener
	}, [])

	return <ChartBody id={containerId} />
}
