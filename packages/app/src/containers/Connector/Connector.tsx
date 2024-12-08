import { NetworkId } from '@kwenta/sdk/types'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createContainer } from 'unstated-next'
import { useAccount, useNetwork, useSigner, useProvider } from 'wagmi'

// import { SUPPORTED_NETWORKS } from 'constants/network'
import { useAppDispatch } from 'state/hooks'
import sdk from 'state/sdk'
import { setSigner } from 'state/wallet/actions'
import { setNetwork } from 'state/wallet/reducer'

import { generateExplorerFunctions } from './blockExplorer';
import { DEFAULT_NETWORK_ID } from 'constants/defaults'

export let blockExplorer = generateExplorerFunctions(DEFAULT_NETWORK_ID);

const useConnector = () => {
	const dispatch = useAppDispatch()
	const { chain: network } = useNetwork()
	const { address, isConnected: isWalletConnected } = useAccount({
		onDisconnect: () => dispatch(setSigner(null)),
	})
	const [providerReady, setProviderReady] = useState(false)

	// const network = useMemo(() => {
	// 	return SUPPORTED_NETWORKS.includes(activeChain?.id ?? chain.optimism.id)
	// 		? activeChain ?? chain.optimism
	// 		: chain.optimism
	// }, [activeChain])

	const walletAddress = useMemo(() => address ?? null, [address])

	const provider = useProvider({ chainId: network?.id })
	const { data: signer } = useSigner()

	const handleNetworkChange = useCallback(
		(networkId: NetworkId) => {
			dispatch(setNetwork(networkId))
			blockExplorer = generateExplorerFunctions(networkId);
		},
		[dispatch]
	)

	useEffect(() => {
		if (!!provider) {
			sdk.setProvider(provider).then((networkId) => {
				handleNetworkChange(networkId)
				setProviderReady(true)
			})
		}
	}, [provider, handleNetworkChange])

	useEffect(() => {
		dispatch(setSigner(signer))
	}, [signer, dispatch])

	return {
		activeChain: network,
		isWalletConnected,
		walletAddress,
		provider,
		signer,
		network,
		providerReady,
	}
}

const Connector = createContainer(useConnector)

export default Connector
