import BitlySDK from '..';
import { calcBlockHeight, point2Price, price2Point, toPlainAmount, toRealAmount } from '../utils';
import { 
	ExchangeOrdersType,
    ExchangeMarketType, 
    ExchangeOrderDetails, 
    ExchangePairsType, 
    MarketsVolumes, 
    OrderDirection, 
    PairEarningsType, 
    PairEarningsTypeWithOrderInfo, 
    PairLimitOrdersType, 
    PairTotalVolumeType, 
    TokenInfoType, 
    TokenInfoTypeWithAddress 
} from '../types/exchange';
import { DEFAULT_REFERRAL_ADDRESS, PERIOD_IN_SECONDS } from '../constants';
import { ExchangeReadContracts, getMarketLog, PairReadContracts, PairWriteContract } from '../utils/contract';
import { TARGET_MARKET_NOT_FOUND } from '../common/errors';
import { ContractTransaction } from 'ethers';

export default class ExchangeService {
    private sdk: BitlySDK
    private markets: ExchangeMarketType[] = []
    private tokens: TokenInfoTypeWithAddress[] = []
    private marketName? : string

    constructor(sdk: BitlySDK) {
        this.sdk = sdk
    }

	public async setMarketName(marketName: string = ''): Promise<void> {
		if (this.marketName === marketName) {
            return;
        }

		await this._fetchMarketsAndTokens(marketName);
        this.marketName = marketName;
	}

	public getMarketName(): string | undefined {
		return this.marketName;
	}

	public getMarketsInfo(markets: string[]) {
		if (markets.length === 0) {
			return this.markets;
		}
		return this.markets.filter(e=>markets.includes(e.marketAddress));
	}

	public getTokensInfo(tokens: string[]) {
		if (tokens.length === 0) {
			return this.tokens;
		}
		return this.tokens.filter(e=>tokens.includes(e.address));
	}

    public async getVolumes(markets: string[], relativeTimeInSec: number = 0): Promise<MarketsVolumes> {
        const allMarkets = await this.markets;
        const targetMarkets = allMarkets.filter(market=>markets.includes(market.marketAddress));

		const blockDeployed = await PairReadContracts(
			this.sdk,
			targetMarkets.map(e=>e.marketAddress),
			['blockDeployed'],
			[[]]
		);
		const targetBlockHeight = await calcBlockHeight(relativeTimeInSec, this.sdk.context.provider);

		const marketInvovledList= [];
		for (let i = 0; i < targetMarkets.length; i++) {
			const market = targetMarkets[i];
			const block = blockDeployed[i];
			if (block <= targetBlockHeight) {
				marketInvovledList.push(market);
			}
		}

        const volumes: PairTotalVolumeType[] = await PairReadContracts(
            this.sdk, 
            marketInvovledList.map(e=>e.marketAddress), 
            ['totalVolume'], 
            [[]], 
            {blockTag: targetBlockHeight}
        );

		const marketInvoledDict: MarketsVolumes = {};
		for (let i = 0; i < marketInvovledList.length; i++) {
			const market = marketInvovledList[i];
			const volume = volumes[i];
			const decimal = market.tokenY.decimals;
			marketInvoledDict[market.marketAddress] = toRealAmount(volume, decimal);
		}

        return marketInvoledDict;
    }

    public async getLimitOrders(markets: string[]): Promise<ExchangeOrderDetails> {
        const wallet = this.sdk.context.walletAddress;
        const allMarkets = await this.markets;
        const targetMarkets = allMarkets.filter(market=>markets.includes(market.marketAddress));

        const limOrdersViews: PairLimitOrdersType[] = 
            await PairReadContracts(this.sdk, targetMarkets.map(e=>e.marketAddress), ['limitOrders'], [[wallet]]);
        
        const earnings: ExchangeOrderDetails = {};
        for (let i = 0; i < limOrdersViews.length; i++) {
            const orderViewsPerMarket = limOrdersViews[i];
            const market = targetMarkets[i].marketAddress;
            const orderDetails: PairEarningsType[] = await PairReadContracts(
                this.sdk, [market], ['queryEarning'], orderViewsPerMarket.map(e=>([e.targetToken, e.point]))
            );
            const formattedOrderDetails: PairEarningsTypeWithOrderInfo[] = orderDetails.map((e, j)=>{
                const originToken = orderViewsPerMarket[j].originToken;
                const direction = originToken == targetMarkets[i].tokenY.address 
                    ? OrderDirection.buy 
                    : OrderDirection.sell;
                return {
                    direction,
                    earned: toRealAmount(e.earned),
                    sold: toRealAmount(e.sold),
                    selling: toRealAmount(e.selling),
                    ...orderViewsPerMarket[j]
                } as PairEarningsTypeWithOrderInfo;
            });
            earnings[market] = formattedOrderDetails;
        }
        return earnings;
    }

