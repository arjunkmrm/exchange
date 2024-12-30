import { useRouter } from 'next/router'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import FavoriteIcon from 'assets/svg/futures/favorite-star.svg'
import SelectedIcon from 'assets/svg/futures/selected-fav.svg'
import ColoredPrice from 'components/ColoredPrice'
import CurrencyIcon from 'components/Currency/CurrencyIcon'
import { FlexDivRowCentered } from 'components/layout/flex'
import MarketBadge from 'components/MarketBadge'
import Spacer from 'components/Spacer'
import Table, { TableHeader, TableNoResults } from 'components/Table'
import Search from 'components/Table/Search'
import { Body } from 'components/Text'
import NumericValue from 'components/Text/NumericValue'
import { BANNER_HEIGHT_DESKTOP, BANNER_HEIGHT_MOBILE } from 'constants/announcement'
import ROUTES from 'constants/routes'
import { zIndex } from 'constants/ui'
import useClickOutside from 'hooks/useClickOutside'
import useLocalStorage from 'hooks/useLocalStorage'
import { selectShowBanner } from 'state/app/selectors'
import { useAppSelector } from 'state/hooks'
import { selectPreviousDayPrices, selectPrices } from 'state/prices/selectors'
import { FetchStatus } from 'state/types'
import media from 'styles/media'

import MarketsDropdownSelector, { MARKET_SELECTOR_HEIGHT_MOBILE } from './MarketsDropdownSelector'
import { selectCurrentMarketAsset, selectCurrentMarketInfo, selectMarkets, selectMarketsQueryStatus } from 'state/exchange/selectors'
import { formatDollars } from 'utils/prices'
import { MARKETS_DETAILS_HEIGHT_DESKTOP, TRADE_PANEL_WIDTH_LG, TRADE_PANEL_WIDTH_MD } from './styles'
import { PriceChange } from 'state/prices/types'
import { floorNumber } from 'utils/number'

type MarketsDropdownProps = {
	mobile?: boolean
}

