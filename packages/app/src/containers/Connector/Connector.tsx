import { useCallback, useEffect, useMemo, useState } from 'react'
import { createContainer } from 'unstated-next'
import { useAccount, useNetwork, useSigner, useProvider, useSwitchNetwork } from 'wagmi'
import { useAppDispatch } from 'state/hooks'
import sdk from 'state/sdk'
import { setNetwork, setSigner } from 'state/wallet/actions'
import { generateExplorerFunctions } from './blockExplorer'
import { DEFAULT_NETWORK_ID } from 'constants/defaults'
import { set } from 'lodash'
import useLocalStorage from 'hooks/useLocalStorage'

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

	const [userSetNetworkId, setUserSetNetworkId] = useState<number>()

	const walletAddress = useMemo(() => address ?? null, [address])

	const storeNetworkId = useCallback((networkId: number) => {
		window?.localStorage?.setItem('networkId', networkId.toString())
	}, [])

	const handleNetworkChange = useCallback(async (networkId: number) => {
		console.log("ww: handleNetworkChange: ", networkId)
		storeNetworkId(networkId)
		blockExplorer = generateExplorerFunctions(networkId)
		await dispatch(setNetwork(networkId))
	}, [dispatch])

	// Entry for munual network switching from rainbow wallet
	useEffect(() => {
		console.log("ww: useConnector: useEffect: provider: ", provider)
		setProviderReady(false)
		if (!!provider) {
			sdk.setProvider(
				provider
			).then((networkId) => {
				return handleNetworkChange(networkId)
			}).then(() => {
				setProviderReady(true)	
			})
		}
	}, [provider, handleNetworkChange])

	useEffect(() => {
		console.log("ww: useConnector: useEffect: signer: ", signer)
		dispatch(setSigner(signer))
	}, [signer, dispatch])

	useEffect(() => {
		try {
			console.log("ww: userSetNetworkId: ", userSetNetworkId, isWalletConnected, switchNetworkInternal === undefined)
			if (userSetNetworkId === undefined) {
				return
			}
			if (isWalletConnected) {
				if (switchNetworkInternal === undefined) {
					return console.error("switchNetwork not ready!")
				}
				switchNetworkInternal(userSetNetworkId)
			} else {
				handleNetworkChange(userSetNetworkId)
			}
		} catch (e) {
			console.error("switch network error: ", e)
		}
	}, [switchNetworkInternal, handleNetworkChange, userSetNetworkId])

	// Entry for switching from url param
	const switchNetwork = useCallback((networkId: number) => {
		setUserSetNetworkId(networkId)
		storeNetworkId(networkId)
	}, [])

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
