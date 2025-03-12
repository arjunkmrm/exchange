import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import InfiniteScroll from 'react-infinite-scroll-component'
import styled from 'styled-components'
import Input from 'components/Input/Input'
import { FlexDivCentered } from 'components/layout/flex'
import { RowsHeader, CenteredModal } from 'components/layout/modals'
import Loader from 'components/Loader'
import { CATEGORY_MAP } from 'constants/currency'
import { chain } from 'containers/Connector/config'
import { SelectableCurrencyRow } from 'styles/common'

const PAGE_LENGTH = 50

export const CATEGORY_FILTERS = [CATEGORY_MAP.crypto, CATEGORY_MAP.forex, CATEGORY_MAP.commodity]

const AsyncImage: FC<{asyncUrl: ()=>Promise<string>}> = ({ asyncUrl }) => {
	const [ icon, setIcon ] = useState(<img></img>)
	useEffect(()=>{
		const iconFunc = asyncUrl
		iconFunc().then(icon=>{
			setIcon(<img width={30} height={30} src={icon as string}></img>);
		});
    }, [asyncUrl]);

	return icon
}

type SelectChainModalProps = {
	onDismiss: () => void
	onChangeNetwork: (chainId: number) => void
}

export const SelectChainModal: FC<SelectChainModalProps> = ({
	onDismiss,
	onChangeNetwork,
}) => {
	const { t } = useTranslation()
	const [page, setPage] = useState(1)

	
	const chains = useMemo(() => {
		return Object.values(chain)
	}, [])

	return (
		<StyledCenteredModal onDismiss={onDismiss} isOpen title={t('modals.select-blockchain.title')}>
			<Container id="scrollableDiv">
				<InfiniteScroll
					dataLength={chains.length}
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
						chains?.map((chain) => {
							const { name, iconUrl, id } = chain
							return (
								<StyledSelectableChainRow key={id} onClick={()=>onChangeNetwork(id)} isSelectable>
									<AsyncImage asyncUrl={iconUrl as ()=>Promise<string>} />
									<ChainNameStyle>
										{name}
									</ChainNameStyle>
								</StyledSelectableChainRow>
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

const StyledSelectableChainRow = styled(SelectableCurrencyRow)`
	padding: 10px 20px 10px 20px;
`

const ChainNameStyle = styled.span`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-size: 16px;
`

const StyledCenteredModal = styled(CenteredModal)`
	[data-reach-dialog-content] {
		width: 400px;
	}
	.card-body {
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

export default SelectChainModal
