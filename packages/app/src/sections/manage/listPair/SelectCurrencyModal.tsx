import { FC, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import InfiniteScroll from 'react-infinite-scroll-component'
import styled from 'styled-components'

import Input from 'components/Input/Input'
import { FlexDivCentered } from 'components/layout/flex'
import { RowsHeader, CenteredModal } from 'components/layout/modals'
import Loader from 'components/Loader'
import { CATEGORY_MAP } from 'constants/currency'

import CurrencyRow from './CurrencyRow'
import { TokenInfoTypeWithAddress } from '@bitly/sdk/types'

const PAGE_LENGTH = 50

export const CATEGORY_FILTERS = [CATEGORY_MAP.crypto, CATEGORY_MAP.forex, CATEGORY_MAP.commodity]

type SelectCurrencyModalProps = {
	tokens: TokenInfoTypeWithAddress[]
	onDismiss: () => void
	onSelect: (currencyKey: string) => void
}

export const SelectCurrencyModal: FC<SelectCurrencyModalProps> = ({
	tokens,
	onDismiss,
	onSelect,
}) => {
	const { t } = useTranslation()

	const [assetSearch, setAssetSearch] = useState('')
	const [page, setPage] = useState(1)

	const filteredTokens = useMemo(() => {
		return tokens.filter(e=>
			e.symbol.toLowerCase().includes(assetSearch.toLowerCase()) ||
			e.name.toLowerCase().includes(assetSearch.toLowerCase()) ||
			e.address.toLowerCase().includes(assetSearch.toLowerCase())
		)
	}, [tokens, assetSearch])

	return (
		<StyledCenteredModal onDismiss={onDismiss} isOpen title={t('modals.select-currency.title')}>
			<Container id="scrollableDiv">
				<SearchContainer>
					<AssetSearchInput
						placeholder={t('modals.select-currency.search.placeholder')}
						onChange={(e) => {
							setAssetSearch(e.target.value)
						}}
						value={assetSearch}
						autoFocus
					/>
				</SearchContainer>
				<InfiniteScroll
					dataLength={filteredTokens.length}
					next={() => {
						setTimeout(() => {
							setPage(page + 1)
						}, 200)
					}}
					hasMore={false}
					loader={
						<LoadingMore>
							<Loader inline />
						</LoadingMore>
					}
					scrollableTarget="scrollableDiv"
				>
					{
						filteredTokens.map((token) => {
							const { symbol, address } = token
							return (
								<CurrencyRow
									key={symbol}
									onClick={() => {
										onSelect(address)
										onDismiss()
									}}
									token={{ ...token, logoURI: token.logo }}
								/>
							)
						})
					}
				</InfiniteScroll>
			</Container>
		</StyledCenteredModal>
	)
}

const Container = styled.div`
	height: 100%;
	overflow-y: scroll;
`

const StyledCenteredModal = styled(CenteredModal)`
	[data-reach-dialog-content] {
		width: 400px;
	}
	.card-body {
		height: 80vh;
		padding: 0px;
		overflow-y: scroll;
	}
`

const SearchContainer = styled.div`
	margin: 0 16px 12px 16px;
`

const AssetSearchInput = styled(Input).attrs({ type: 'search' })`
	font-size: 16px;
	height: 40px;
	::placeholder {
		text-transform: capitalize;
		color: ${(props) => props.theme.colors.selectedTheme.button.secondary};
	}
`

const EmptyDisplay = styled(FlexDivCentered)`
	justify-content: center;
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.bold};
	text-align: center;
	margin: 24px 0px;
	height: 50px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
`

const LoadingMore = styled.div`
	text-align: center;
`

const TokensHeader = styled(RowsHeader)`
	margin-top: 10px;
`

export default SelectCurrencyModal