const MarketsDropdown: React.FC<MarketsDropdownProps> = ({ mobile }) => {
	const curPrices = useAppSelector(selectPrices)
	const pastPrices = useAppSelector(selectPreviousDayPrices)
	const marketAsset = useAppSelector(selectCurrentMarketAsset)
	const allMarkets = useAppSelector(selectMarkets)
	const marketsQueryStatus = useAppSelector(selectMarketsQueryStatus)
	const marketInfo = useAppSelector(selectCurrentMarketInfo)

	const [open, setOpen] = useState(false)
	const [search, setSearch] = useState('')
	const [favMarkets, setFavMarkets] = useLocalStorage<string[]>('favorite-markets', [])
	const showBanner = useAppSelector(selectShowBanner)

	const { ref } = useClickOutside(() => setOpen(false))

	const router = useRouter()
	const { t } = useTranslation()

	const onClearSearch = useCallback(() => setSearch(''), [setSearch])

	const onSelectFav = useCallback(
		(asset: string) => {
			const index = favMarkets.indexOf(asset)

			if (index !== -1) {
				favMarkets.splice(index, 1)
			} else {
				favMarkets.push(asset)
			}
			setFavMarkets([...favMarkets])
		},
		[favMarkets, setFavMarkets]
	)

	const getBasePriceRateInfo = useCallback(
		(asset: string) => {
			return curPrices[asset]
		},
		[curPrices]
	)

	const getPastPrice = useCallback(
		(asset: string) =>
			pastPrices[asset],
		[pastPrices]
	)

	const onSelectMarket = useCallback(
		(asset: string) => {
			router.push(ROUTES.Markets.Home(asset))
			setOpen(false)
		},
		[router]
	)

	const selectedBasePriceRate = getBasePriceRateInfo(marketAsset)
	const selectedPastPrice = getPastPrice(marketAsset)

	const options = useMemo(() => {
		const lowerSearch = search?.toLowerCase()
		const markets = lowerSearch
			? allMarkets.filter(
					(m) =>
						m.marketAddress.toLowerCase().includes(lowerSearch) ||
						m.displayName.toLocaleLowerCase().includes(lowerSearch)
			  )
			: allMarkets

		const sortedMarkets = markets
			.filter((m) => favMarkets.includes(m.marketAddress))
			.sort((a, b) =>
				(getBasePriceRateInfo(b.marketAddress) - getBasePriceRateInfo(a.marketAddress) ?? 0) > 0 ? 1 : -1
			)
			.concat(
				markets
					.filter((m) => !favMarkets.includes(m.marketAddress))
					.sort((a, b) =>
					(getBasePriceRateInfo(b.marketAddress) - getBasePriceRateInfo(a.marketAddress) ?? 0) > 0 ? 1 : -1
					)
			)

		return sortedMarkets.map((market) => {
			const pastPrice = getPastPrice(market.marketAddress)
			const basePriceRate = getBasePriceRateInfo(market.marketAddress)

			const change =
				basePriceRate && pastPrice && basePriceRate > 0
					? (basePriceRate - pastPrice) / basePriceRate
					: 0

			return {
				value: market.marketAddress,
				label: market.displayName,
				asset: market.marketAddress,
				key: market.marketAddress,
				logo: market.tokenX.logo,
				description: market.displayName,
				priceNum: basePriceRate ?? 0,
				price: formatDollars(basePriceRate ?? 0, {
					suggestDecimalsForAsset: market.marketAddress,
				}),
				change,
				priceDirection: (basePriceRate >= pastPrice ? 'up' : 'down') as PriceChange,
				isMarketClosed: false,
				closureReason: '',
			}
		})
	}, [search, allMarkets, favMarkets, getPastPrice, getBasePriceRateInfo])

	const isFetching = !allMarkets.length && marketsQueryStatus.status === FetchStatus.Loading

	const tableHeight: number = useMemo(() => {
		const BANNER_HEIGHT = mobile ? BANNER_HEIGHT_MOBILE : BANNER_HEIGHT_DESKTOP
		const OFFSET = mobile ? 159 : 205
		return Math.max(window.innerHeight - OFFSET - Number(showBanner) * BANNER_HEIGHT, 300)
	}, [mobile, showBanner])

	return (
		<SelectContainer mobile={mobile} ref={ref}>
			<MarketsDropdownSelector
				onClick={() => setOpen(!open)}
				expanded={open}
				mobile={mobile}
				asset={marketAsset}
				logo={marketInfo?.tokenX.logo}
				label={marketInfo?.displayName ?? ''}
				description={marketInfo?.displayName ?? ''}
				priceDetails={{
					oneDayChange:
						selectedBasePriceRate &&
						selectedPastPrice &&
						selectedBasePriceRate > 0
							? (selectedBasePriceRate - selectedPastPrice) / selectedBasePriceRate
							: 0,
					price: selectedBasePriceRate,
				}}
			/>
			{open && (
				<MarketsList mobile={mobile} height={tableHeight}>
					<SearchBarContainer>
						<Search
							autoFocus
							onChange={setSearch}
							value={search}
							border={false}
							onClear={onClearSearch}
						/>
					</SearchBarContainer>
					<TableContainer>
						<StyledTable
							highlightRowsOnHover
							// rowStyle={{ padding: '0' }}
							onTableRowClick={(row) => onSelectMarket(row.original.asset)}
							columns={[
								{
									header: () => (
										<TableHeader>
											<FavoriteIcon height={14} width={14} />
										</TableHeader>
									),
									accessorKey: 'favorite',
									sortingFn: 'basic',
									enableSorting: true,
									cell: ({ row }) => (
										<div
											onClick={(e) => {
												onSelectFav(row.original.asset)
												e.stopPropagation()
											}}
											style={{ cursor: 'pointer', zIndex: 200 }}
										>
											{favMarkets.includes(row.original.asset) ? (
												<SelectedIcon height={14} width={14} />
											) : (
												<FavoriteIcon height={14} width={14} />
											)}
										</div>
									),
									size: 21,
								},
								{
									header: () => <TableHeader>{t('futures.markets-drop-down.market')}</TableHeader>,
									accessorKey: 'label',
									sortingFn: 'basic',
									enableSorting: true,
									cell: ({ row }) => (
										<FlexDivRowCentered>
											<CurrencyIcon 
												url={row.original.logo} 
												currencyKey={row.original.key} 
												width={18} 
												height={18} 
											/>
											<Spacer width={10} />
											<Body size="small">{row.original.description}</Body>
										</FlexDivRowCentered>
									),
									size: 105,
								},
								{
									header: () => <TableHeader>{t('futures.markets-drop-down.price')}</TableHeader>,
									accessorKey: 'priceNum',
									sortingFn: 'basic',
									enableSorting: true,
									cell: (cellProps) => {
										return (
											<div>
												<ColoredPrice
													size="small"
													priceChange={cellProps.row.original.priceDirection}
												>
													{cellProps.row.original.price}
												</ColoredPrice>
											</div>
										)
									},
									size: 60,
								},
								{
									header: () => (
										<TableHeader style={{ width: '70px', textAlign: 'right' }}>
											{t('futures.markets-drop-down.change')}
										</TableHeader>
									),
									cell: ({ row }) => {
										return (
											<BadgeContainer>
												<MarketBadge
													currencyKey={row.original.asset}
													isFuturesMarketClosed={row.original.isMarketClosed}
													futuresClosureReason={row.original.closureReason}
													fallbackComponent={
														<NumericValue
															size="small"
															suffix="%"
															colored
															value={floorNumber(
																row.original.change ? row.original.change * 100 : 0,
																2
															)}
														/>
													}
												/>
											</BadgeContainer>
										)
									},
									accessorKey: 'change',
									sortingFn: 'basic',
									enableSorting: true,
									size: 25,
								},
							]}
							data={options}
							isLoading={isFetching}
							noBottom={true}
							noResultsMessage={
								options?.length === 0 ? (
									<TableNoResults>
										<Body color="secondary" size="large">
											{t('futures.markets-drop-down.no-results')}
										</Body>
									</TableNoResults>
								) : undefined
							}
						/>
					</TableContainer>
				</MarketsList>
			)}
		</SelectContainer>
	)
}

