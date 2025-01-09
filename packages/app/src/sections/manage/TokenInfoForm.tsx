import { FC, useState, ChangeEvent, useMemo, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'
import Input from 'components/Input/Input'
import media from 'styles/media'
import { Body } from 'components/Text'
import Button from 'components/Button'
import InfoIconPath from 'assets/svg/app/docs.svg'
import PreviewIconPath from 'assets/svg/app/account-info.svg'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { listToken } from 'state/exchange/actions'
import { selectListTokenStatus } from 'state/exchange/selectors'
import { FetchStatus } from 'state/types'
import { queryTokenInfo } from 'queries/tokens/tokenQueries'
import { isValidAddress } from 'utils/string'
import { TokenInfoType } from '@bitly/sdk/types'
import { TokenInfo } from 'sections/asset/TokenInfo'

const handleChangeHOC = (func: any) => {
	return (event: ChangeEvent<HTMLInputElement>) => {
		func(event.target.value)
	}
}

const TokenInfoForm: FC = () => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const [address, setAddress] = useState<string>()
	const [description, setDescription] = useState<string>()
	const [website, setWebsite] = useState<string>()
	const [icon, setIcon] = useState<string>()
	const [loading, setLoading] = useState<boolean>(false)
	const [basicInfo, setBasicInfo] = useState<Partial<TokenInfoType>>()
	const listTokenStatus = useAppSelector(selectListTokenStatus)

	const disabled = useMemo(() => {
		return !address || !description || !website || !icon
	}, [address, description, website, icon])

	useEffect(() => {
		try {
			if (address !== undefined && isValidAddress(address)) {
				queryTokenInfo(address).then(info=>setBasicInfo(info))
			}
		} catch (e) {}
	}, [address])

	const handleSubmit = useCallback(() => {
		dispatch(listToken({
			address: address ?? '', 
			description: description ?? '',
			url: website ?? '', 
			logo: icon ?? '',
		}))
	}, [address, description, website, icon])

	useEffect(() => {
		if (listTokenStatus === FetchStatus.Loading) {
			setLoading(true)
		} else {
			setLoading(false)
		}
	}, [listTokenStatus])

	return (<>
		<ChartGrid>
			<ChartContainer>
				<ChartOverlay>
					<SectionTitle>
						<InfoIconPath />
						{t('manage.list-token.titles.basic-info')}
					</SectionTitle>
					<InputContainer border={true}>
						<InputTitle> Address: </InputTitle>
						<StyledInput
							border={true}
							autoFocus={false}
							value={address}
							onChange={handleChangeHOC(setAddress)}
							placeholder="0x123456789..."
						/>
					</InputContainer>
					<InputContainer border={true}>
						<InputTitle> Description: </InputTitle>
						<StyledInput
							border={true}
							autoFocus={false}
							value={description}
							onChange={handleChangeHOC(setDescription)}
							placeholder="A short description of this asset"
						/>
					</InputContainer>
					<InputContainer border={true}>
						<InputTitle> Website: </InputTitle>
						<StyledInput
							border={true}
							autoFocus={false}
							value={website}
							onChange={handleChangeHOC(setWebsite)}
							placeholder="https://your/official/website/link"
						/>
					</InputContainer>
					<InputContainer border={true}>
						<InputTitle> Icon: </InputTitle>
						<StyledInput
							border={true}
							autoFocus={false}
							value={icon}
							onChange={handleChangeHOC(setIcon)}
							placeholder="https://path/to/pic.ico"
						/>
					</InputContainer>
					<Button
						fullWidth
						variant="flat"
						size="small"
						disabled={disabled}
						loading={loading}
						onClick={handleSubmit}
					>
						Submit
					</Button>
				</ChartOverlay>
			</ChartContainer>
		</ChartGrid>
		<ChartGrid>
			<ChartContainer>
				<ChartOverlay>
					<SectionTitle>
						<PreviewIconPath />
						{t('manage.list-token.titles.preview')}
					</SectionTitle>
					<TokenInfo
						name={basicInfo?.name ?? ''}
						symbol={basicInfo?.symbol ?? ''}
						logo={icon}
						website={website}
						address={address ?? ''}
						description={description}
					/>
				</ChartOverlay>
			</ChartContainer>
		</ChartGrid>
	</>)
}

export default TokenInfoForm

const ChartGrid = styled.div`
	display: grid;
	grid-template-rows: 1fr 5fr;
	width: 100%;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 8px;
	height: 360px;
`

const ChartContainer = styled.div<{ mobile?: boolean }>`
	position: relative;
	grid-row-end: span 3;
	border-left: ${(props) => (props.mobile ? null : props.theme.colors.selectedTheme.border)};
	border-top: ${(props) => (props.mobile ? props.theme.colors.selectedTheme.border : null)};
	border-bottom: ${(props) => (props.mobile ? props.theme.colors.selectedTheme.border : null)};
	padding: 0 8px 0 8px;
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

const ChartOverlay = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: start;
	gap: 8px;
	padding: 16px;
`

const SectionTitle = styled(Body)`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-size: 16px;
	margin-bottom: 4px;
`

const InputTitle = styled(Body)`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-size: 12px;
`