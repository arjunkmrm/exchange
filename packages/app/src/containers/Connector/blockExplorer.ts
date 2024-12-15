import { chain } from './config'

export const generateExplorerFunctions = (networkId: number) => {
	const chainName = Object.keys(chain)
		.filter(key => chain[key].id == networkId)?.[0]
	if (!chainName) {
		return {}
	}

	const baseLink = chain[chainName].blockExplorers?.default.url

	return {
		baseLink,
		txLink: (txId: string) => `${baseLink}/tx/${txId}`,
		addressLink: (address: string) => `${baseLink}/address/${address}`,
		tokenLink: (address: string) => `${baseLink}/token/${address}`,
		blockLink: (blockNumber: string) => `${baseLink}/block/${blockNumber}`,
	}
};
