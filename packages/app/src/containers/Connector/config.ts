import { Chain, connectorsForWallets } from '@rainbow-me/rainbowkit'
import {
	braveWallet,
	coinbaseWallet,
	injectedWallet,
	metaMaskWallet,
	rainbowWallet,
	safeWallet,
	walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { configureChains, createClient } from 'wagmi'
import {
	arbitrum,
	avalanche,
	bsc,
	mainnet,
	polygon,
	optimism,
	goerli,
	optimismGoerli,
} from 'wagmi/chains'
import { infuraProvider } from 'wagmi/providers/infura'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { publicProvider } from 'wagmi/providers/public'

import BinanceIcon from 'assets/png/rainbowkit/binance.png'
import RedstoneIcon from 'assets/png/chains/redstone.png';
import GarnetIcon from 'assets/png/chains/garnet.png';
import Frame from 'components/Rainbowkit/Frame'
import Tally from 'components/Rainbowkit/Tally'
import { BLAST_NETWORK_LOOKUP, STALL_TIMEOUT } from 'constants/network'

export type BitlyChain = Chain & {
    bitlyAddress: string;
};

const bscWithIcon: Chain = {
	...bsc,
	iconUrl: async () => BinanceIcon,
}

const redstoneWithIcon: BitlyChain = {
    ...mainnet,
    id: 690,
    name: 'Redstone Chain',
    network: 'redstone',
    rpcUrls: {
        default: {
            http: ['https://rpc.redstonechain.com'],
            webSocket: ['wss://rpc.redstonechain.com']
        },
        public: {
            http: ['https://rpc.redstonechain.com'],
            webSocket: ['wss://rpc.redstonechain.com']
        }
    },
    blockExplorers: {
        default: {
            name: 'Redstone Explorer',
            url: 'https://explorer.redstone.xyz'
        },
        etherscan: {
            name: 'Redstone Explorer',
            url: 'https://explorer.redstone.xyz'
        }
    },
    iconUrl: async () => RedstoneIcon,
    bitlyAddress: ''
};

const garnetWithIcon: BitlyChain = {
    ...mainnet,
    id: 17069,
    name: 'Garnet Holesky',
    network: 'garnet',
    rpcUrls: {
        default: {
            http: ['https://rpc.garnetchain.com'],
            webSocket: ['wss://rpc.garnetchain.com']
        },
        public: {
            http: ['https://rpc.garnetchain.com'],
            webSocket: ['wss://rpc.garnetchain.com']
        }
    },
    blockExplorers: {
        default: {
            name: 'Redstone Explorer',
            url: 'https://explorer.garnetchain.com'
        },
        etherscan: {
            name: 'Redstone Explorer',
            url: 'https://explorer.garnetchain.com'
        }
    },
    iconUrl: async () => GarnetIcon,
    bitlyAddress: '0x786F2461A238c29352a66f67243eE52EdF42bC14'
};

export type ChainsType = {
    [chain: string]: Chain
};

export const chain: ChainsType = {
	// redstone: redstoneWithIcon,
    garnet: garnetWithIcon
}

const { chains, provider } = configureChains(Object.values(chain), [
	infuraProvider({
		apiKey: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID!,
		stallTimeout: STALL_TIMEOUT,
		priority: process.env.NEXT_PUBLIC_PROVIDER_ID === 'INFURA' ? 1 : 3,
	}),
	jsonRpcProvider({
		rpc: (networkChain) => ({
			http:
				process.env.NEXT_PUBLIC_DEVNET_ENABLED === 'true'
					? process.env.NEXT_PUBLIC_DEVNET_RPC_URL!
					: !BLAST_NETWORK_LOOKUP[networkChain.id]
					? networkChain.rpcUrls.default.http[0]
					: `https://${BLAST_NETWORK_LOOKUP[networkChain.id]}.blastapi.io/${
							process.env.NEXT_PUBLIC_BLASTAPI_PROJECT_ID
					  }`,
		}),
		stallTimeout: STALL_TIMEOUT,
		priority: process.env.NEXT_PUBLIC_DEVNET_ENABLED ? 0 : 2,
	}),
	publicProvider({ stallTimeout: STALL_TIMEOUT, priority: 5 }),
])

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_V2_ID!

const connectors = connectorsForWallets([
	{
		groupName: 'Popular',
		wallets: [
			safeWallet({ chains }),
			metaMaskWallet({ projectId, chains }),
			rainbowWallet({ projectId, chains }),
			coinbaseWallet({ appName: 'Bitly', chains }),
			walletConnectWallet({ projectId, chains }),
		],
	},
	{
		groupName: 'More',
		wallets: [
			braveWallet({ chains, shimDisconnect: true }),
			Tally({ chains, shimDisconnect: true }),
			Frame({ chains, shimDisconnect: true }),
			injectedWallet({ chains, shimDisconnect: true }),
		],
	},
])

export const wagmiClient = createClient({
	autoConnect: true,
	connectors,
	provider,
})

export { chains }
