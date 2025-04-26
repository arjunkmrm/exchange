# Bitly Exchange SDK v2.0

The Bitly Exchange SDK provides a modern TypeScript/JavaScript interface for interacting with the Bitly Exchange protocol.

## Key Features
- TypeScript support
- Multi-chain support
- Real-time event subscriptions
- Built-in error handling
- Optimized for performance

# Architecture

The SDK is built around these core components:

## Context

The `Context` class provides:
- Network configuration (chainId, provider)
- Wallet management (signer, address)
- Contract management (main contracts and multicall)
- Event system for state changes
- Error handling

## Initialization
```typescript
import BitlySDK from '@bitly/sdk'
import { providers, Wallet } from 'ethers'

// Initialize with default provider
const sdk = new BitlySDK({
  networkId: 84532, // Base Sepolia
  provider: new providers.JsonRpcProvider('https://base-sepolia.infura.io/v3/YOUR_API_KEY')
})

// Add wallet/signer
await sdk.setSigner(new Wallet('YOUR_PRIVATE_KEY'))
```

## Services

Services provide high-level functionality for interacting with the exchange:

- Market data fetching (`getMarketsInfo`, `getTokensInfo`)
- Order management (`placeLimitOrder`, `placeMarketOrder`)
- Order cancellation (`cancelLimitOrder`, `cancelAllLimitOrder`)
- Earnings claiming (`claimEarning`, `claimAllEarnings`)
- Order history (`getFinishedOrders`, `getMarketOrderHistory`)

Example usage:
```typescript
const services = sdk.services;
await services.placeLimitOrder(marketAddress, direction, price, amount)
```

## Contracts

The SDK provides typed interfaces for all core contracts:
- Exchange contracts (BitlyExchange, TokenExchange)
- Token contracts (ERC20, BTLY)
- Bank contract

Contracts are automatically resolved by network ID and support:
- Type-safe method calls
- Multicall batching
- Network-specific deployments

## Events

The SDK emits events for important state changes:
- `network_changed` - When the network ID changes
- Contract events via ethers.js