    public async placeLimitOrder(market: string, direction: OrderDirection, price: number, volume: number)
		: Promise<ContractTransaction> 
	{
        const targetMarket = this.markets.find(e=>e.marketAddress==market);

        const originToken = direction == OrderDirection.buy ? targetMarket?.tokenY : targetMarket?.tokenX;
        const point = price2Point(price);
        const amount = toPlainAmount(volume, originToken?.decimals);
        const holder = DEFAULT_REFERRAL_ADDRESS;
        const referral = DEFAULT_REFERRAL_ADDRESS;

        return await PairWriteContract(this.sdk, market, 'limitOrder', [originToken?.address, point, amount, holder, referral]);
    }

    public async placeMarketOrder(market: string, direction: OrderDirection, volume: number, curPrice: number, 
        slippage: number): Promise<ContractTransaction>
    {
        const targetMarket: ExchangeMarketType | undefined = this.markets.filter(e=>e.marketAddress=market)?.[0];
        if (!targetMarket) {
            throw new Error(TARGET_MARKET_NOT_FOUND);
        }

        const originToken = direction == OrderDirection.buy ? targetMarket.tokenY : targetMarket.tokenX;
        const startPoint = price2Point(curPrice);
        const amount = toPlainAmount(volume, originToken.decimals);
        const holder = DEFAULT_REFERRAL_ADDRESS;
        const referral = DEFAULT_REFERRAL_ADDRESS;

        return await PairWriteContract(
            this.sdk, market, 'marketOrder', [originToken, amount, startPoint, slippage, holder, referral]
        );
    }

    public async cancelLimitOrder(market: string, direction: OrderDirection, point: number)
		: Promise<ContractTransaction> 
	{
        const targetMarket: ExchangeMarketType | undefined = this.markets.filter(e=>e.marketAddress=market)?.[0];
        if (!targetMarket) {
            throw new Error(TARGET_MARKET_NOT_FOUND);
        }

        const originToken = direction == OrderDirection.buy ? targetMarket.tokenY : targetMarket.tokenX;
        return await PairWriteContract(this.sdk, market, 'cancelLimitOrder', [originToken, point]);
    }

    public async cancelAllLimitOrder(market: string): Promise<ContractTransaction> {
        const targetMarket: ExchangeMarketType | undefined = this.markets.filter(e=>e.marketAddress=market)?.[0];
        if (!targetMarket) {
            throw new Error(TARGET_MARKET_NOT_FOUND);
        }

        return await PairWriteContract(this.sdk, market, 'cancelAllLimitOrders', []);
    }

    public async claimEarning(market: string, direction: OrderDirection, point: number): Promise<ContractTransaction> {
        const targetMarket: ExchangeMarketType | undefined = this.markets.filter(e=>e.marketAddress=market)?.[0];
        if (!targetMarket) {
            throw new Error(TARGET_MARKET_NOT_FOUND);
        }

        const originToken = direction == OrderDirection.buy ? targetMarket.tokenY.address : targetMarket.tokenX.address;
        return await PairWriteContract(this.sdk, market, 'claimEarning', [originToken, point]);
    }

    public async claimAllEarnings(market: string): Promise<ContractTransaction> {
        const targetMarket: ExchangeMarketType | undefined = this.markets.filter(e=>e.marketAddress=market)?.[0];
        if (!targetMarket) {
            throw new Error(TARGET_MARKET_NOT_FOUND);
        }

        return await PairWriteContract(this.sdk, market, 'claimAllEarnings');
    }

