#!/usr/bin/env node
import express from 'express';
import cors from 'cors';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { Wallet } from "ethers";
import BitlySDK from '@bitly/sdk';
import { providers } from 'ethers';
import { OrderDirection } from "../../sdk/dist/types/exchange";

const PORT = process.env.PORT || 8081;

export const configSchema = z.object({
	walletPrivateKey: z.string(),
});

function createMcpServer(config: z.infer<typeof configSchema>) {
	try {
		const DEFAULT_NETWORK_ID = 84532; // Base Sepolia
		const INFURA_API_KEY = 'e8fbfba2d6e6419f9ed7dfd636a11e72';
		const DEFAULT_PROVIDER = new providers.JsonRpcProvider(
			`https://base-sepolia.infura.io/v3/${INFURA_API_KEY}`,
			DEFAULT_NETWORK_ID
		);
		const DEFAULT_BLOCK_TIME = 2000;

		const PROVIDERS: Record<number, providers.JsonRpcProvider> = {
			[DEFAULT_NETWORK_ID]: DEFAULT_PROVIDER,
			8453: new providers.JsonRpcProvider(
				`https://base-mainnet.infura.io/v3/${INFURA_API_KEY}`,
				8453
			),
			137: new providers.JsonRpcProvider(
				`https://polygon-mainnet.infura.io/v3/${INFURA_API_KEY}`,
				137
			),
			690: new providers.JsonRpcProvider(
				`https://rpc.redstonechain.com`,
				690
			),
		};

		const BLOCK_TIME: Record<number, number> = {
			84532: 2000, // Base Sepolia
			8453: 2000, // Base Mainnet
			137: 2000, // Polygon Mainnet
			690: 2000, // Redstone Chain
		};

		const server = new McpServer({
			name: "Bitly MCP Server",
			version: "0.1.0",
		});

		const createSDK = async (networkId: number) => {
			const provider = PROVIDERS[networkId];
			if (!provider) {
				throw new Error(`Provider not available for network ${networkId}.`);
			}
			const feeData = await provider.getFeeData();
			provider.getFeeData = async () => {
				// Force using legacy mode to send the transaction (type 0)
				return {
					lastBaseFeePerGas: null,
					maxFeePerGas: null,
					maxPriorityFeePerGas: null,
					gasPrice: feeData.gasPrice,
				};
			};
			const sdk = new BitlySDK({
				networkId: networkId,
				provider: provider,
			})

			try {
				await sdk.setSigner(new Wallet(config.walletPrivateKey, PROVIDERS[networkId]));
			} catch (error) {
				throw new Error("Unauthorized - " + (error instanceof Error ? error.message : 'Invalid wallet configuration'));
			}
			return sdk;
		};

		server.tool(
			"get_balance",
			"Retrieves the current token balance deposited in Bitly Exchange for a specific token contract. Requires network ID (chain ID) and ERC20 token contract address. Returns a stringified JSON object mapping token addresses to their real (human-readable) balance amounts.",
			{
				networkId: z.number().describe("The blockchain network ID (chain ID)"),
				tokenAddress: z.string().describe("ERC20 token contract address"),
			},
			async ({ networkId, tokenAddress }) => {
				const sdk = await createSDK(networkId);
				await sdk.setProvider(PROVIDERS[networkId]);
				const balance = await sdk.wallet.balancesInBank([tokenAddress]);
				return {
					content: [{ type: "text", text: JSON.stringify(balance, null, 2) }],
				};
			}
		);

		server.tool(
			"get_trade_pairs_info",
			"Fetches trading pair information including market addresses, display names, and base/quote token details. Requires network ID and array of pair IDs. Returns an array of ExchangeMarketType objects containing marketAddress, displayName, tokenX, and tokenY information. Leave pairIds to empty array to get all pairs.",
			{
				networkId: z.number().describe("The blockchain network ID (chain ID)"),
				pairIds: z.array(z.string()).describe("Array of pair IDs. Leave empty to get all pairs"),
			},
			async ({ networkId, pairIds }) => {
				const sdk = await createSDK(networkId);
				await sdk.setProvider(PROVIDERS[networkId]);
				const info = await sdk.exchange.getMarketsInfo(pairIds);
				return {
					content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
				};
			}
		);

		server.tool(
			"get_tokens_info",
			"Retrieves metadata and on-chain information for specified ERC20 tokens. Requires network ID and array of token contract addresses. Returns an array of TokenInfoTypeWithAddress objects containing symbol, name, decimals, and address for each token. Leave tokensAddress to empty array to get all tokens.",
			{
				networkId: z.number().describe("The blockchain network ID (chain ID)"),
				tokensAddress: z.array(z.string()).describe("Array of token contract addresses. Leave empty to get all tokens"),
			},
			async ({ networkId, tokensAddress }) => {
				const sdk = await createSDK(networkId);
				await sdk.setProvider(PROVIDERS[networkId]);
				const info = await sdk.exchange.getTokensInfo(tokensAddress);
				return {
					content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
				};
			}
		);

		server.tool(
			"get_trade_volumes",
			"Calculates trading volumes for specified pairs over a given time period. Requires network ID, array of pair IDs, and relative time window in seconds. Returns a MarketsVolumes object mapping market addresses to their real (human-readable) volume amounts.",
			{
				networkId: z.number().describe("The blockchain network ID (chain ID)"),
				pairIds: z.array(z.string()).describe("Array of pair IDs"),
				relativeTimeInSec: z.number().describe("Time window in seconds relative to now"),
			},
			async ({ networkId, pairIds, relativeTimeInSec }) => {
				const sdk = await createSDK(networkId);
				await sdk.setProvider(PROVIDERS[networkId]);
				const info = await sdk.exchange.getVolumes(pairIds, relativeTimeInSec);
				return {
					content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
				};
			}
		);

		server.tool(
			"get_orderbook",
			"Retrieves the complete order book for a trading pair within specified price range. Requires network ID, pair ID, and price range (low/high). Returns an OrderbookType object with arrays of asks and bids, each containing direction, price and amount information.",
			{
				networkId: z.number().describe("The blockchain network ID (chain ID)"),
				pairId: z.string().describe("Trading pair ID"),
				priceRangeLow: z.number().describe("Lower bound of price range"),
				priceRangeHigh: z.number().describe("Upper bound of price range"),
			},
			async ({ networkId, pairId, priceRangeLow, priceRangeHigh }) => {
				const sdk = await createSDK(networkId);
				await sdk.setProvider(PROVIDERS[networkId]);
				const info = await sdk.exchange.getOrderbook(pairId, { low: priceRangeLow, high: priceRangeHigh });
				return {
					content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
				};
			}
		);

		server.tool(
			"get_my_open_orders",
			"Lists all currently open limit orders for the authenticated wallet across specified trading pairs. Requires network ID and array of pair IDs. Returns an ExchangeOrderDetails object mapping market addresses to arrays of objects with the following properties: sold (number), earned (number), selling (number), price (number), and direction (OrderDirection).",
			{
				networkId: z.number().describe("The blockchain network ID (chain ID)"),
				pairIds: z.array(z.string()).describe("Array of pair IDs"),
			},
			async ({ networkId, pairIds }) => {
				const sdk = await createSDK(networkId);
				await sdk.setProvider(PROVIDERS[networkId]);
				const info = await sdk.exchange.getLimitOrders(pairIds);
				return {
					content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
				};
			}
		);

		server.tool(
			"place_limit_order",
			"Submits a new limit order to the exchange. Requires network ID, pair ID, direction (BUY/SELL), price, and volume(**NOTE**: in base token(X) if direction is SELL, in quote token(Y) if direction is BUY). Returns a stringified ContractTransaction object containing the transaction details.",
			{
				networkId: z.number().describe("The blockchain network ID (chain ID)"),
				pairId: z.string().describe("Trading pair ID"),
				direction: z.enum(["BUY", "SELL"]).describe("Order direction"),
				price: z.number().describe("Order price"),
				volume: z.number().describe("Order volume (in base token X if SELL, in quote token Y if BUY)"),
			},
			async ({ networkId, pairId, direction, price, volume }) => {
				const sdk = await createSDK(networkId);
				await sdk.setProvider(PROVIDERS[networkId]);
				const info = await sdk.exchange.placeLimitOrder(pairId, direction as OrderDirection, price, volume);
				await setTimeout(() => { }, (BLOCK_TIME[networkId] ?? DEFAULT_BLOCK_TIME) + 1000);
				await sdk.prices.updateKline(pairId);
				return {
					content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
				};
			}
		);

		server.tool(
			"place_market_order",
			"Executes an immediate market order at current best available price. Requires network ID, pair ID, direction (BUY/SELL), volume(**NOTE**: in base token(X) if direction is SELL, in quote token(Y) if direction is BUY), current price estimate, and maximum acceptable slippage percentage(500 means 5% slippage, etc.). Returns a stringified ContractTransaction object containing the transaction details.",
			{
				networkId: z.number().describe("The blockchain network ID (chain ID)"),
				pairId: z.string().describe("Trading pair ID"),
				direction: z.enum(["BUY", "SELL"]).describe("Order direction"),
				volume: z.number().describe("Order volume (in base token X if SELL, in quote token Y if BUY)"),
				curPrice: z.number().describe("Current price estimate"),
				slippage: z.number().describe("Maximum acceptable slippage percentage (500 = 5%)"),
			},
			async ({ networkId, pairId, direction, volume, curPrice, slippage }) => {
				const sdk = await createSDK(networkId);
				await sdk.setProvider(PROVIDERS[networkId]);
				const info = await sdk.exchange.placeMarketOrder(pairId, direction as OrderDirection, volume, curPrice, slippage);
				await setTimeout(() => { }, (BLOCK_TIME[networkId] ?? DEFAULT_BLOCK_TIME) + 1000);
				await sdk.prices.updateKline(pairId);
				return {
					content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
				};
			}
		);

		server.tool(
			"cancel_limit_order",
			"Cancels a specific open limit order identified by its market, direction and price point. Requires network ID, pair ID, direction (BUY/SELL), and exact price point. Returns a stringified ContractTransaction object containing the transaction details.",
			{
				networkId: z.number().describe("The blockchain network ID (chain ID)"),
				pairId: z.string().describe("Trading pair ID"),
				direction: z.enum(["BUY", "SELL"]).describe("Order direction"),
				point: z.number().describe("Exact price point of the order to cancel"),
			},
			async ({ networkId, pairId, direction, point }) => {
				const sdk = await createSDK(networkId);
				await sdk.setProvider(PROVIDERS[networkId]);
				const info = await sdk.exchange.cancelLimitOrder(pairId, direction as OrderDirection, point);
				return {
					content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
				};
			}
		);

		server.tool(
			"cancel_all_limit_order",
			"Cancels all open limit orders for the authenticated wallet in a specific market. Requires network ID and pair ID. Returns a stringified ContractTransaction object containing the transaction details.",
			{
				networkId: z.number().describe("The blockchain network ID (chain ID)"),
				pairId: z.string().describe("Trading pair ID"),
			},
			async ({ networkId, pairId }) => {
				const sdk = await createSDK(networkId);
				await sdk.setProvider(PROVIDERS[networkId]);
				const info = await sdk.exchange.cancelAllLimitOrder(pairId);
				return {
					content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
				};
			}
		);

		server.tool(
			"claim_earning",
			"Claims trading rewards for a specific filled limit order. Requires network ID, pair ID, direction (BUY/SELL), and exact price point. Returns a stringified ContractTransaction object containing the transaction details.",
			{
				networkId: z.number().describe("The blockchain network ID (chain ID)"),
				pairId: z.string().describe("Trading pair ID"),
				direction: z.enum(["BUY", "SELL"]).describe("Order direction"),
				point: z.number().describe("Exact price point of the order to claim"),
			},
			async ({ networkId, pairId, direction, point }) => {
				const sdk = await createSDK(networkId);
				await sdk.setProvider(PROVIDERS[networkId]);
				const info = await sdk.exchange.claimEarning(pairId, direction as OrderDirection, point);
				return {
					content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
				};
			}
		);

		server.tool(
			"claim_all_earnings",
			"Claims all available trading rewards for the authenticated wallet in a specific market. Requires network ID and pair ID. Returns a stringified ContractTransaction object containing the transaction details.",
			{
				networkId: z.number().describe("The blockchain network ID (chain ID)"),
				pairId: z.string().describe("Trading pair ID"),
			},
			async ({ networkId, pairId }) => {
				const sdk = await createSDK(networkId);
				await sdk.setProvider(PROVIDERS[networkId]);
				const info = await sdk.exchange.claimAllEarnings(pairId);
				return {
					content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
				};
			}
		);

		server.tool(
			"get_finished_orders",
			"Retrieves historical order data for filled/cancelled orders within a specified time range. Requires network ID, array of pair IDs, and from/to timestamps (in seconds relative to now). Returns an ExchangeOrdersType object mapping market addresses to arrays of order information including direction, volume, price, timestamp, and transaction hash.",
			{
				networkId: z.number().describe("The blockchain network ID (chain ID)"),
				pairIds: z.array(z.string()).describe("Array of pair IDs"),
				relativeFromInSec: z.number().describe("Start time in seconds relative to now"),
				relativeToInSec: z.number().describe("End time in seconds relative to now"),
			},
			async ({ networkId, pairIds, relativeFromInSec, relativeToInSec }) => {
				const sdk = await createSDK(networkId);
				await sdk.setProvider(PROVIDERS[networkId]);
				const info = await sdk.exchange.getFinishedOrders(pairIds, relativeFromInSec, relativeToInSec);
				return {
					content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
				};
			}
		);

		server.tool(
			"get_market_order_history",
			"Fetches trade history for specified markets. Requires network ID, array of pair IDs, and from/to timestamps (in seconds relative to now). Returns an ExchangeOrdersType object mapping market addresses to arrays of order information including direction, volume, price, timestamp, and transaction hash.",
			{
				networkId: z.number().describe("The blockchain network ID (chain ID)"),
				pairIds: z.array(z.string()).describe("Array of pair IDs"),
				relativeFromInSec: z.number().describe("Start time in seconds relative to now"),
				relativeToInSec: z.number().describe("End time in seconds relative to now"),
			},
			async ({ networkId, pairIds, relativeFromInSec, relativeToInSec }) => {
				const sdk = await createSDK(networkId);
				await sdk.setProvider(PROVIDERS[networkId]);
				const info = await sdk.exchange.getMarketOrderHistory(pairIds, relativeFromInSec, relativeToInSec);
				return {
					content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
				};
			}
		);

		server.tool(
			"get_prices",
			"Retrieves current or historical price data for specified trading pairs. Requires network ID, array of pair IDs, and timestamp (in seconds relative to now). Returns a PricesMap object mapping market addresses to their current price values.",
			{
				networkId: z.number().describe("The blockchain network ID (chain ID)"),
				pairIds: z.array(z.string()).describe("Array of pair IDs"),
				relativeTimeInSec: z.number().describe("Time in seconds relative to now"),
			},
			async ({ networkId, pairIds, relativeTimeInSec }) => {
				const sdk = await createSDK(networkId);
				await sdk.setProvider(PROVIDERS[networkId]);
				const info = await sdk.prices.getPrices(pairIds, relativeTimeInSec);
				return {
					content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
				};
			}
		);

		server.tool(
			"get_klines",
			"Fetches OHLCV (Open-High-Low-Close-Volume) candle data for technical analysis. Requires network ID, array of pair IDs, candle resolution (60s, 240s, 1D), and from/to timestamps. Returns arrays of CandleResult objects containing open, high, low, close, volume, symbol, and time information.",
			{
				networkId: z.number().describe("The blockchain network ID (chain ID)"),
				pairIds: z.array(z.string()).describe("Array of pair IDs"),
				resolution: z.enum(["60", "240", "1D"]).describe("Candle resolution"),
				relativeFromInSec: z.number().describe("Start time in seconds relative to now"),
				relativeToInSec: z.number().describe("End time in seconds relative to now"),
			},
			async ({ networkId, pairIds, resolution, relativeFromInSec, relativeToInSec }) => {
				const sdk = await createSDK(networkId);
				await sdk.setProvider(PROVIDERS[networkId]);
				const info = await sdk.prices.getKlines(pairIds, resolution, relativeFromInSec, relativeToInSec);
				return {
					content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
				};
			}
		);

		return server;
	} catch (e) {
		console.error(e);
		throw e;
	}
}

