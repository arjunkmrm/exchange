import { FastMCP } from "fastmcp";
import { ServerResponse } from 'http';
import { z } from "zod";
import { Wallet } from "ethers";
import BitlySDK from '@bitly/sdk';
import { providers } from 'ethers';

const DEFAULT_PROVIDER = new providers.JsonRpcProvider(
	`https://base-sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
	84532
);
const DEFAULT_BLOCK_TIME = 2000;

const PROVIDERS: Record<number, providers.JsonRpcProvider> = {
	84532: DEFAULT_PROVIDER,
};

const BLOCK_TIME: Record<number, number> = {
	84532: 2000, // Base Sepolia
};


const createSDK = async (networkId: number) => {
	const sdk = new BitlySDK({
		networkId: 84532,
		provider: DEFAULT_PROVIDER,
	})

	try {
		await sdk.setSigner(new Wallet(process.env.WALLET_PRIVATE_KEY as string, PROVIDERS[networkId]));
	} catch (error) {
		const res = new ServerResponse({} as any);
		res.statusCode = 401;
		res.statusMessage = "Unauthorized";
		throw res;
	}
	return sdk;
}

const TOOLS = [
	{
		name: "get_balance",
		description: "Retrieves the current token balance deposited in Bitly Exchange for a specific token contract. Requires network ID (chain ID) and ERC20 token contract address. Returns a stringified JSON object mapping token addresses to their real (human-readable) balance amounts.",
		parameters: z.object({
			networkId: z.number(),
			tokenAddress: z.string(),
		}),
		execute: async (args: any) => {
			const sdk = await createSDK(args.networkId);
			await sdk.setProvider(PROVIDERS[args.networkId]);
			const balance = await sdk.wallet.balancesInBank([args.tokenAddress]);
			return JSON.stringify(balance);
		},
	},
	{
		name: "get_trade_pairs_info",
		description: "Fetches trading pair information including market addresses, display names, and base/quote token details. Requires network ID and array of pair IDs. Returns an array of ExchangeMarketType objects containing marketAddress, displayName, tokenX, and tokenY information. Leave pairIds to empty array to get all pairs.",
		parameters: z.object({
			networkId: z.number(),
			pairIds: z.array(z.string()),
		}),
		execute: async (args: any) => {
			const sdk = await createSDK(args.networkId);
			await sdk.setProvider(PROVIDERS[args.networkId]);
			const info = await sdk.exchange.getMarketsInfo(args.pairIds);
			return JSON.stringify(info);
		}
	},
	{
		name: "get_tokens_info",
		description: "Retrieves metadata and on-chain information for specified ERC20 tokens. Requires network ID and array of token contract addresses. Returns an array of TokenInfoTypeWithAddress objects containing symbol, name, decimals, and address for each token. Leave tokensAddress to empty array to get all tokens.",
		parameters: z.object({
			networkId: z.number(),
			tokensAddress: z.array(z.string()),
		}),
		execute: async (args: any) => {
			const sdk = await createSDK(args.networkId);
			await sdk.setProvider(PROVIDERS[args.networkId]);
			const info = await sdk.exchange.getTokensInfo(args.tokensAddress);
			return JSON.stringify(info);
		}
	},
	{
		name: "get_trade_volumes",
		description: "Calculates trading volumes for specified pairs over a given time period. Requires network ID, array of pair IDs, and relative time window in seconds. Returns a MarketsVolumes object mapping market addresses to their real (human-readable) volume amounts.",
		parameters: z.object({
			networkId: z.number(),
			pairIds: z.array(z.string()),
			relativeTimeInSec: z.number(),
		}),
		execute: async (args: any) => {
			const sdk = await createSDK(args.networkId);
			await sdk.setProvider(PROVIDERS[args.networkId]);
			const info = await sdk.exchange.getVolumes(args.pairIds, args.relativeTimeInSec);
			return JSON.stringify(info);
		}
	},
	{
		name: "get_orderbook",
		description: "Retrieves the complete order book for a trading pair within specified price range. Requires network ID, pair ID, and price range (low/high). Returns an OrderbookType object with arrays of asks and bids, each containing direction, price and amount information.",
		parameters: z.object({
			networkId: z.number(),
			pairId: z.string(),
			priceRangeLow: z.number(),
			priceRangeHigh: z.number(),
		}),
		execute: async (args: any) => {
			const sdk = await createSDK(args.networkId);
			await sdk.setProvider(PROVIDERS[args.networkId]);
			const info = await sdk.exchange.getOrderbook(args.pairId, {low: args.priceRangeLow, high: args.priceRangeHigh});
			return JSON.stringify(info);
		}
	},
	{
		name: "get_my_open_orders",
		description: "Lists all currently open limit orders for the authenticated wallet across specified trading pairs. Requires network ID and array of pair IDs. Returns an ExchangeOrderDetails object mapping market addresses to arrays of objects with the following properties: sold (number), earned (number), selling (number), price (number), and direction (OrderDirection).",
		parameters: z.object({
			networkId: z.number(),
			pairIds: z.array(z.string()),
		}),
		execute: async (args: any) => {
			const sdk = await createSDK(args.networkId);
			await sdk.setProvider(PROVIDERS[args.networkId]);
			const info = await sdk.exchange.getLimitOrders(args.pairIds);
			return JSON.stringify(info);
		}
	},
	{
		// public async placeLimitOrder(market: string, direction: OrderDirection, price: number, volume: number)
		name: "place_limit_order",
		description: "Submits a new limit order to the exchange. Requires network ID, pair ID, direction (BUY/SELL), price, and volume. Returns a stringified ContractTransaction object containing the transaction details.",
		parameters: z.object({
			networkId: z.number(),
			pairId: z.string(),
			direction: z.enum(["BUY", "SELL"]),
			price: z.number(),
			volume: z.number(),
		}),
		execute: async (args: any) => {
			const sdk = await createSDK(args.networkId);
			await sdk.setProvider(PROVIDERS[args.networkId]);
			const info = await sdk.exchange.placeLimitOrder(args.pairId, args.direction, args.price, args.volume);
			await setTimeout(()=>{}, (BLOCK_TIME[args.networkId] ?? DEFAULT_BLOCK_TIME) + 1000);
			await sdk.prices.updateKline(args.pairId);
			return JSON.stringify(info);
		}
	},
	{
		// public async placeMarketOrder(market: string, direction: OrderDirection, volume: number, curPrice: number, 
		// slippage: number): Promise<ContractTransaction>
		name: "place_market_order",
		description: "Executes an immediate market order at current best available price. Requires network ID, pair ID, direction (BUY/SELL), volume, current price estimate, and maximum acceptable slippage percentage. Returns a stringified ContractTransaction object containing the transaction details.",
		parameters: z.object({
			networkId: z.number(),
			pairId: z.string(),
			direction: z.enum(["BUY", "SELL"]),
			volume: z.number(),
			curPrice: z.number(),
			slippage: z.number(),
		}),
		execute: async (args: any) => {
			const sdk = await createSDK(args.networkId);
			await sdk.setProvider(PROVIDERS[args.networkId]);
			const info = await sdk.exchange.placeMarketOrder(args.pairId, args.direction, args.volume, args.curPrice, args.slippage);
			await setTimeout(()=>{}, (BLOCK_TIME[args.networkId] ?? DEFAULT_BLOCK_TIME) + 1000);
			await sdk.prices.updateKline(args.pairId);
			return JSON.stringify(info);
		}
	},
	{
		// public async cancelLimitOrder(market: string, direction: OrderDirection, point: number)
		name: "cancel_limit_order",
		description: "Cancels a specific open limit order identified by its market, direction and price point. Requires network ID, pair ID, direction (BUY/SELL), and exact price point. Returns a stringified ContractTransaction object containing the transaction details.",
		parameters: z.object({
			networkId: z.number(),
			pairId: z.string(),
			direction: z.enum(["BUY", "SELL"]),
			point: z.number(),
		}),
		execute: async (args: any) => {
			const sdk = await createSDK(args.networkId);
			await sdk.setProvider(PROVIDERS[args.networkId]);
			const info = await sdk.exchange.cancelLimitOrder(args.pairId, args.direction, args.point);
			return JSON.stringify(info);
		}
	},
	{
		// public async cancelAllLimitOrder(market: string): Promise<ContractTransaction>
		name: "cancel_all_limit_order",
		description: "Cancels all open limit orders for the authenticated wallet in a specific market. Requires network ID and pair ID. Returns a stringified ContractTransaction object containing the transaction details.",
		parameters: z.object({
			networkId: z.number(),
			pairId: z.string(),
		}),
		execute: async (args: any) => {
			const sdk = await createSDK(args.networkId);
			await sdk.setProvider(PROVIDERS[args.networkId]);
			const info = await sdk.exchange.cancelAllLimitOrder(args.pairId);
			return JSON.stringify(info);
		}
	},
	{
		// public async claimEarning(market: string, direction: OrderDirection, point: number): Promise<ContractTransaction>
		name: "claim_earning",
		description: "Claims trading rewards for a specific filled limit order. Requires network ID, pair ID, direction (BUY/SELL), and exact price point. Returns a stringified ContractTransaction object containing the transaction details.",
		parameters: z.object({
			networkId: z.number(),
			pairId: z.string(),
			direction: z.enum(["BUY", "SELL"]),
			point: z.number(),
		}),
		execute: async (args: any) => {
			const sdk = await createSDK(args.networkId);
			await sdk.setProvider(PROVIDERS[args.networkId]);
			const info = await sdk.exchange.claimEarning(args.pairId, args.direction, args.point);
			return JSON.stringify(info);
		}
	},
	{
		// public async claimAllEarnings(market: string): Promise<ContractTransaction>
		name: "claim_all_earnings",
		description: "Claims all available trading rewards for the authenticated wallet in a specific market. Requires network ID and pair ID. Returns a stringified ContractTransaction object containing the transaction details.",
		parameters: z.object({
			networkId: z.number(),
			pairId: z.string(),
		}),
		execute: async (args: any) => {
			const sdk = await createSDK(args.networkId);
			await sdk.setProvider(PROVIDERS[args.networkId]);
			const info = await sdk.exchange.claimAllEarnings(args.pairId);
			return JSON.stringify(info);
		}
	},
	{
		// public async getFinishedOrders(markets: string[], relativeFromInSec: number, relativeToInSec: number)
		name: "get_finished_orders",
		description: "Retrieves historical order data for filled/cancelled orders within a specified time range. Requires network ID, array of pair IDs, and from/to timestamps (in seconds relative to now). Returns an ExchangeOrdersType object mapping market addresses to arrays of order information including direction, volume, price, timestamp, and transaction hash.",
		parameters: z.object({
			networkId: z.number(),
			pairIds: z.array(z.string()),
			relativeFromInSec: z.number(),
			relativeToInSec: z.number(),
		}),
		execute: async (args: any) => {
			const sdk = await createSDK(args.networkId);
			await sdk.setProvider(PROVIDERS[args.networkId]);
			const info = await sdk.exchange.getFinishedOrders(args.pairIds, args.relativeFromInSec, args.relativeToInSec);
			return JSON.stringify(info);
		}
	},
	{
		// public async getMarketOrderHistory(markets: string[], relativeFromInSec: number, relativeToInSec: number)
		name: "get_market_order_history",
		description: "Fetches trade history for specified markets. Requires network ID, array of pair IDs, and from/to timestamps (in seconds relative to now). Returns an ExchangeOrdersType object mapping market addresses to arrays of order information including direction, volume, price, timestamp, and transaction hash.",
		parameters: z.object({
			networkId: z.number(),
			pairIds: z.array(z.string()),
			relativeFromInSec: z.number(),
			relativeToInSec: z.number(),
		}),
		execute: async (args: any) => {
			const sdk = await createSDK(args.networkId);
			await sdk.setProvider(PROVIDERS[args.networkId]);
			const info = await sdk.exchange.getMarketOrderHistory(args.pairIds, args.relativeFromInSec, args.relativeToInSec);
			return JSON.stringify(info);
		}
	},
	{
		// public async getPrices(markets: string[], relativeTimeInSec: number): Promise<PricesMap> {
		name: "get_prices",
		description: "Retrieves current or historical price data for specified trading pairs. Requires network ID, array of pair IDs, and timestamp (in seconds relative to now). Returns a PricesMap object mapping market addresses to their current price values.",
		parameters: z.object({
			networkId: z.number(),
			pairIds: z.array(z.string()),
			relativeTimeInSec: z.number(),
		}),
		execute: async (args: any) => {
			const sdk = await createSDK(args.networkId);
			await sdk.setProvider(PROVIDERS[args.networkId]);
			const info = await sdk.prices.getPrices(args.pairIds, args.relativeTimeInSec);
			return JSON.stringify(info);
		}
	},
	{
		// public async getKlines(markets: string[], resolution: KLINE_SOLUTION, relativeFromInSec: number,
		// relativeToInSec: number): 
		name: "get_klines",
		description: "Fetches OHLCV (Open-High-Low-Close-Volume) candle data for technical analysis. Requires network ID, array of pair IDs, candle resolution (60s, 240s, 1D), and from/to timestamps. Returns arrays of CandleResult objects containing open, high, low, close, volume, symbol, and time information.",
		parameters: z.object({
			networkId: z.number(),
			pairIds: z.array(z.string()),
			resolution: z.enum(["60", "240", "1D"]),
			relativeFromInSec: z.number(),
			relativeToInSec: z.number(),
		}),
		execute: async (args: any) => {
			const sdk = await createSDK(args.networkId);
			await sdk.setProvider(PROVIDERS[args.networkId]);
			const info = await sdk.prices.getKlines(args.pairIds, args.resolution, args.relativeFromInSec, args.relativeToInSec);
			return JSON.stringify(info);
		}
	},
]

const server = new FastMCP({
	name: "Bitly MCP Server",
	version: "0.1.0"
});

for (const tool of TOOLS) {
	server.addTool(tool as any);
}

server.start({
	transportType: "stdio",
});