import { getAddress, isAddress } from 'ethers/lib/utils'
import DOMPurify from 'isomorphic-dompurify'
import { useRouter } from 'next/router'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import TabButton from 'components/Button/TabButton'
import { FlexDivCol } from 'components/layout/flex'
import Search from 'components/Table/Search'
import { useAppDispatch, useAppSelector, useFetchAction } from 'state/hooks'
import { selectBalanceInBank, selectBalanceInWallet, selectBalancesLoading } from 'state/wallet/selectors'
import media from 'styles/media'

import AllTime from './AllTime'
import { selectTokens } from 'state/exchange/selectors'
import { BalanceDataType } from 'types/common'
import { Row } from '@tanstack/react-table'
import ROUTES from 'constants/routes'

type LeaderboardProps = {
	compact?: boolean
	mobile?: boolean
}

const Wallet: FC<LeaderboardProps> = ({ compact, mobile }) => {
	const router = useRouter()
	const dispatch = useAppDispatch()

	const [searchInput, setSearchInput] = useState('')

	const balancesLoading = useAppSelector(selectBalancesLoading)
	const balancesInWallet = useAppSelector(selectBalanceInWallet)
	const balancesInBank = useAppSelector(selectBalanceInBank)
	const tokensInfo = useAppSelector(selectTokens)

	const urlPath = DOMPurify.sanitize(router.asPath)
	const trader = DOMPurify.sanitize(router.query.trader as string)

	useEffect(() => {
		setSearchInput('')
	}, [trader, urlPath, dispatch])

	const balances = useMemo(()=>{
		const balancesList: BalanceDataType[] = []
		for (const info of tokensInfo) {
			balancesList.push({
				address: info.address,
				logo: info.logo,
				name: info.name,
				symbol: info.symbol,
				balanceInBank: balancesInBank[info.address],
				balanceInWallet: balancesInWallet[info.address],
			})
		}
		return balancesList.filter(e=>
			e.address.toLowerCase().includes(searchInput.toLowerCase()) || 
			e.name.toLowerCase().includes(searchInput.toLowerCase()) || 
			e.symbol.toLowerCase().includes(searchInput.toLowerCase())
		)
	}, [balancesInBank, balancesInWallet, tokensInfo, searchInput])

	const onClickToken = useCallback((row: Row<BalanceDataType>) => {
		router.push(ROUTES.Wallet.Asset(row.original.address))
	}, [router, dispatch])

	return (
		<>
			<LeaderboardContainer>
				<SearchContainer compact={compact} mobile={mobile}>
					<SearchBarContainer>
						<Search value={searchInput} onChange={setSearchInput} disabled={false} onClear={()=>setSearchInput('')} />
					</SearchBarContainer>
				</SearchContainer>
				<TableContainer compact={compact}>
					{!compact && (
						<AllTime
							data={balances}
							isLoading={balancesLoading}
							compact={compact}
							onClickToken={onClickToken}
						/>
					)}
				</TableContainer>
			</LeaderboardContainer>
		</>
	)
}

const LeaderboardContainer = styled(FlexDivCol)`
	min-width: 400px;
	${media.lessThan('sm')`
		min-width: unset;
	`}
`

const StyledTabButton = styled(TabButton)`
	min-width: 65px;
	height: 35px;
	margin-right: 5px;
`

const TabButtonContainer = styled.div<{ numItems: number; mobile?: boolean }>`
	display: grid;
	grid-template-columns: ${({ numItems }) => `repeat(${numItems}, 1fr)`};
	margin-bottom: ${({ mobile }) => (mobile ? '16px' : '0px')};
	column-gap: 15px;
`

const SearchContainer = styled.div<{ compact?: boolean; mobile?: boolean }>`
	display: ${({ compact }) => (compact ? 'none' : 'flex')};
	flex-direction: ${({ mobile }) => (mobile ? 'column' : 'row')};
	margin-top: ${({ compact }) => (compact ? '0px' : '16px')};
	column-gap: 15px;
`

const SearchBarContainer = styled.div`
	display: flex;
	height: 100%;
	width: 100%;
`

const TableContainer = styled.div<{ compact?: boolean }>`
	margin-bottom: ${({ compact }) => (compact ? '0' : '40px')};
`

export default Wallet