const BadgeContainer = styled(FlexDivRowCentered)`
	text-align: right;
	width: 60px;
	justify-content: flex-end;
`

const MarketsList = styled.div<{ mobile?: boolean; height: number }>`
	top: 66px;
	z-index: 1000;
	height: ${(props) => props.height}px;
	width: ${TRADE_PANEL_WIDTH_LG}px;
	${media.lessThan('xxl')`
		width: ${TRADE_PANEL_WIDTH_MD}px;
	`}

	${media.lessThan('md')`
		width: 100%;
	`}

	border-top: ${(props) => props.theme.colors.selectedTheme.border};
	background-color: ${(props) =>
		props.theme.colors.selectedTheme.newTheme.containers.primary.background};
	${(props) =>
		props.mobile &&
		css`
			width: 100%;
		`}
`

const TableContainer = styled.div`
	height: 100%;
	overflow: scroll;
	border-top: ${(props) => props.theme.colors.selectedTheme.border};
`

const StyledTable = styled(Table)<{ mobile?: boolean }>`
	border: none;
	cursor: pointer;
	background-color: ${(props) =>
		props.theme.colors.selectedTheme.newTheme.containers.primary.background};
	.table-body-row {
		padding: 0;
	}

	.table-body-row:last-child {
		border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
	}

	.table-body-cell {
		height: 32px;
	}
` as typeof Table

const SearchBarContainer = styled.div`
	font-size: 13px;
	width: 100%;
	height: 38px;
	top: 0;
`

const SelectContainer = styled.div<{ mobile?: boolean }>`
	z-index: ${zIndex.MARKET_DROPDOWN};
	height: ${MARKETS_DETAILS_HEIGHT_DESKTOP}px;
	position: relative;
	border-bottom: ${(props) => props.theme.colors.selectedTheme.border};

	${(props) =>
		props.mobile &&
		css`
			width: 100%;
			border-bottom: ${props.theme.colors.selectedTheme.border};
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			height: ${MARKET_SELECTOR_HEIGHT_MOBILE + 1}px;
		`}
`

export default MarketsDropdown
