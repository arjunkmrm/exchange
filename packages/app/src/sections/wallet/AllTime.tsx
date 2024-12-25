import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import Spacer from 'components/Spacer'
import Currency from 'components/Currency'
import { FlexDivRowCentered } from 'components/layout/flex'
import Table, { TableHeader, TableNoResults } from 'components/Table'
import { TableCell } from 'components/Table/TableBodyRow'
import media from 'styles/media'

import { BalanceDataType } from 'types/common'
import { Row } from '@tanstack/react-table'

type AllTimeProps = {
	data: BalanceDataType[]
	isLoading: boolean
	onClickToken: (row: Row<BalanceDataType>) => void
	compact?: boolean
	activeTab?: string
}

const AllTime: FC<AllTimeProps> = ({
	data,
	isLoading,
	onClickToken: onClickToken,
	compact,
	activeTab,
}) => {
	const { t } = useTranslation()

	return (
		<>
				<StyledTable
					// @ts-ignore
					compact={compact}
					showPagination
					isLoading={isLoading}
					data={data}
					pageSize={10}
					hideHeaders={compact}
					columnVisibility={{
						rank: !compact,
						totalTrades: !compact,
						liquidations: !compact,
						totalVolume: !compact,
						pnl: !compact,
					}}
					paginationSize={'sm'}
					columnsDeps={[activeTab]}
					noResultsMessage={
						data?.length === 0 && (
							<TableNoResults>{t('wallet.wallet.table.no-result')}</TableNoResults>
						)
					}
					onTableRowClick={onClickToken}
					columns={[
						{
							header: () => (
								<TableTitle>
									<TitleText>
										{activeTab} {t('wallet.wallet.table.title')}
									</TitleText>
								</TableTitle>
							),
							accessorKey: 'title',
							enableSorting: false,
							columns: [
								{
									header: () => (
										<TableHeader>{t('wallet.wallet.table.token')}</TableHeader>
									),
									accessorKey: 'token',
									// cell: (cellProps) => (
									// 	<StyledOrderType>{cellProps.row.original.rankText}</StyledOrderType>
									// ),
									cell: (cellProps) => {
										return (
											<MarketContainer>
												<IconContainer>
													<StyledCurrencyIcon
														currencyKey={cellProps.row.original.address}
														url={cellProps.row.original.logo}
													/>
												</IconContainer>
												<StyledText>
													{cellProps.row.original.symbol}
													<Spacer width={8} />
												</StyledText>
												<StyledValue>{cellProps.row.original.name}</StyledValue>
											</MarketContainer>
										)
									},
									size: compact ? 40 : 60,
									enableSorting: true,
									sortingFn: (a, b) => a.original.symbol > b.original.symbol ? 1 : -1,
								},
								{
									header: () =>
										!compact ? (
											<TableHeader>{t('wallet.wallet.table.wallet-balance')}</TableHeader>
										) : (
											<></>
										),
									accessorKey: 'wallet-balance',
									cell: (cellProps) => {
										return (
											<Currency.Price price={cellProps.row.original.balanceInWallet} />
										)
									},
									size: compact ? 40 : 60,
									enableSorting: true,
									sortingFn: (a, b) => a.original.balanceInWallet - b.original.balanceInWallet,
								},
								{
									header: () => (
										<TableHeader>{t('wallet.wallet.table.bank-balance')}</TableHeader>
									),
									accessorKey: 'bank-balance',
									cell: (cellProps) => {
										return (
											<Currency.Price price={cellProps.row.original.balanceInBank} />
										)
									},
									size: compact ? 40 : 60,
									enableSorting: true,
									sortingFn: (a, b) => a.original.balanceInBank - b.original.balanceInBank,
								},
							],
						},
					]}
				/>
		</>
	)
}

const StyledTable = styled(Table)<{ compact: boolean | undefined; height?: number }>`
	margin-top: ${({ compact }) => (compact ? '0' : '15px')};
	height: ${({ height }) => (height ? height + 'px' : 'auto')};
	max-height: 665px;

	${TableCell} {
		padding-top: 8px;
		padding-bottom: 8px;
	}

	${media.lessThan('lg')`
		max-height: 600px;
	`}

	${media.lessThan('md')`
		margin-bottom: 150px;
	`}
` as typeof Table

const TableTitle = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
`

const TitleText = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	text-transform: capitalize;
`

const StyledOrderType = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	display: flex;
	align-items: center;
`

const StyledCurrencyIcon = styled(Currency.Icon)`
	width: 30px;
	height: 30px;
	margin-right: 8px;
`

const IconContainer = styled.div`
	grid-column: 1;
	grid-row: 1 / span 2;
`

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

const StyledValue = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 12px;
	grid-column: 2;
	grid-row: 2;
`

export default AllTime
