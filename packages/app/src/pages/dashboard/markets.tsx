import Head from 'next/head'
import { ReactNode, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Spacer from 'components/Spacer'
import Search from 'components/Table/Search'
import DashboardLayout from 'sections/dashboard/DashboardLayout'
import FuturesMarketsTable from 'sections/dashboard/FuturesMarketsTable'
import { usePollExchangeData } from 'state/exchange/hooks'

type MarketsProps = React.FC & { getLayout: (page: ReactNode) => JSX.Element }

const MarketsPage: MarketsProps = () => {
	const { t } = useTranslation()
	const [search, setSearch] = useState('')
	const onClearSearch = useCallback(() => setSearch(''), [setSearch])

	usePollExchangeData()

	return (
		<>
			<Head>
				<title>{t('dashboard-markets.page-title')}</title>
			</Head>
			<Spacer height={15} />
			<SearchBarContainer>
				<Search
					autoFocus
					value={search}
					onChange={setSearch}
					disabled={false}
					onClear={onClearSearch}
				/>
			</SearchBarContainer>
			<FuturesMarketsTable search={search} />
		</>
	)
}

const SearchBarContainer = styled.div`
	display: flex;
`

MarketsPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default MarketsPage