// Parse configuration from URL query parameter (base64 encoded)
function parseConfig(req: express.Request): z.infer<typeof configSchema> | null {
	try {
		const configParam = req.query.config as string;
		
		if (!configParam) {
			console.log('No config parameter found');
			return null;
		}

		const decodedConfig = Buffer.from(configParam, 'base64').toString('utf-8');
		const parsedConfig = JSON.parse(decodedConfig);
		
		// Validate config against schema
		return configSchema.parse(parsedConfig);
	} catch (error) {
		console.error('Error parsing config:', error);
		return null;
	}
}

// Create Express app
const app = express();

// Enable CORS for Smithery
app.use(cors({
	origin: '*',
	credentials: true,
	methods: ['GET', 'POST', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization', '*'],
	exposedHeaders: ['mcp-session-id', 'mcp-protocol-version']
}));

// Health check endpoint
app.get('/health', (req, res) => {
	res.json({ 
		status: 'healthy', 
		timestamp: new Date().toISOString(),
		service: 'Bitly MCP Server'
	});
});

// MCP endpoint
app.use('/mcp', async (req, res) => {
	try {
		// Parse configuration
		const config = parseConfig(req);
		
		if (!config) {
			res.status(400).json({ 
				error: 'Missing or invalid configuration. Please provide a valid walletPrivateKey in the config parameter.' 
			});
			return;
		}

		// Create MCP server instance with config
		const mcpServer = createMcpServer(config);
		
		// Create streamable HTTP transport
		const transport = new StreamableHTTPServerTransport({
			sessionIdGenerator: undefined,
		});

		// Clean up on request close
		res.on('close', () => {
			transport.close();
			mcpServer.close();
		});

		// Connect server to transport
		await mcpServer.connect(transport);
		await transport.handleRequest(req, res, req.body);
		
	} catch (error) {
		console.error('Error handling MCP request:', error);
		res.status(500).json({ 
			error: 'Internal server error',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

// Default route
app.get('/', (req, res) => {
	res.json({
		name: 'Bitly MCP Server',
		version: '0.1.0',
		endpoints: {
			mcp: '/mcp',
			health: '/health'
		}
	});
});

// Start server
const server = app.listen(PORT, () => {
	console.log(`Bitly MCP Server running on port ${PORT}`);
	console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
	console.log(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
	console.log('Received SIGTERM, shutting down gracefully');
	server.close(() => {
		console.log('Server closed');
		process.exit(0);
	});
});

process.on('SIGINT', () => {
	console.log('Received SIGINT, shutting down gracefully');
	server.close(() => {
		console.log('Server closed');
		process.exit(0);
	});
});