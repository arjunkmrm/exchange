import { experimental_createMCPClient as createMCPClient } from 'ai';
import { readFileSync } from 'fs';

async function main() {
    // Read API key from .secret file
    const apiKey = readFileSync('.secret', 'utf-8').trim();
    
    const mcpClient = await createMCPClient({
        transport: {
            type: 'sse',
            url: 'http://localhost:8080/sse',
            headers: {
                'ether-private-key': `${apiKey}`,
            },
        },
    });

    const tools = await mcpClient.tools();
    console.log(tools);
}

main();