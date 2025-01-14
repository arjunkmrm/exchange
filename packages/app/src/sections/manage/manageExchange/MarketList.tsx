import { FC, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'
import Input from 'components/Input/Input'
import media from 'styles/media'
import Table, { TableHeader } from 'components/Table'
import { Body } from 'components/Text'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { FetchStatus } from 'state/types'
import Pill from 'components/Pill'
import Tooltip from 'components/Tooltip/Tooltip'
import { selectCustomMarkets, selectCustomMarketsStatus } from 'state/manage/selectors'
import { setOpenModal } from 'state/app/reducer'
import CreateMarket from './CreateMarket'

type MarketListProps = {
	mobile?: boolean
}

enum TableColumnAccessor {
	MarketName = 'name',
	Pairs = 'pairs',
	Manage = 'manage'
}

const MarketList: FC<MarketListProps> = ({ mobile }) => {
	const { t } = useTranslation()
	const [loading, setLoading] = useState(true)
	const dispatch = useAppDispatch()
	const customMarketStatus = useAppSelector(selectCustomMarketsStatus)
	const customMarkets = useAppSelector(selectCustomMarkets)

	useEffect(() => {
		if (loading && (
			customMarketStatus.status === FetchStatus.Error || 
			customMarketStatus.status === FetchStatus.Success
		)) {
			setLoading(false)
		}
	}, [customMarketStatus, loading])

	const data = useMemo(() => {
		return Object.entries(customMarkets).map(([name, pair])=>({name, pairs: pair.length}))
	}, [customMarkets])

	return (
		<>
			<StyledTable
				data={data}
				isLoading={loading}
				highlightRowsOnHover
				columnsDeps = {[dispatch, t]}
				columns={[
					{
						header: () => <TableHeader>{t('manage.custom-markets.market-list.name')}</TableHeader>,
						accessorKey: TableColumnAccessor.MarketName,
						enableSorting: true,
						cell: (cellProps) => {
							return (
								<ContentValue>
									{cellProps.getValue()}
								</ContentValue>
							)
						},
						size: 100,
					},
					{
						header: () => <TableHeader>{t('manage.custom-markets.market-list.pairs')}</TableHeader>,
						accessorKey: TableColumnAccessor.Pairs,
						enableSorting: true,
						cell: (cellProps) => {
							return (
								<ContentValue>
									{cellProps.getValue()}
								</ContentValue>
							)
						},
						size: 100,
					},
					{
						header: () => <TableHeader>{t('manage.custom-markets.market-list.manage')}</TableHeader>,
						accessorKey: TableColumnAccessor.Manage,
						enableSorting: false,
						cell: (cellProps) => {
							return (
								<Pill
									// onClick={()=>dispatch(setOpenModal())}
								>
									{t('manage.custom-markets.market-list.manage')}
								</Pill>
							)
						},
						size: 100,
					},
				]}
			/>
			<CreateMarket />
		</>
	)
}

export default MarketList

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

const StyledInput = styled(Input)<{ border: boolean }>`
	position: relative;
	height: 38px;
	border-radius: 8px;
	padding: 10px 15px;
	font-size: 14px;
	background: ${(props) =>
		props.border
			? props.theme.colors.selectedTheme.input.background
			: props.theme.colors.selectedTheme.newTheme.containers.primary.background};
	border: none;

	${media.lessThan('sm')`
		font-size: 13px;
	`}
`

const InputContainer = styled.div<{ border: boolean }>`
	width: 100%;
	overflow-x: auto;
	position: relative;
	display: flex;
	align-items: center;
	padding-left: 18px;
	margin-bottom: 15px;
	background: ${(props) =>
		props.border
			? props.theme.colors.selectedTheme.input.background
			: props.theme.colors.selectedTheme.newTheme.containers.primary.background};
	border-radius: 8px;
	border: ${(props) => (props.border ? props.theme.colors.selectedTheme.input.border : 'none')};
`

const InputTitle = styled(Body)`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-size: 12px;
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

const ContentValue = styled(Body)`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
`

const DirectionalValue = styled(PriceValue)<{ negative?: boolean; normal?: boolean }>`
	white-space: nowrap;
	color: ${(props) =>
		props.normal
			? props.theme.colors.selectedTheme.button.text.primary
			: props.theme.colors.selectedTheme[props.negative ? 'red' : 'green']};
`
