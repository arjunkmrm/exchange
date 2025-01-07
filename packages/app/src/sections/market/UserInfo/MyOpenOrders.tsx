import { FC, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import Table, { TableHeader } from 'components/Table'
import { Body } from 'components/Text'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { selectCancelOrderStatus, selectClaimEarningStatus, selectCurrentMarketInfo, selectOpenOrders, selectOpenOrdersQueryStatus, selectOrderbook, selectOrderbookQueryStatus, selectOrderbookWidth } from 'state/exchange/selectors'
import { formatNumber } from 'utils/prices'
import { FetchStatus } from 'state/types'
import { cancelOrder, claimEarning } from 'state/exchange/actions'
import { OrderDirection } from '@bitly/sdk/types'
import Pill from 'components/Pill'
import Tooltip from 'components/Tooltip/Tooltip'
import { formatOrderId } from 'utils/string'

type MyOpenOrdersProps = {
	mobile?: boolean
	display?: boolean
}

enum TableColumnAccessor {
	Amount = 'amount',
	Price = 'price',
	Time = 'time',
	Funding = 'fundingAccrued',
	Direction = 'direction',
	Claim = 'claim',
	Cancel = 'cancel',
	Selling = 'selling',
	Sold = 'sold',
	Earning = 'earning',
}

const MyOpenOrders: FC<MyOpenOrdersProps> = ({ mobile, display }) => {
	const { t } = useTranslation()
	const [loading, setLoading] = useState(true)
	const dispatch = useAppDispatch()
	const claimEarningStatus = useAppSelector(selectClaimEarningStatus)
	const cancelOrderStatus = useAppSelector(selectCancelOrderStatus)
	const openOrders = useAppSelector(selectOpenOrders)
	const marketInfo = useAppSelector(selectCurrentMarketInfo)
	const openOrdersQueryStatus = useAppSelector(selectOpenOrdersQueryStatus)

	useEffect(() => {
		if (loading && (
			openOrdersQueryStatus.status === FetchStatus.Error || 
			openOrdersQueryStatus.status === FetchStatus.Success
		)) {
			setLoading(false)
		}
	}, [openOrdersQueryStatus, loading])

	const data = useMemo(() => {
		return openOrders[marketInfo?.marketAddress ?? ''] ?? []
	}, [openOrders, marketInfo])

	return (
		<StyledTable
			data={data}
			isLoading={loading}
			highlightRowsOnHover
			columnsDeps = {[marketInfo, dispatch, cancelOrderStatus, t]}
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
					size: 100,
				},
				{
					header: () => <TableHeader>{t('futures.market.history.price-label')} {!mobile ?? `(${marketInfo?.tokenY.symbol})`}</TableHeader>,
					accessorKey: TableColumnAccessor.Price,
					enableSorting: true,
					cell: (cellProps) => {
						const negative = cellProps.row.original.direction === OrderDirection.sell

						return (
							<DirectionalValue negative={negative} >
								{formatNumber(cellProps.row.original.price, { suggestDecimals: true })} 
							</DirectionalValue>
						)
					},
					size: 100,
				},
				{
					header: () => <TableHeader>{t('futures.market.history.selling-label')}</TableHeader>,
					accessorKey: TableColumnAccessor.Selling,
					enableSorting: false,
					cell: (cellProps) => {
						const negative = cellProps.row.original.direction === OrderDirection.sell

						return (
							<DirectionalValue negative={negative} >
								{formatNumber(Math.abs(cellProps.row.original.selling), {
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
					header: () => <TableHeader>{t('futures.market.history.sold-label')}</TableHeader>,
					accessorKey: TableColumnAccessor.Sold,
					enableSorting: false,
					cell: (cellProps) => {
						const negative = cellProps.row.original.direction === OrderDirection.sell

						return (
							<DirectionalValue negative={negative} >
								{formatNumber(Math.abs(cellProps.row.original.sold), {
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
					header: () => <TableHeader>{t('futures.market.history.earning-label')}</TableHeader>,
					accessorKey: TableColumnAccessor.Earning,
					enableSorting: false,
					cell: (cellProps) => {
						const negative = cellProps.row.original.direction === OrderDirection.sell

						return (
							<DirectionalValue negative={negative} >
								{formatNumber(Math.abs(cellProps.row.original.earned), {
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
					header: () => 
						<StyledTooltip content={'Earnings of the limit order should be claimed manually'}>
							<TableHeader>{t('futures.market.history.claim-label')}</TableHeader>
						</StyledTooltip>,
					accessorKey: TableColumnAccessor.Claim,
					enableSorting: false,
					cell: (cellProps) => {
						const direction = cellProps.row.original.direction
						const point = cellProps.row.original.point
						const earning = cellProps.row.original.earned
						const status = claimEarningStatus[formatOrderId(marketInfo?.marketAddress ?? '', direction, point)]

						return (
							<Pill 
								disabled={earning === 0 || status === FetchStatus.Loading || status === FetchStatus.Success}
								onClick={()=>dispatch(claimEarning({market: marketInfo?.marketAddress ?? '', direction, point}))}
							>
								{t('futures.market.history.claim-label')}
							</Pill>
						)
					},
					size: 100,
				},
				{
					header: () => 
						<StyledTooltip content={'Cancel order will trigger claim op first'}>
							<TableHeader>{t('futures.market.history.cancel-label')}</TableHeader>
						</StyledTooltip>,
					accessorKey: TableColumnAccessor.Cancel,
					enableSorting: false,
					cell: (cellProps) => {
						const direction = cellProps.row.original.direction
						const point = cellProps.row.original.point
						const status = cancelOrderStatus[formatOrderId(marketInfo?.marketAddress ?? '', direction, point)]
						return (
							<Pill 
								disabled={status === FetchStatus.Loading || status === FetchStatus.Success}
								onClick={()=>dispatch(cancelOrder({market: marketInfo?.marketAddress ?? '', direction, point}))}
							>
								{t('futures.market.history.cancel-label')}
							</Pill>
						)
					},
					size: 100,
				},
			]}
		/>
	)
}

export default MyOpenOrders

const StyledTooltip = styled(Tooltip).attrs({ position: 'auto', height: 'auto' })<{
	mobile?: boolean
}>`
	z-index: 2;
	padding: 10px;
	max-width: 300px;
	right: ${(props) => props.mobile && '1px'};
`

const OrderbookContainer = styled.div<{ mobile?: boolean; $display?: boolean }>`
	box-sizing: border-box;
	border-left: ${(props) => props.theme.colors.selectedTheme.border};
	height: 100%;
	width: ${(props) => (props.mobile ? '100%' : '300px')};
	${(props) =>
		props.mobile &&
		css`
			height: 100%;
			margin-bottom: 0;
			border-radius: 0;
			border: none;
			border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
		`};

	${(props) =>
		!props.$display &&
		css`
			display: none;
		`}
`

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
	overflow-y: scroll;

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
