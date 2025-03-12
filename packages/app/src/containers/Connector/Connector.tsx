import { useCallback, useEffect, useMemo, useState } from 'react'
import { createContainer } from 'unstated-next'
import { useAccount, useNetwork, useSigner, useProvider, useSwitchNetwork } from 'wagmi'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import sdk from 'state/sdk'
import { setNetwork, setSigner } from 'state/wallet/actions'
import { generateExplorerFunctions } from './blockExplorer'
import { DEFAULT_NETWORK_ID } from 'constants/defaults'
import { set } from 'lodash'
import useLocalStorage from 'hooks/useLocalStorage'
import { selectNetwork } from 'state/app/selectors'

export let blockExplorer = generateExplorerFunctions(DEFAULT_NETWORK_ID)

const useConnector = () => {
	const dispatch = useAppDispatch()
	const { chain: network } = useNetwork()
	const { address, isConnected: isWalletConnected } = useAccount({
		onDisconnect: () => dispatch(setSigner(null)),
	})
	const [userSetNetworkId, setUserSetNetworkId] = useState<number>()
	const decidedNetworkId = useMemo(() => {
		return isWalletConnected ? network?.id : userSetNetworkId
	}, [network?.id, userSetNetworkId, isWalletConnected])
	const [providerReady, setProviderReady] = useState(false)
	const { switchNetwork: switchNetworkInternal } = useSwitchNetwork()
	const provider = useProvider({chainId: decidedNetworkId})
	const { data: signer } = useSigner()

	const walletAddress = useMemo(() => address ?? null, [address])

	const storeNetworkId = useCallback((networkId: number) => {
		window?.localStorage?.setItem('networkId', networkId.toString())
	}, [])

	const handleNetworkChange = useCallback(async (networkId: number) => {
		storeNetworkId(networkId)
		blockExplorer = generateExplorerFunctions(networkId)
		await dispatch(setNetwork(networkId))
	}, [dispatch])

	// 定义一个队列来存储任务
	const taskQueue: (() => Promise<void>)[] = [];
	let isProcessingQueue = false;

	// 处理队列中的任务
	async function processQueue() {
		if (isProcessingQueue) return;
		isProcessingQueue = true;
		while (taskQueue.length > 0) {
			const task = taskQueue.shift();
			if (task) {
				try {
					await task();
				} catch (error) {
					console.error('Error processing task in queue:', error);
				}
			}
		}
		isProcessingQueue = false;
	}

	// Entry for munual network switching from rainbow wallet
	useEffect(() => {
		const task = async () => {
			if (!!provider) {
				setProviderReady(false);
				const networkId = await sdk.setProvider(provider)
				await handleNetworkChange(networkId);
				setProviderReady(true);
			}
		};

		// 将任务添加到队列中
		taskQueue.push(task);
		processQueue();
	}, [provider, handleNetworkChange]);

	useEffect(() => {
		dispatch(setSigner(signer))
	}, [signer, dispatch])

	// Entry for switching from url param
	const switchNetwork = useCallback((networkId: number) => {
		if (isWalletConnected && switchNetworkInternal) {
			switchNetworkInternal(networkId)
		} else {
			setUserSetNetworkId(networkId)
		}

		storeNetworkId(networkId)
	}, [isWalletConnected, switchNetworkInternal])

	const activeNetworkId = useAppSelector(selectNetwork)
	const activeNetworkInfo = useMemo(() => {
		return provider?.chains?.find(chain => chain.id === activeNetworkId)
	}, [activeNetworkId, provider.chains])

	return {
		activeChain: activeNetworkInfo,
		isWalletConnected,
		walletAddress,
		provider,
		signer,
		network: activeNetworkInfo,
		providerReady,
		switchNetwork,
	}
}

const Connector = createContainer(useConnector)

export default Connector
