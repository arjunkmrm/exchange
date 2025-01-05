import { notNill } from '@bitly/sdk/utils'
import { FC, useMemo, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import Table, { TableHeader } from 'components/Table'
import { Body } from 'components/Text'
import { NO_VALUE } from 'constants/placeholder'
import { blockExplorer } from 'containers/Connector/Connector'
import useGetFuturesTrades from 'queries/futures/useGetFuturesTrades'
import { useAppSelector } from 'state/hooks'
import { selectCurrentMarketAsset } from 'state/exchange/selectors'
import { formatNumber } from 'utils/prices'
import { OrderDirection } from '@bitly/sdk/types'

type TradesHistoryTableProps = {
	mobile?: boolean
	display?: boolean
}

enum TableColumnAccessor {
	Amount = 'amount',
	Price = 'price',
	Time = 'time',
	Direction = 'direction',
	Funding = 'fundingAccrued',
}

const TradesHistoryTable: FC<TradesHistoryTableProps> = ({ mobile, display }) => {
	const { t } = useTranslation()
	const marketKey = useAppSelector(selectCurrentMarketAsset)
	const futuresTradesQuery = useGetFuturesTrades(marketKey)

	let data = useMemo(() => {
		const futuresTradesPages = futuresTradesQuery?.data?.pages ?? []
		// initially the currencyKey would as null
		// the fetch would return [null]
		if (futuresTradesPages[0] === null) return []

		const futuresTrades =
			futuresTradesPages.length > 0
				? futuresTradesPages
						.flat()
						.filter(notNill)
						.map((trade) => {
							return {
								value: trade.price,
								amount: trade.volume,
								time: Number(trade?.timestamp),
								id: trade?.txn,
								direction: trade.direction,
							}
						})
						.filter(e=>e.amount > 0)
				: []
		return [...new Set(futuresTrades)]
	}, [futuresTradesQuery.data])

	const observer = useRef<IntersectionObserver | null>(null)
	const lastElementRef = useCallback(
		(node: any) => {
			if (futuresTradesQuery.isLoading || data.length < 16) return
			if (observer) {
				if (observer.current) {
					observer.current.disconnect()
				}

				observer.current = new IntersectionObserver((entries) => {
					if (entries[0].isIntersecting) {
						futuresTradesQuery.fetchNextPage()
					}
				})
			}
			if (node) {
				observer.current?.observe(node)
			}
		},
		[futuresTradesQuery, data]
	)

	const calTimeDelta = useCallback(
		(time: number) => {
			const timeDelta = (Date.now() - time * 1000) / 1000

			if (timeDelta === 0) {
				return NO_VALUE
			} else if (timeDelta < 60) {
				// less than 1m
				return `${t('common.time.n-sec-ago', { timeDelta: Math.floor(timeDelta) })}`
			} else if (timeDelta < 3600) {
				// less than 1h
				return `${t('common.time.n-min-ago', { timeDelta: Math.floor(timeDelta / 60) })}`
			} else if (timeDelta < 86400) {
				// less than 1d
				return `${t('common.time.n-hr-ago', { timeDelta: Math.floor(timeDelta / 3600) })}`
			} else {
				// greater than 1d
				return `${t('common.time.n-day-ago', {
					timeDelta: Math.floor(timeDelta / 86400),
				})}`
			}
		},
		[t]
	)

	return (
		// <HistoryContainer $display={mobile || display} mobile={mobile}>
			<StyledTable
				data={data}
				isLoading={futuresTradesQuery.isLoading}
				lastRef={lastElementRef}
				onTableRowClick={(_row) => {
					return _row.original.id !== NO_VALUE
						? window.open(`${blockExplorer?.txLink?.(_row.original.id)}`)
						: undefined
				}}
				highlightRowsOnHover
				columns={[
					{
						header: () => <TableHeader>{t('futures.market.history.direction-label')}</TableHeader>,
						accessorKey: TableColumnAccessor.Direction,
						enableSorting: false,
						cell: (cellProps) => {
							const negative = cellProps.row.original.direction === OrderDirection.sell
	
							return (
								<DirectionalValue negative={negative}>
									{cellProps.getValue()}
								</DirectionalValue>
							)
						},
						size: 50,
					},
					{
						header: () => <TableHeader>{t('futures.market.history.time-label')}</TableHeader>,
						accessorKey: TableColumnAccessor.Time,
						cell: (cellProps) => {
							return <TimeValue>{calTimeDelta(cellProps.row.original.time)}</TimeValue>
						},
						size: 70,
					},
					{
						header: () => <TableHeader>{t('futures.market.history.amount-label')}</TableHeader>,
						accessorKey: TableColumnAccessor.Amount,
						cell: (cellProps) => {
							const negative = cellProps.getValue() > 0

							return (
								<DirectionalValue negative={negative} normal={true}>
									{formatNumber(Math.abs(cellProps.getValue()), {
										suggestDecimals: true,
										truncateOver: 1e6,
										maxDecimals: 6,
									})}
								</DirectionalValue>
							)
						},
						size: 100,
					},
					{
						header: () => <TableHeader>{t('futures.market.history.price-label')}</TableHeader>,
						accessorKey: TableColumnAccessor.Price,
						cell: (cellProps) => {
							return (
								<PriceValue>
									${formatNumber(cellProps.row.original.value, { suggestDecimals: true })}
								</PriceValue>
							)
						},
						size: 100,
					},
					
				]}
			/>
		// </HistoryContainer>
	)
}

export default TradesHistoryTable

const TableAlignment = css`
	justify-content: space-between;
	& > div:first-child {
		flex: 70 70 0 !important;
	}
	& > div:nth-child(2) {
		flex: 100 100 0 !important;
		justify-content: center;
	}
	& > div:last-child {
		flex: 60 60 0 !important;
		justify-content: flex-end;
		padding-right: 20px;
	}
`

const StyledTable = styled(Table)`
	border: none;
	overflow-y: auto;

	.table-row,
	.table-body-row {
		${TableAlignment}
		padding: 0;
	}
	.table-body-cell {
		height: 30px;
	}
` as typeof Table

const PriceValue = styled(Body).attrs({ mono: true })`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	padding-left: 5px;
`

const TimeValue = styled(Body)`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
`

const DirectionalValue = styled(PriceValue)<{ negative?: boolean; normal?: boolean }>`
	white-space: nowrap;
	color: ${(props) =>
		props.normal
			? props.theme.colors.selectedTheme.button.text.primary
			: props.theme.colors.selectedTheme[props.negative ? 'red' : 'green']};
`
