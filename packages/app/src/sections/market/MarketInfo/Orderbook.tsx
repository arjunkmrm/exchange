import { FC, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import Table, { TableHeader } from 'components/Table'
import { Body } from 'components/Text'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import Button from 'components/Button'
import { selectCurrentMarketInfo, selectOrderbook, selectOrderbookQueryStatus, selectOrderbookWidth } from 'state/exchange/selectors'
import { formatNumber } from 'utils/prices'
import { increaseOrderbookWidth } from 'state/exchange/reducer'
import { ORDERBOOK_WIDTH_INCREASEMENT } from 'constants/defaults'
import { FetchStatus } from 'state/types'
import { fetchOrderbook } from 'state/exchange/actions'

type OrderbookTableProps = {
	mobile?: boolean
	display?: boolean
}

enum TableColumnAccessor {
	Amount = 'amount',
	Price = 'price',
	Time = 'time',
	Funding = 'fundingAccrued',
}

const Orderbook: FC<OrderbookTableProps> = ({ mobile, display }) => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const [loading, setLoading] = useState(true)
	const orderbook = useAppSelector(selectOrderbook)
	const width = useAppSelector(selectOrderbookWidth)
	const orderbookQueryStatus = useAppSelector(selectOrderbookQueryStatus)
	const marketInfo = useAppSelector(selectCurrentMarketInfo)

	useEffect(() => {
		if (loading && (
			orderbookQueryStatus.status === FetchStatus.Error || 
			orderbookQueryStatus.status === FetchStatus.Success
		)) {
			setLoading(false)
		}
	}, [orderbookQueryStatus, loading, width])

	const data = useMemo(() => {
		return orderbook.asks.map(e=>({amount: e.amount, price: e.price, buy: false}))
			.concat(orderbook.bids.map(e=>({amount: e.amount, price: e.price, buy: true})))
	}, [orderbook])

	return (
		<OrderbookContainer $display={mobile || display} mobile={mobile}>
			<StyledButton 
				variant="flat" 
				size="small" 
				disabled={loading}
				onClick={async ()=>{
					setLoading(true)
					await dispatch(increaseOrderbookWidth(ORDERBOOK_WIDTH_INCREASEMENT))
					dispatch(fetchOrderbook())
				}} 
			>
				{t('futures.market.trade.orders.load-more', {width: (width*100).toFixed()})}
			</StyledButton>
			<StyledTable
				data={data}
				isLoading={loading}
				highlightRowsOnHover
				columnsDeps={[marketInfo]}
				columns={[
					{
						header: () => 
							<TableHeader>
								{t('futures.market.history.price-label')}
								(${marketInfo?.tokenY.symbol})
							</TableHeader>,
						accessorKey: TableColumnAccessor.Price,
						enableSorting: false,
						cell: (cellProps) => {
							const negative = !cellProps.row.original.buy

							return (
								<DirectionalValue negative={negative} >
									{formatNumber(cellProps.row.original.price, { suggestDecimals: true })} 
								</DirectionalValue>
							)
						},
						size: 100,
					},
					{
						header: () => 
							<TableHeader>
								{t('futures.market.history.amount-label')}
								(${marketInfo?.tokenX.symbol})
							</TableHeader>,
						accessorKey: TableColumnAccessor.Amount,
						enableSorting: false,
						cell: (cellProps) => {
							const isBuy = cellProps.row.original.buy
							const negative = !isBuy
							const amount = cellProps.getValue()
							const price = cellProps.row.original.price
							const amountShow = isBuy ? amount / price : amount

							return (
								<DirectionalValue negative={negative} >
									{formatNumber(Math.abs(amountShow), {
										suggestDecimals: true,
										truncateOver: 1e6,
										maxDecimals: 6,
									})}
								</DirectionalValue>
							)
						},
						size: 100,
					},
				]}
			/>
		</OrderbookContainer>
	)
}

export default Orderbook

const StyledButton = styled(Button)`
	text-align: center;
	width: 100%
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
