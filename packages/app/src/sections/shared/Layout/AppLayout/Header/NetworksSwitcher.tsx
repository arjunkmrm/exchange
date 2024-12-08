import { useChainModal } from '@rainbow-me/rainbowkit'
import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import LinkIcon from 'assets/svg/app/link-blue.svg'
import SwitchIcon from 'assets/svg/app/switch.svg'
import ArbitrumIcon from 'assets/svg/providers/arbitrum.svg'
import AvalancheIcon from 'assets/svg/providers/avalanche.svg'
import BinanceIcon from 'assets/svg/providers/binance.svg'
import EthereumIcon from 'assets/svg/providers/ethereum.svg'
import OptimismIcon from 'assets/svg/providers/optimism.svg'
import PolygonIcon from 'assets/svg/providers/polygon.svg'
import Button from 'components/Button'
import LabelContainer from 'components/Nav/DropDownLabel'
import Select from 'components/Select'
import { IndicatorSeparator, DropdownIndicator } from 'components/Select'
import { EXTERNAL_LINKS } from 'constants/links'
import Connector from 'containers/Connector'
import { blockExplorer } from 'containers/Connector/Connector'
import { ExternalLink } from 'styles/common'
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

	const networkIcon = (prefixIcon: string) => {
		switch (prefixIcon) {
			case 'Garnet':
				return <PolygonIcon width={24} height={16} />
			case 'Arbitrum One':
				return <ArbitrumIcon width={24} height={16} />
			case 'Ethereum':
				return <EthereumIcon width={24} height={16} />
			case 'Avalanche':
				return <AvalancheIcon width={24} height={16} />
			case 'BNB Smart Chain':
				return <BinanceIcon width={24} height={16} />
			default:
				return <OptimismIcon width={24} height={16} />
		}
	}

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

const L2Select = styled(Select)`
	width: 41px;

	.react-select__single-value * {
		font-family: ${(props) => props.theme.fonts.mono};
	}

	.react-select__control {
		border-radius: 8px;
	}

	.react-select__dropdown-indicator {
		display: none;
	}

	.react-select__value-container {
		padding-right: 0;
	}
`

const PrefixIcon = styled.span`
	display: flex;
`
