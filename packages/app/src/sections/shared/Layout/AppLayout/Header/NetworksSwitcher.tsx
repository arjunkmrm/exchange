import { useChainModal } from '@rainbow-me/rainbowkit'
import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import EthereumIcon from 'assets/svg/providers/ethereum.svg'
import Button from 'components/Button'
import Connector from 'containers/Connector'
import { chains } from 'containers/Connector/config'

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
	const { activeChain } = Connector.useContainer()
	const { t } = useTranslation()
	const { openChainModal } = useChainModal()
    const [ icon, setIcon ] = useState(<img src={EthereumIcon}></img>);

    useEffect(()=>{
        const currentChain = chains.filter(chain=>chain.id==activeChain?.id)?.[0];
        if (currentChain) {
            const iconFunc = currentChain.iconUrl as ()=>Promise<string>;
            iconFunc().then(icon=>{
                setIcon(<img width={20} height={20} src={icon as string}></img>);
            });
        }
    }, [activeChain]);

	return (
		<Container onClick={openChainModal} $mobile={mobile}>
			<StyledButton noOutline size="small" mono>
				{/* {activeChain && networkIcon(activeChain.name)} */}
                {activeChain && icon}
			</StyledButton>
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

