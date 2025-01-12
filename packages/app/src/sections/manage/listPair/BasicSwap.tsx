import { FC, memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import * as Text from 'components/Text'
import { FullHeightContainer, MainContent } from 'styles/common'
import BaseCurrencyCard from './BaseCurrencyCard'
import QuoteCurrencyCard from './QuoteCurrencyCard'
import ListPairButton from './SwapButton'

const BasicSwap: FC = memo(() => {
	const { t } = useTranslation()

	return (
		<StyledFullHeightContainer>
			<MainContent>
				<ExchangeTitle>{t('manage.list-pair.title')}</ExchangeTitle>
				<PageWidthContainer>
					<DesktopCardsContainer>
						<BaseCurrencyCard />
						<QuoteCurrencyCard />
					</DesktopCardsContainer>
					<ListPairButton />
				</PageWidthContainer>
			</MainContent>
		</StyledFullHeightContainer>
	)
})

export default BasicSwap

const StyledFullHeightContainer = styled(FullHeightContainer)`
	padding-top: 14px;
`

const ExchangeTitle = styled(Text.Body).attrs({ weight: 'bold' })`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	font-size: 30px;
	margin-bottom: 1.5em;
	text-align: center;
`

const DesktopCardsContainer = styled.div`
	display: flex;
	flex-direction: column;
	background: ${(props) => props.theme.colors.selectedTheme.newTheme.exchange.card};
	border-radius: 10px;
	border: ${(props) => props.theme.colors.selectedTheme.newTheme.border.style};
	box-sizing: border-box;
	position: relative;
	margin-bottom: 25px;
`

const PageWidthContainer = styled.div`
	width: 565px;
	margin: 0 auto;
`
