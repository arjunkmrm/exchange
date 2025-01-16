import BitlySDK from '..';
import { 
	CustomMarketsInfoType,
	ExchangePairsType,
	ListTokenProps,
	TokenInfoType,
	TokenInfoTypeWithAddress,
} from '../types/exchange';
import { 
	ExchangeReadContracts,
	ExchangeWriteContract,
	internalFetchMarketsAndTokens, 
} from '../utils/contract';
import { ContractTransaction } from 'ethers';

export default class ManageService {
    private sdk: BitlySDK

    constructor(sdk: BitlySDK) {
        this.sdk = sdk
    }

	public async listToken(props: ListTokenProps): Promise<ContractTransaction> {
        return await ExchangeWriteContract(this.sdk, 'listToken', [
			props.address,
			props.description,
			props.url,
			props.logo
		]);
    }

	public async listPair(base: string, quote: string): Promise<ContractTransaction> {
        return await ExchangeWriteContract(this.sdk, 'listPair', [base, quote, 10]);
    }

	public async createMarket(marketName: string): Promise<ContractTransaction> {
        return await ExchangeWriteContract(this.sdk, 'createMarket', [marketName]);
    }

	public async addPairToMarket(marketName: string, pair: string): Promise<ContractTransaction> {
        return await ExchangeWriteContract(this.sdk, 'addPairToMarket', [marketName, pair]);
    }

	public async deletePairFromMarket(marketName: string, pair: string): Promise<ContractTransaction> {
		const pairs: ExchangePairsType[] = await ExchangeReadContracts(this.sdk, ['pairs'], [[marketName]]);
		const index = pairs[0].map(e=>e.pair).indexOf(pair);
        return await ExchangeWriteContract(this.sdk, 'deletePairFromMarket', [marketName, index]);
    }

	public async getMarketByOwner(): Promise<CustomMarketsInfoType> {
		const markets: string[][] = await ExchangeReadContracts(
			this.sdk, 
			['marketsByOwner'], 
			[[this.sdk.context.walletAddress]]
		);

		if (markets[0].length === 0) {
			return {};
		}
		
		const customMarkets: CustomMarketsInfoType = {};
		for (const marketName of markets[0]) {
			const {markets} = await internalFetchMarketsAndTokens(this.sdk, marketName)
			customMarkets[marketName] = markets;
		}

		return customMarkets;
	}

	public async getAllMarkets() {
		const {markets} = await internalFetchMarketsAndTokens(this.sdk)
		return markets;
	}

	public async getAllTokens() {
        const tokens: string[][] = await ExchangeReadContracts(this.sdk, ['tokens']);
		const tokenInfos: TokenInfoType[] = await ExchangeReadContracts(this.sdk, ['tokenInfo'], tokens[0].map(e=>([e])));
        const tokenInfosWithAddress: TokenInfoTypeWithAddress[] = [];
		for (let i = 0; i < tokenInfos.length; i++) {
            const info = tokenInfos[i];
            const address = tokens[0][i];
            tokenInfosWithAddress.push({ ...info, address } as TokenInfoTypeWithAddress);
        }

		return tokenInfosWithAddress;
	}
}
