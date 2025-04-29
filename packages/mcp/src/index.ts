import { FastMCP } from "fastmcp";
import { ServerResponse } from 'http';
import { z } from "zod";
import { Wallet } from "ethers";
import BitlySDK from '@bitly/sdk';
import { providers } from 'ethers';
import { config } from 'dotenv';

const DEFAULT_PROVIDER = new providers.JsonRpcProvider(
	`https://base-sepolia.infura.io/v3/${config().parsed?.['INFURA_API_KEY']}`,
	84532
);

const PROVIDERS: Record<number, providers.JsonRpcProvider> = {
	84532: DEFAULT_PROVIDER,
};


const createSDK = async () => {
	const sdk = new BitlySDK({
		networkId: 84532,
		provider: DEFAULT_PROVIDER,
	})

	try {
		await sdk.setSigner(new Wallet(config().parsed?.['WALLET_PRIVATE_KEY'] as string));
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
		description: "Get balance deposited to Bitly Exchange base on provided networkId and token address.",
		parameters: z.object({
			networkId: z.number(),
			tokenAddress: z.string(),
		}),
		execute: async (args: any) => {
			const sdk = await createSDK();
			await sdk.setProvider(PROVIDERS[args.networkId]);
			const balance = await sdk.wallet.balancesInBank([args.tokenAddress]);
			return JSON.stringify(balance);
		},
	},
	{
		name: "get_trade_pairs_info",
		description: "Get trade pairs info.",
		parameters: z.object({
			networkId: z.number(),
			pairIds: z.array(z.string()),
		}),
		execute: async (args: any) => {
			const sdk = await createSDK();
			await sdk.setProvider(PROVIDERS[args.networkId]);
			const info = await sdk.exchange.getMarketsInfo(args.pairIds);
			return JSON.stringify(info);
		}
	},
	{
		name: "get_tokens_info",
		description: "Get tokens info.",
		parameters: z.object({
			networkId: z.number(),
			tokensAddress: z.array(z.string()),
		}),
		execute: async (args: any) => {
			const sdk = await createSDK();
			await sdk.setProvider(PROVIDERS[args.networkId]);
			const info = await sdk.exchange.getTokensInfo(args.tokensAddress);
			return JSON.stringify(info);
		}
	},
	{
		name: "get_trade_volumes",
		description: "Get trade volumes.",
		parameters: z.object({
			networkId: z.number(),
			pairIds: z.array(z.string()),
			relativeTimeInSec: z.number(),
		}),
		execute: async (args: any) => {
			const sdk = await createSDK();
			await sdk.setProvider(PROVIDERS[args.networkId]);
			const info = await sdk.exchange.getVolumes(args.pairIds, args.relativeTimeInSec);
			return JSON.stringify(info);
		}
	},
	{
		name: "get_orderbook",
		description: "Get orderbook.",
		parameters: z.object({
			networkId: z.number(),
			pairId: z.string(),
			priceRange: z.object({
				low: z.number(),
				high: z.number(),
			}),
		}),
		execute: async (args: any) => {
			const sdk = await createSDK();
			await sdk.setProvider(PROVIDERS[args.networkId]);
			const info = await sdk.exchange.getOrderbook(args.pairId, args.priceRange);
			return JSON.stringify(info);
		}
	},
	{
		name: "get_my_open_orders",
		description: "Get my open orders.",
		parameters: z.object({
			networkId: z.number(),
			pairIds: z.array(z.string()),
		}),
		execute: async (args: any) => {
			const sdk = await createSDK();
			await sdk.setProvider(PROVIDERS[args.networkId]);
			const info = await sdk.exchange.getLimitOrders(args.pairIds);
			return JSON.stringify(info);
		}
	},
	{
		// public async placeLimitOrder(market: string, direction: OrderDirection, price: number, volume: number)
		name: "place_limit_order",
		description: "Place limit order.",
		parameters: z.object({
			networkId: z.number(),
			pairId: z.string(),
			direction: z.enum(["BUY", "SELL"]),
			price: z.number(),
			volume: z.number(),
		}),
		execute: async (args: any) => {
			const sdk = await createSDK();
			await sdk.setProvider(PROVIDERS[args.networkId]);
			const info = await sdk.exchange.placeLimitOrder(args.pairId, args.direction, args.price, args.volume);
			return JSON.stringify(info);
		}
	},
	{
		// public async placeMarketOrder(market: string, direction: OrderDirection, volume: number, curPrice: number, 
		// slippage: number): Promise<ContractTransaction>
		name: "place_market_order",
		description: "Place market order.",
		parameters: z.object({
			networkId: z.number(),
			pairId: z.string(),
			direction: z.enum(["BUY", "SELL"]),
			volume: z.number(),
			curPrice: z.number(),
			slippage: z.number(),
		}),
		execute: async (args: any) => {
			const sdk = await createSDK();
			await sdk.setProvider(PROVIDERS[args.networkId]);
			const info = await sdk.exchange.placeMarketOrder(args.pairId, args.direction, args.volume, args.curPrice, args.slippage);
			return JSON.stringify(info);
		}
	},
	{
		// public async cancelLimitOrder(market: string, direction: OrderDirection, point: number)
		name: "cancel_limit_order",
		description: "Cancel limit order.",
		parameters: z.object({
			networkId: z.number(),
			pairId: z.string(),
			direction: z.enum(["BUY", "SELL"]),
			point: z.number(),
		}),
		execute: async (args: any) => {
			const sdk = await createSDK();
			await sdk.setProvider(PROVIDERS[args.networkId]);
			const info = await sdk.exchange.cancelLimitOrder(args.pairId, args.direction, args.point);
			return JSON.stringify(info);
		}
	},
	{
		// public async cancelAllLimitOrder(market: string): Promise<ContractTransaction>
		name: "cancel_all_limit_order",
		description: "Cancel all limit order.",
		parameters: z.object({
			networkId: z.number(),
			pairId: z.string(),
		}),
		execute: async (args: any) => {
			const sdk = await createSDK();
			await sdk.setProvider(PROVIDERS[args.networkId]);
			const info = await sdk.exchange.cancelAllLimitOrder(args.pairId);
			return JSON.stringify(info);
		}
	},
	{
		// public async claimEarning(market: string, direction: OrderDirection, point: number): Promise<ContractTransaction>
		name: "claim_earning",
		description: "Claim earning.",
		parameters: z.object({
			networkId: z.number(),
			pairId: z.string(),
			direction: z.enum(["BUY", "SELL"]),
			point: z.number(),
		}),
		execute: async (args: any) => {
			const sdk = await createSDK();
			await sdk.setProvider(PROVIDERS[args.networkId]);
			const info = await sdk.exchange.claimEarning(args.pairId, args.direction, args.point);
			return JSON.stringify(info);
		}
	},
	{
		// public async claimAllEarnings(market: string): Promise<ContractTransaction>
		name: "claim_all_earnings",
		description: "Claim all earnings.",
		parameters: z.object({
			networkId: z.number(),
			pairId: z.string(),
		}),
		execute: async (args: any) => {
			const sdk = await createSDK();
			await sdk.setProvider(PROVIDERS[args.networkId]);
			const info = await sdk.exchange.claimAllEarnings(args.pairId);
			return JSON.stringify(info);
		}
	},
	{
		// public async getFinishedOrders(markets: string[], relativeFromInSec: number, relativeToInSec: number)
		name: "get_finished_orders",
		description: "Get finished orders.",
		parameters: z.object({
			networkId: z.number(),
			pairIds: z.array(z.string()),
			relativeFromInSec: z.number(),
			relativeToInSec: z.number(),
		}),
		execute: async (args: any) => {
			const sdk = await createSDK();
			await sdk.setProvider(PROVIDERS[args.networkId]);
			const info = await sdk.exchange.getFinishedOrders(args.pairIds, args.relativeFromInSec, args.relativeToInSec);
			return JSON.stringify(info);
		}
	},
	{
		// public async getMarketOrderHistory(markets: string[], relativeFromInSec: number, relativeToInSec: number)
		name: "get_market_order_history",
		description: "Get all finished history from market.",
		parameters: z.object({
			networkId: z.number(),
			pairIds: z.array(z.string()),
			relativeFromInSec: z.number(),
			relativeToInSec: z.number(),
		}),
		execute: async (args: any) => {
			const sdk = await createSDK();
			await sdk.setProvider(PROVIDERS[args.networkId]);
			const info = await sdk.exchange.getMarketOrderHistory(args.pairIds, args.relativeFromInSec, args.relativeToInSec);
			return JSON.stringify(info);
		}
	},
	{
		// public async getPrices(markets: string[], relativeTimeInSec: number): Promise<PricesMap> {
		name: "get_prices",
		description: "Get prices.",
		parameters: z.object({
			networkId: z.number(),
			pairIds: z.array(z.string()),
			relativeTimeInSec: z.number(),
		}),
		execute: async (args: any) => {
			const sdk = await createSDK();
			await sdk.setProvider(PROVIDERS[args.networkId]);
			const info = await sdk.prices.getPrices(args.pairIds, args.relativeTimeInSec);
			return JSON.stringify(info);
		}
	},
	{
		// public async getKlines(markets: string[], resolution: KLINE_SOLUTION, relativeFromInSec: number,
		// relativeToInSec: number): 
		name: "get_klines",
		description: "Get klines.",
		parameters: z.object({
			networkId: z.number(),
			pairIds: z.array(z.string()),
			resolution: z.enum(["60", "240", "1D"]),
			relativeFromInSec: z.number(),
			relativeToInSec: z.number(),
		}),
		execute: async (args: any) => {
			const sdk = await createSDK();
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