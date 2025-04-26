import { experimental_createMCPClient as createMCPClient } from 'ai';
import { Experimental_StdioMCPTransport as StdioMCPTransport } from 'ai/mcp-stdio';

createMCPClient({
	transport: new StdioMCPTransport({
		command: 'node',
		args: ['dist/index.js'],
		env: {
			"INFURA_API_KEY": process.env.INFURA_API_KEY as string,
			"WALLET_PRIVATE_KEY": process.env.WALLET_PRIVATE_KEY as string,
		}
	}),
}).then(async (client) => {
	const tools = await client.tools();
	const getBalanceTool = tools['get_balance'];
	console.log(await getBalanceTool.execute({
		networkId: 84532,
		tokenAddress: "0xF1CF8c98Cd12A21f1ebD2373C88DB182d63C6d71",
	}, {
		toolCallId: "1",
		messages: [{role: 'user', content: "test"}]
	}));

	const get_trade_pairs_info = tools['get_trade_pairs_info'];
	console.log(await get_trade_pairs_info.execute({
		networkId: 84532,
		pairIds: ["0x91185E644F14CC538B24A821A61278EB2F0e1436"],
	}, {
		toolCallId: "1",
		messages: [{role: 'user', content: "test"}]
	}));
	
	await client.close();
})