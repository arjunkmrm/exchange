import React, { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { getColorFromPriceChange } from 'components/ColoredPrice'
import { FlexDivCol, FlexDivRow, FlexDivRowCentered } from 'components/layout/flex'
import { Body } from 'components/Text'
import { NO_VALUE } from 'constants/placeholder'
import useWindowSize from 'hooks/useWindowSize'
import { useAppSelector } from 'state/hooks'
import { selectCurrentMarketPastPrice, selectCurrentMarketPrice, selectPreviousDayPrices } from 'state/prices/selectors'
import media from 'styles/media'

import { MARKETS_DETAILS_HEIGHT_DESKTOP } from '../styles'

import HistoryToggle from './HistoryToggle'
import { MarketDataKey } from './utils'
import { selectCurrentMarketAsset, selectCurrentMarketInfo, selectMarketVolumes } from 'state/exchange/selectors'
import MarketDetail from './MarketDetail'
import { formatCurrency, formatDollars, formatPercent } from 'utils/prices'

type MarketDetailsProps = {
	mobile?: boolean
}

const MarketDetails: React.FC<MarketDetailsProps> = () => {
	const { deviceType } = useWindowSize()
	const mobileOrTablet = deviceType !== 'desktop'

	const SelectedMarketDetailsView = mobileOrTablet ? (
		<MarketDetailsContainer mobile={mobileOrTablet}>
			<MarketPriceDetail mobile={mobileOrTablet} />
			<DailyChangeDetail mobile={mobileOrTablet} />
			<DailyVolume mobile={mobileOrTablet} />
		</MarketDetailsContainer>
	) : (
		<MarketDetailsContainer>
			<MarketPriceDetail />
			<DailyChangeDetail />
			<DailyVolume />
		</MarketDetailsContainer>
	)

	return (
		<MainContainer mobile={mobileOrTablet}>
			{SelectedMarketDetailsView}
			{!mobileOrTablet && (
				<ToggleContainer justifyContent="flex-end" columnGap="30px">
					<HistoryToggle />
				</ToggleContainer>
			)}
		</MainContainer>
	)
}

const MarketPriceDetail: React.FC<MarketDetailsProps> = memo(({ mobile }) => {
	const markPrice = useAppSelector(selectCurrentMarketPrice)
	const pastPrice = useAppSelector(selectCurrentMarketPastPrice)
	const asset = useAppSelector(selectCurrentMarketAsset)

	const change = useMemo(() => {
		return markPrice > pastPrice ? 'up' : 'down'
	}, [markPrice, pastPrice])

	return (
		<MarketDetail
			mobile={mobile}
			color={getColorFromPriceChange(change)}
			value={
				markPrice ? formatDollars(markPrice, { suggestDecimalsForAsset: asset }) : NO_VALUE
			}
			dataKey={MarketDataKey.marketPrice}
		/>
	)
})

const DailyChangeDetail: React.FC<MarketDetailsProps> = memo(({ mobile }) => {
	const curPrice = useAppSelector(selectCurrentMarketPrice)
	const pastPrice = useAppSelector(selectCurrentMarketPastPrice)
	
	console.log("ww: debug: ", curPrice, pastPrice, (curPrice - pastPrice) / curPrice ?? 0)

	return (
		<MarketDetail
			mobile={mobile}
			dataKey={MarketDataKey.dailyChange}
			value={
				curPrice > 0
				? formatPercent((curPrice - pastPrice) / curPrice ?? 0)
				: '0'
			}
			color={
				pastPrice > 0
					? curPrice > pastPrice
						? 'green'
						: curPrice < pastPrice
						? 'red'
						: ''
					: undefined
			}
		/>
	)
})

const DailyVolume: React.FC<MarketDetailsProps> = memo(({ mobile }) => {
	const volumes = useAppSelector(selectMarketVolumes)
	const market = useAppSelector(selectCurrentMarketInfo)

	return (
		<MarketDetail
			mobile={mobile}
			dataKey={MarketDataKey.dailyVolume}
			value={
				formatCurrency(
					market?.displayName ?? '', 
					volumes[market?.marketAddress ?? '']
				)
			}
		/>
	)
})

const MainContainer = styled.div<{ mobile?: boolean }>`
	display: grid;
	align-items: center;
	height: ${MARKETS_DETAILS_HEIGHT_DESKTOP}px;
	overflow-y: visible;
	grid-template-columns: 1fr 280px;
	border-bottom: ${(props) => (props.mobile ? 0 : props.theme.colors.selectedTheme.border)};

	${(props) =>
		props.mobile &&
		css`
			display: flex;
			flex-direction: column;
			height: auto;
			height: ${MARKETS_DETAILS_HEIGHT_DESKTOP * 2}px;
		`}
`

export const MarketDetailsContainer = styled.div<{ mobile?: boolean }>`
	flex: 1;
	gap: 20px;
	padding: 10px 45px 10px 15px;
	overflow-x: scroll;
	scrollbar-width: none;
	display: flex;
	align-items: center;
	width: 100%;
	overflow-y: visible;

	& > div {
		margin-right: 30px;
	}

	${media.lessThan('xl')`
		gap: 10px;
		& > div {
			margin-right: 10px;
		}
	`}

	${media.lessThan('lg')`
		gap: 6px;
	`}

	.heading, .value {
		white-space: nowrap;
	}

	${(props) => css`
		.heading {
			color: ${props.theme.colors.selectedTheme.text.label};
		}

		.value {
			color: ${props.theme.colors.selectedTheme.text.value};
		}

		.green {
			color: ${props.theme.colors.selectedTheme.green};
		}

		.red {
			color: ${props.theme.colors.selectedTheme.red};
		}

		.paused {
			color: ${props.theme.colors.selectedTheme.gray};
		}

		${props.mobile &&
		css`
			height: auto;
			width: 100%;
			padding: 15px;
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			grid-template-rows: 1fr 1fr;
			grid-gap: 15px 25px;
			justify-items: start;
			align-items: start;
			justify-content: start;
			${media.lessThan('md')`
				margin: 0px;
				& > div {
					margin-right: 30px;
				}
			`}

			border-left: none;
			.heading {
				margin-bottom: 2px;
			}
		`}
	`}
`

const ToggleContainer = styled(FlexDivRowCentered)`
	padding-right: 17.5px;
`

export default MarketDetails
