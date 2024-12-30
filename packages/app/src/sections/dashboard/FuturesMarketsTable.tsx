import { ExchangeMarketType } from '@bitly/sdk/types'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import ChangePercent from 'components/ChangePercent'
import ColoredPrice from 'components/ColoredPrice'
import Currency from 'components/Currency'
import { FlexDivRowCentered } from 'components/layout/flex'
import MarketBadge from 'components/MarketBadge'
import Spacer from 'components/Spacer'
import Table, { TableHeader } from 'components/Table'
import ROUTES from 'constants/routes'
import { selectMarketVolumes } from 'state/exchange/selectors'
import { useAppSelector } from 'state/hooks'
import { selectPreviousDayPrices, selectPrices } from 'state/prices/selectors'
import { selectMarkets } from 'state/exchange/selectors'
import { formatDollars } from 'utils/prices'
import { PriceChange } from 'state/prices/types'

type FuturesMarketsTableProps = {
	search?: string
}

const sortBy = [{ id: 'dailyVolume', desc: true }]

const FuturesMarketsTable: React.FC<FuturesMarketsTableProps> = ({ search }) => {
	const { t } = useTranslation()
	const router = useRouter()

	const futuresMarkets = useAppSelector(selectMarkets)
	const laggedPrices = useAppSelector(selectPreviousDayPrices)
	const marketsVolumes = useAppSelector(selectMarketVolumes)
	const marketPrices = useAppSelector(selectPrices)

	let data = useMemo(() => {
		const lowerSearch = search?.toLowerCase()
		const markets: ExchangeMarketType[] = lowerSearch
			? (futuresMarkets as ExchangeMarketType[]).filter(
					(m) =>
						m.marketAddress.toLowerCase().includes(lowerSearch) ||
						m.displayName?.toLowerCase().includes(lowerSearch)
			  )
			: futuresMarkets
		return markets.map((market) => {
			const tokenName = market.tokenX.name
			const icon = market.tokenX.logo
			const marketAddress = market.marketAddress
			const description = market.displayName
			const volume = marketsVolumes[marketAddress]
			const pastPrice = laggedPrices[marketAddress] ?? 0
			const marketPrice = marketPrices[marketAddress] ?? 0
			const change: PriceChange = (()=>{
				if (marketPrice - pastPrice > 0) {
					return 'up'
				} else if (marketPrice - pastPrice < 0) {
					return 'down'
				} else {
					return null
				}
			})()

			

			return {
				asset: market.marketAddress,
				tokenName,
				icon,
				description,
				price: marketPrice,
				change,
				volume,
				pastPrice: pastPrice,
				priceChange:
					pastPrice && marketPrice > 0
						? (marketPrice - pastPrice) / marketPrice 
						: 0,
			}
		})
	}, [search, futuresMarkets, t, marketsVolumes, laggedPrices, marketPrices])

	return (
        <TableContainer>
            <StyledTable
                data={data}
                onTableRowClick={(row) => {
                    router.push(ROUTES.Markets.Home(row.original.asset))
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
                                            currencyKey={cellProps.row.original.asset}
											url={cellProps.row.original.icon}
                                        />
                                    </IconContainer>
                                    <StyledText>
                                        {cellProps.row.original.description}
                                        <Spacer width={8} />
                                        <MarketBadge
                                            currencyKey={cellProps.row.original.asset}
                                            isFuturesMarketClosed={false}
                                            futuresClosureReason={undefined}
                                        />
                                    </StyledText>
                                    <StyledValue>{cellProps.row.original.tokenName}</StyledValue>
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
                        sortingFn: (a, b) => a.original.volume > b.original.volume ? 1 : -1,
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
                                <ColoredPrice priceChange={cellProps.row.original.change}>
                                    {formatDollars(cellProps.row.original.price, {
                                        suggestDecimalsForAsset: cellProps.row.original.asset,
                                    })}
                                </ColoredPrice>
                            )
                        },
                        size: 130,
                        enableSorting: true,
                        sortingFn: (a, b) => a.original.price > b.original.price ? 1 : -1,
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
                        sortingFn: (a, b) => a.original.priceChange > b.original.priceChange ? 1 : -1,
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
