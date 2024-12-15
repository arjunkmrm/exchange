import { FuturesMarket, FuturesMarketAsset } from '@kwenta/sdk/types'
import {
	AssetDisplayByAsset,
	MarketKeyByAsset,
	getDisplayAsset,
	formatDollars,
} from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import ChangePercent from 'components/ChangePercent'
import ColoredPrice from 'components/ColoredPrice'
import Currency from 'components/Currency'
import { FlexDivRowCentered } from 'components/layout/flex'
import MarketBadge from 'components/MarketBadge'
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media'
import Spacer from 'components/Spacer'
import Table, { TableHeader } from 'components/Table'
import ROUTES from 'constants/routes'
import { selectFuturesType } from 'state/futures/common/selectors'
import { selectMarketVolumes, selectMarkPrices } from 'state/futures/selectors'
import { useAppSelector } from 'state/hooks'
import { selectPreviousDayPrices, selectOnChainPricesInfo } from 'state/prices/selectors'
import { getSynthDescription } from 'utils/futures'
import { weiSortingFn } from 'utils/table'
import { selectMarkPricesV2, selectV2Markets } from 'state/futures/smartMargin/selectors'

type FuturesMarketsTableProps = {
	search?: string
}

const sortBy = [{ id: 'dailyVolume', desc: true }]

const FuturesMarketsTable: React.FC<FuturesMarketsTableProps> = ({ search }) => {
	const { t } = useTranslation()
	const router = useRouter()

	const futuresMarkets = useAppSelector(selectV2Markets)
	const pastRates = useAppSelector(selectPreviousDayPrices)
	const futuresVolumes = useAppSelector(selectMarketVolumes)
	const pricesInfo = useAppSelector(selectOnChainPricesInfo)
	const markPrices = useAppSelector(selectMarkPricesV2)

	let data = useMemo(() => {
		const lowerSearch = search?.toLowerCase()
		const markets: FuturesMarket[] = lowerSearch
			? (futuresMarkets as FuturesMarket[]).filter(
					(m) =>
						m.asset.toLowerCase().includes(lowerSearch) ||
						AssetDisplayByAsset[m.asset]?.toLocaleLowerCase().includes(lowerSearch)
			  )
			: futuresMarkets
		return markets.map((market) => {
			const description = getSynthDescription(market.asset, t)
			const volume = futuresVolumes[market.marketKey]?.volume
			const assetPriceInfo = pricesInfo[market.asset]
			const pastPrice = pastRates.find(
				(price) => price.synth === getDisplayAsset(market.asset)?.toUpperCase()
			)
			const marketPrice = markPrices[market.marketKey] ?? wei(0)

			return {
				asset: market.asset,
				market: market.marketName,
				description,
				price: marketPrice,
				priceInfo: assetPriceInfo,
				volume: volume?.toNumber() ?? 0,
				pastPrice: pastPrice?.rate,
				priceChange:
					pastPrice?.rate && marketPrice.gt(0)
						? marketPrice.sub(pastPrice?.rate).div(marketPrice)
						: wei(0),
			}
		})
	}, [search, futuresMarkets, t, futuresVolumes, pricesInfo, pastRates, markPrices])

	return (
        <TableContainer>
            <StyledTable
                data={data}
                onTableRowClick={(row) => {
                    router.push(ROUTES.Markets.MarketPair(row.original.asset))
                }}
                highlightRowsOnHover
                sortBy={sortBy}
                columns={[
                    {
                        header: () => (
                            <TableHeader>{t('dashboard.overview.futures-markets-table.market')}</TableHeader>
                        ),
                        accessorKey: 'market',
                        cell: (cellProps) => {
                            return (
                                <MarketContainer>
                                    <IconContainer>
                                        <StyledCurrencyIcon
                                            currencyKey={MarketKeyByAsset[cellProps.row.original.asset]}
                                        />
                                    </IconContainer>
                                    <StyledText>
                                        {"www"}
                                        <Spacer width={8} />
                                        <MarketBadge
                                            currencyKey={cellProps.row.original.asset}
                                            isFuturesMarketClosed={false}
                                            futuresClosureReason={undefined}
                                        />
                                    </StyledText>
                                    <StyledValue>{cellProps.row.original.description}</StyledValue>
                                </MarketContainer>
                            )
                        },
                        size: 190,
                        enableSorting: true,
                    },
                    {
                        id: 'dailyVolume',
                        header: () => (
                            <TableHeader>
                                {t('dashboard.overview.futures-markets-table.daily-volume')}
                            </TableHeader>
                        ),
                        accessorKey: 'dailyVolume',
                        cell: (cellProps) => {
                            return (
                                <Currency.Price
                                    price={cellProps.row.original.volume}
                                    formatOptions={{ truncateOver: 1e3 }}
                                />
                            )
                        },
                        size: 125,
                        enableSorting: true,
                        sortingFn: weiSortingFn('volume'),
                    },
                    {
                        header: () => (
                            <TableHeader>
                                {t('dashboard.overview.futures-markets-table.mark-price')}
                            </TableHeader>
                        ),
                        accessorKey: 'price',
                        cell: (cellProps) => {
                            return (
                                <ColoredPrice priceChange={cellProps.row.original.priceInfo?.change}>
                                    {formatDollars(cellProps.row.original.price, {
                                        suggestDecimalsForAsset: cellProps.row.original.asset,
                                    })}
                                </ColoredPrice>
                            )
                        },
                        size: 130,
                        enableSorting: true,
                        sortingFn: weiSortingFn('price'),
                    },
                    {
                        header: () => (
                            <TableHeader>
                                {t('dashboard.overview.futures-markets-table.daily-change')}
                            </TableHeader>
                        ),
                        accessorKey: 'priceChange',
                        cell: (cellProps) => {
                            return (
                                <ChangePercent
                                    value={cellProps.row.original.priceChange}
                                    decimals={2}
                                    className="change-pct"
                                />
                            )
                        },
                        size: 105,
                        enableSorting: true,
                        sortingFn: weiSortingFn('priceChange'),
                    },
                ]}
            />
        </TableContainer>
	)
}

const StyledCurrencyIcon = styled(Currency.Icon)`
	width: 30px;
	height: 30px;
	margin-right: 8px;
`

const OpenInterestContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
`

const IconContainer = styled.div`
	grid-column: 1;
	grid-row: 1 / span 2;
`

const StyledValue = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 12px;
	grid-column: 2;
	grid-row: 2;
`

const TableContainer = styled.div`
	margin: 16px 0 40px;

	.paused {
		color: ${(props) => props.theme.colors.selectedTheme.gray};
	}
`

const StyledTable = styled(Table)`
	margin-bottom: 20px;
` as typeof Table

const StyledText = styled(FlexDivRowCentered)`
	justify-content: space-between;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	font-family: ${(props) => props.theme.fonts.bold};
`

const MarketContainer = styled.div`
	display: grid;
	grid-template-rows: auto auto;
	grid-template-columns: 40px auto;
	align-items: center;
	width: 200px;
`

const StyledMobileTable = styled(StyledTable)`
	margin-top: 4px;
	border-radius: initial;
	border-top: none;
	border-left: none;
	border-right: none;
` as typeof Table

export default FuturesMarketsTable