	public async getFinishedOrders(markets: string[], relativeFromInSec: number, relativeToInSec: number) {
		const fromBlock = await calcBlockHeight(relativeFromInSec, this.sdk.context.provider);
		const toBlock = await calcBlockHeight(relativeToInSec, this.sdk.context.provider);

		const allMarkets = await this.markets;
        const targetMarkets = allMarkets.filter(market=>markets.includes(market.marketAddress));

		const orders: ExchangeOrdersType = {};
		for (const market of targetMarkets) {
			const logs = await getMarketLog(
				this.sdk, market.marketAddress, fromBlock, toBlock, 'EarningClaimed(address,int24,uint128,address)',
				[undefined, undefined, undefined, this.sdk.context.walletAddress]
			);
			orders[market.marketAddress] = 
				logs.map(l=>{
					const targetToken: string = l.args['targetToken'];
					const direction = targetToken == market.tokenX.address 
						? OrderDirection.buy 
						: OrderDirection.sell;
					const decimal = targetToken == market.tokenX.address
						? market.tokenX.decimals
						: market.tokenY.decimals;
					return {
						direction,
						volume: toRealAmount(l.args['earning'], decimal),
						price: point2Price(l.args['point'])
					};
				});
		}

		return orders;
	}

	public async getMarketOrderHistory(markets: string[], relativeFromInSec: number, relativeToInSec: number) {
		const fromBlock = await calcBlockHeight(relativeFromInSec, this.sdk.context.provider);
		const toBlock = await calcBlockHeight(relativeToInSec, this.sdk.context.provider);

		const allMarkets = await this.markets;
        const targetMarkets = allMarkets.filter(market=>markets.includes(market.marketAddress));

		const orders: ExchangeOrdersType = {};
		for (const market of targetMarkets) {
			const logs = await getMarketLog(this.sdk, market.marketAddress, fromBlock, toBlock, 'Swapped(address,int24,uint128)');
			orders[market.marketAddress] = logs.map(l=>{
				const originToken: string = l.args['originToken'];
				const direction = originToken == market.tokenX.address 
					? OrderDirection.sell 
					: OrderDirection.buy;
				const decimal = market.tokenY.decimals
				return {
					direction,
					volume: toRealAmount(l.args['volume'], decimal),
					price: point2Price(l.args['point'])
				};
			});
		}

		return orders;
	}

    // Private methods

    private async _fetchMarketsAndTokens(marketName: string = "") {
        const pairs: ExchangePairsType[] = await ExchangeReadContracts(this.sdk, ['pairs'], [[marketName]]);

        if (!pairs) {
            return [];
        }

        const tokensSet = new Set<string>();
        for (const pair of pairs[0]) {
            tokensSet.add(pair.tokenX);
            tokensSet.add(pair.tokenY);
        }

        const tokenInfos: TokenInfoType[] = await ExchangeReadContracts(this.sdk, ['tokenInfo'], Array.from(tokensSet).map(e=>([e])));
        const tokens: TokenInfoTypeWithAddress[] = [];
        const tokensObj: Record<string, TokenInfoType> = {};
        const tokensList = Array.from(tokensSet);
        for (let i = 0; i < tokenInfos.length; i++) {
            const info = tokenInfos[i];
            const address = tokensList[i];
            tokensObj[address] = info;
            tokens.push({ ...info, address } as TokenInfoTypeWithAddress);
        }

        const markets: ExchangeMarketType[] = [];

        for (let i = 0; i < pairs[0].length; i++) {
            const pair = pairs[0][i];

            const tokenXInfo = { ...tokensObj[pair.tokenX], address: pair.tokenX } as TokenInfoTypeWithAddress;
            const tokenYInfo = { ...tokensObj[pair.tokenY], address: pair.tokenY } as TokenInfoTypeWithAddress;
            markets.push({
                marketAddress: pair.pair,
                displayName: `${tokenXInfo.symbol}/${tokenYInfo.symbol}`,
                tokenX: tokenXInfo,
                tokenY: tokenYInfo,
            });
        }

        this.markets = markets;
        this.tokens = tokens;
    }
}
