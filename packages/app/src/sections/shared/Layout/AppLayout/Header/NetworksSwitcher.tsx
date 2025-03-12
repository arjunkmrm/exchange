import { useChainModal } from '@rainbow-me/rainbowkit'
import { FC, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import EthereumIcon from 'assets/svg/providers/ethereum.svg'
import Button from 'components/Button'
import Connector from 'containers/Connector'
import { chains } from 'containers/Connector/config'
import SelectChainModal from './SelectChainModal'
import { selectShowModal } from 'state/app/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { setOpenModal } from 'state/app/reducer'

type ReactSelectOptionProps = {
	label: string
	prefixIcon?: string
	postfixIcon?: string
	link?: string
	onClick?: () => {}
}

type NetworksSwitcherProps = {
	mobile?: boolean
}

const NetworksSwitcher: FC<NetworksSwitcherProps> = ({ mobile }) => {
	const { activeChain, isWalletConnected, switchNetwork } = Connector.useContainer()
	const { t } = useTranslation()
	const { openChainModal } = useChainModal()
    const [ icon, setIcon ] = useState(<img src={EthereumIcon}></img>);
    const dispatch = useAppDispatch()
	const modal = useAppSelector(selectShowModal)
	const closeModal = useCallback(() => {
		dispatch(setOpenModal({type: null}))
	}, [dispatch])
	const openModal = useCallback(() => {
		dispatch(setOpenModal({type: 'select-blockchain'}))
	}, [dispatch])

    useEffect(()=>{
        const currentChain = chains.filter(chain=>chain.id==activeChain?.id)?.[0];
        if (currentChain) {
            const iconFunc = currentChain.iconUrl as ()=>Promise<string>;
            iconFunc().then(icon=>{
                setIcon(<img width={20} height={20} src={icon as string}></img>);
            });
        }
    }, [activeChain]);

	const decideModal = useCallback(() => {
		if (isWalletConnected) {
			return openChainModal
		}
		return openModal
	}, [openChainModal, isWalletConnected, openModal])

	return (
		<Container onClick={decideModal()} $mobile={mobile}>
			<StyledButton noOutline size="small" mono>
				{/* {activeChain && networkIcon(activeChain.name)} */}
                {activeChain && icon}
			</StyledButton>
			
			{modal?.type === 'select-blockchain' && (
				<SelectChainModal onDismiss={closeModal} onChangeNetwork={(id)=>{switchNetwork(id); closeModal();}} />
			)}
		</Container>
	);
}

export default NetworksSwitcher

const Container = styled.div<{ $mobile?: boolean }>`
	${(props) =>
		props.$mobile &&
		css`
			margin-right: 10px;
		`}
`

const StyledButton = styled(Button)`
	width: 41px;
	padding: 0;
`

