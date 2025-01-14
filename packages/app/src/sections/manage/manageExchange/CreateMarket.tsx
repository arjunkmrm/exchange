import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import Input from 'components/Input/Input'
import media from 'styles/media'
import { Body } from 'components/Text'
import CreateMarketButton from './CreateMarketButton'

const CreateMarket: FC = () => {
	const { t } = useTranslation()
	const [marketName, setMarketName] = useState<string>()

	return (
		<>
			<InputContainer border={true}>
				<InputTitle> MarketName: </InputTitle>
				<StyledInput
					border={true}
					autoFocus={false}
					value={marketName}
					onChange={(event) => {
						setMarketName(event.target.value)
					}}
				/>
			</InputContainer>
			<CreateMarketButton marketName={marketName} />
		</>
	)
}

export default CreateMarket

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
