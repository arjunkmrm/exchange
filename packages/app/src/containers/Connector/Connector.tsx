import { useCallback, useEffect, useMemo, useState } from 'react'
import { createContainer } from 'unstated-next'
import { useAccount, useNetwork, useSigner, useProvider, useSwitchNetwork } from 'wagmi'
import { useAppDispatch } from 'state/hooks'
import sdk from 'state/sdk'
import { setNetwork, setSigner } from 'state/wallet/actions'
import { generateExplorerFunctions } from './blockExplorer'
import { DEFAULT_NETWORK_ID } from 'constants/defaults'

export let blockExplorer = generateExplorerFunctions(DEFAULT_NETWORK_ID)

const useConnector = () => {
	const dispatch = useAppDispatch()
	const { chain: network } = useNetwork()
	const { address, isConnected: isWalletConnected } = useAccount({
		onDisconnect: () => dispatch(setSigner(null)),
	})
	const [providerReady, setProviderReady] = useState(false)
	const { switchNetwork: switchNetworkInternal } = useSwitchNetwork()
	const provider = useProvider()
	const { data: signer } = useSigner()

	const walletAddress = useMemo(() => address ?? null, [address])

	const handleNetworkChange = useCallback((networkId: number) => {
		dispatch(setNetwork(networkId))
		blockExplorer = generateExplorerFunctions(networkId)
	}, [dispatch])

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

	const switchNetwork = useCallback((networkId: number) => {
		try {
			if (isWalletConnected) {
				if (switchNetworkInternal === undefined) {
					return console.error("switchNetwork not ready!")
				}
				switchNetworkInternal(networkId)
			} else {
				handleNetworkChange(networkId)
			}
		} catch (e) {
			console.error("switch network error: ", e)
		}
	}, [switchNetworkInternal, handleNetworkChange])

	return {
		activeChain: network,
		isWalletConnected,
		walletAddress,
		provider,
		signer,
		network,
		providerReady,
		switchNetwork,
	}
}

const Connector = createContainer(useConnector)

export default Connector
