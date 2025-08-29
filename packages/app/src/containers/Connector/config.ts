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
	bsc,
	mainnet,
} from 'wagmi/chains'
import { infuraProvider } from 'wagmi/providers/infura'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { publicProvider } from 'wagmi/providers/public'

import BinanceIcon from 'assets/png/rainbowkit/binance.png'
import RedstoneIcon from 'assets/png/chains/redstone.png'
import SepoliaIcon from 'assets/png/chains/sepolia.png'
import BaseIcon from 'assets/png/chains/base.png'
import PolygonIcon from 'assets/png/chains/polygon.png'
import Frame from 'components/Rainbowkit/Frame'
import Tally from 'components/Rainbowkit/Tally'
import { BLAST_NETWORK_LOOKUP, STALL_TIMEOUT } from 'constants/network'

const baseWithIcon: Chain = {
	...mainnet,
	id: 8453,
	name: 'Base Chain',
	network: 'base',
	rpcUrls: {
		default: {
			http: [`https://base-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`],
			webSocket: [`wss://base-mainnet.infura.io/ws/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`],
		},
		public: {
			http: ['https://base.blockpi.network/v1/rpc/public'],
			webSocket: ['wss://base-rpc.publicnode.com'],
		}
	},
	blockExplorers: {
		default: {
			name: 'Base Explorer',
			url: 'https://basescan.org/',
		},
		etherscan: {
			name: 'Base Explorer',
			url: 'https://basescan.org/',
		}
	},
	iconUrl: async () => BaseIcon,
}

const polygonWithIcon: Chain = {
	...mainnet,
	id: 137,
	name: 'Polygon PoS Chain',
	network: 'polygon',
	nativeCurrency: {
		decimals: 18,
		name: 'POL',
		symbol: 'POL',
	},
	rpcUrls: {
		default: {
			http: [`https://polygon-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`],
			webSocket: [`wss://polygon-mainnet.infura.io/ws/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`],
		},
		public: {
			http: ['https://polygon.llamarpc.com'],
			webSocket: ['wss://polygon-bor-rpc.publicnode.com'],
		}
	},
	blockExplorers: {
		default: {
			name: 'PolygonScan',
			url: 'https://polygonscan.com/',
		},
		etherscan: {
			name: 'PolygonScan',
			url: 'https://polygonscan.com/',
		}
	},
	iconUrl: async () => PolygonIcon,
}

const bscWithIcon: Chain = {
	...bsc,
	iconUrl: async () => BinanceIcon,
}

const redstoneWithIcon: Chain = {
	...mainnet,
	id: 690,
	name: 'Redstone Chain',
	network: 'redstone',
	rpcUrls: {
		default: {
			http: ['https://rpc.redstonechain.com'],
			webSocket: ['wss://rpc.redstonechain.com'],
		},
		public: {
			http: ['https://rpc.redstonechain.com'],
			webSocket: ['wss://rpc.redstonechain.com'],
		}
	},
	blockExplorers: {
		default: {
			name: 'Redstone Explorer',
			url: 'https://explorer.redstone.xyz',
		},
		etherscan: {
			name: 'Redstone Explorer',
			url: 'https://explorer.redstone.xyz',
		}
	},
	iconUrl: async () => RedstoneIcon,
}

const sepoliaWithIcon: Chain = {
	...mainnet,
	id: 84532,
	name: 'Base Sepolia',
	network: 'base-sepolia',
	rpcUrls: {
		default: {
			http: ['https://base-sepolia.drpc.org'],
			webSocket: ['wss://base-sepolia.drpc.org'],
		},
		public: {
			http: ['https://base-sepolia.drpc.org'],
			webSocket: ['wss://base-sepolia.drpc.org'],
		}
	},
	blockExplorers: {
		default: {
			name: 'Base-Sepolia Explorer',
			url: 'https://sepolia.basescan.org/',
		},
		etherscan: {
			name: 'Base-Sepolia Explorer',
			url: 'https://sepolia.basescan.org/',
		}
	},
	testnet: true,
	iconUrl: async () => SepoliaIcon,
};

export type ChainsType = {
	[chain: string]: Chain,
}

export const chain: ChainsType = {
	sepolia: sepoliaWithIcon,
	redstone: redstoneWithIcon,
	// base: baseWithIcon,
	// polygon: polygonWithIcon,
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
						: `https://${BLAST_NETWORK_LOOKUP[networkChain.id]}.blastapi.io/${process.env.NEXT_PUBLIC_BLASTAPI_PROJECT_ID
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
