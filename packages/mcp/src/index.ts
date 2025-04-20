import { FastMCP } from "fastmcp";
import { ServerResponse } from 'http';
import { z } from "zod";
import { Wallet } from "ethers";
import BitlySDK from '@bitly/sdk';
import { DEFAULT_NETWORK_ID } from '@bitly/sdk/constants';
import { providers } from 'ethers';

const DEFAULT_PROVIDER = new providers.JsonRpcProvider(
	`https://base-sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
	84532
);

const PROVIDERS: Record<number, providers.JsonRpcProvider> = {
	84532: DEFAULT_PROVIDER,
};

const TOOLS = [
	{
		name: "get_balance",
		description: "Get balance deposited to Bitly Exchange base on provided networkId and token address.",
		parameters: z.object({
			networkId: z.number(),
			tokenAddress: z.string(),
		}),
		execute: async (args: any, context: {
			session: {
				sdk: BitlySDK;
			} | undefined
		}) => {
			await context.session?.sdk.setProvider(PROVIDERS[args.networkId]);
			const balance = await context.session?.sdk.wallet.balancesInBank([args.tokenAddress]);
			return JSON.stringify(balance);
		},
	},

]


const server = new FastMCP({
	name: "Bitly MCP Server",
	version: "0.1.0",
	authenticate: async (request) => {
		const privateKey = request.headers["ether-private-key"];

		const sdk = new BitlySDK({
			networkId: DEFAULT_NETWORK_ID,
			provider: DEFAULT_PROVIDER,
		})

		try {
			await sdk.setSigner(new Wallet(privateKey as string));
		} catch (error) {
			const res = new ServerResponse({} as any);
			res.statusCode = 401;
			res.statusMessage = "Unauthorized";
			throw res;
		}

		// Whatever you return here will be accessible in the `context.session` object.
		return {
			sdk,
		}
	},
});

for (const tool of TOOLS) {
	server.addTool(tool);
}

server.start({
	transportType: "sse",
	sse: {
		endpoint: "/sse",
		port: 8080,
	},
});