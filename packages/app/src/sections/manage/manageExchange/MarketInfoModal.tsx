import { FC, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import Input from 'components/Input/Input'
import { FlexDivCentered } from 'components/layout/flex'
import { RowsHeader, CenteredModal } from 'components/layout/modals'
import InfiniteScroll from 'react-infinite-scroll-component'
import Loader from 'components/Loader'
import { CATEGORY_MAP } from 'constants/currency'
import { useAppSelector } from 'state/hooks'
import { selectMarkets } from 'state/exchange/selectors'
import { StyledCaretDownIcon } from 'components/Select'
import PairRow from './PairRow'
import { MARKETS_DETAILS_HEIGHT_DESKTOP, TRADE_PANEL_WIDTH_LG, TRADE_PANEL_WIDTH_MD } from 'sections/market/styles'
import media from 'styles/media'
import { MARKET_SELECTOR_HEIGHT_MOBILE } from 'constants/defaults'
import { Body } from 'components/Text'
import AddPairButton from './AddPairButton'
import { selectCustomMarkets } from 'state/manage/selectors'

const PAGE_LENGTH = 50

export const CATEGORY_FILTERS = [CATEGORY_MAP.crypto, CATEGORY_MAP.forex, CATEGORY_MAP.commodity]

type MarketInfoModalProps = {
	onDismiss: () => void
	marketName: string
	mobile?: boolean
}

export const MarketInfoModal: FC<MarketInfoModalProps> = ({
	onDismiss,
	marketName,
	mobile = false,
}) => {
	const { t } = useTranslation()
	const [assetSearch, setAssetSearch] = useState('')
	const pairs = useAppSelector(selectMarkets)
	const [pair, setPair] = useState<string>()
	const [open, setOpen] = useState(false)
	const [page, setPage] = useState(1)
	const ownerMarkets = useAppSelector(selectCustomMarkets)

	const selectedPairInfo = useMemo(() => {
		return pairs.find(e=>e.marketAddress===pair)
	}, [pair, pairs])

	const curMarkets = useMemo(() => {
		return ownerMarkets[marketName]
	}, [ownerMarkets])

	const filteredPairs = useMemo(() => {
		if (assetSearch.length === 0) {
			return pairs
		}
		return pairs.filter(e=>e.displayName.toLowerCase().includes(assetSearch.toLowerCase()) || 
			e.marketAddress.toLowerCase().includes(assetSearch.toLowerCase())
		)
	}, [pairs, assetSearch])

	return (
		<StyledCenteredModal onDismiss={onDismiss} isOpen title={t('modals.manage-custom-market.title', {marketName})}>
			<Container id="scrollableDiv">
				{curMarkets.length === 0 && 
					<StyledContent>
						No Pairs in Your Market
					</StyledContent>
				}
				{curMarkets.map(e=>{
					return (
						<PairRow
							key={e.displayName}
							onClick={() => {}}
							pair={{
								logoURI: e.tokenX.logo,
								displayName: e.displayName,
								address: e.marketAddress
							}}
						/>
					)
				})}
				<HorizonBar />
				<ContentContainer mobile={mobile} onClick={()=>setOpen(!open)}>
					<LeftContainer $mobile={mobile}>
						{selectedPairInfo && <PairRow
							key={selectedPairInfo?.displayName}
							onClick={() => {}}
							pair={{
								logoURI: selectedPairInfo?.tokenX.logo,
								displayName: selectedPairInfo?.displayName,
								address: selectedPairInfo?.marketAddress
							}}
						/>}

						{!selectedPairInfo && 
							<StyledContent>
								Select Pair
							</StyledContent>
						}
						
						<MobileRightContainer>
							<StyledCaretDownIcon $flip={open} />
						</MobileRightContainer>
					</LeftContainer>
				</ContentContainer>
				{!open && 
					<ContentContainer>
						<AddPairButton
							marketName={marketName}
							address={pair}
						/>
					</ContentContainer>
				}
				{open && <>
					<ContentContainer>
						<AssetSearchInput
							placeholder={t('modals.manage-custom-market.search')}
							onChange={(e) => {
								setAssetSearch(e.target.value)
							}}
							value={assetSearch}
							autoFocus
						/>
					</ContentContainer>
					<InfiniteScroll
						dataLength={filteredPairs.length}
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
							filteredPairs.map((pair) => {
								const { displayName, marketAddress, tokenX } = pair
								return (
									<PairRow
										key={displayName}
										onClick={() => {
											setPair(marketAddress)
											setOpen(false)
										}}
										pair={{
											logoURI: tokenX.logo,
											displayName: displayName,
											address: marketAddress
										}}
									/>
								)
							})
						}
					</InfiniteScroll>
				</>}
			</Container>
		</StyledCenteredModal>
	)
}

const Container = styled.div`
	height: 100%;
	overflow-y: scroll;
	margin: 15px;
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

// const ContentContainer = styled.div`
// 	margin: 0 16px 12px 16px;
// `

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

const MobileRightContainer = styled.div`
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	padding-left: 15px;
	text-align: right;
`

const LeftContainer = styled.div<{ $mobile?: boolean }>`
	flex: 1;
	display: flex;
	align-items: center;

	${(props) =>
		props.$mobile &&
		css`
			padding-right: 15px;
			border-right: ${props.theme.colors.selectedTheme.border};
		`}
`

export const ContentContainer = styled(FlexDivCentered)<{ mobile?: boolean }>`
	.currency-meta {
		flex: 1;
		margin-left: 12px;
	}
	width: 100%;

	${(props) =>
		props.mobile &&
		css`
			width: 100%;
		`}

	background: ${(props) => props.theme.colors.selectedTheme.newTheme.containers.primary.background};

	color: ${(props) => props.theme.colors.selectedTheme.text.value};
	padding: 15px;
	cursor: pointer;
	transition: all 0.2s ease-in-out;
	&:hover {
		background: ${(props) =>
			props.theme.colors.selectedTheme.newTheme.button.cell.hover.background};
	}

	p {
		margin: 0;
	}

	&:not(:last-of-type) {
		margin-bottom: 4px;
	}

	height: ${(props) =>
		props.mobile ? MARKET_SELECTOR_HEIGHT_MOBILE : MARKETS_DETAILS_HEIGHT_DESKTOP - 1}px;
`

const StyledContent = styled(Body)`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-size: 16px;
	margin-bottom: 4px;
`
const HorizonBar = styled.hr`
	margin: 15px;
	border-width: 1px;
	border-color: gray;
`

export default MarketInfoModal
