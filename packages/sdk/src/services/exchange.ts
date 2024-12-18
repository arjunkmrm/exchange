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

export default class ExchangeService {
    private sdk: BitlySDK
    public markets: ExchangeMarketType[] = []
    private tokens: TokenInfoTypeWithAddress[] | undefined
    private marketName: string = ''

    constructor(sdk: BitlySDK) {
        this.sdk = sdk
    }

	public getMarketsInfo(markets: string[]) {
		return this.markets.filter(e=>markets.includes(e.marketAddress));
	}

    public async getMarkets(marketName: string = ''): Promise<ExchangeMarketType[]> {
        if (this.marketName == marketName && this.markets) {
            return this.markets;
        }

        await this._fetchMarketsAndTokens(marketName);
        this.marketName = marketName;
        return this.markets as unknown as ExchangeMarketType[];
    }

    public async getTokens(marketName: string = ''): Promise<TokenInfoTypeWithAddress[]> {
        if (this.marketName == marketName && this.tokens) {
            return this.tokens;
        }

        await this._fetchMarketsAndTokens(marketName);
        this.marketName = marketName;
        return this.tokens as unknown as TokenInfoTypeWithAddress[];
    }

    public async getDailyVolumes(markets: string[]): Promise<MarketsVolumes> {
        const allMarkets = await this.markets;
        markets = markets.filter(market=>allMarkets.map(e=>e.marketAddress).includes(market));

        const marketsVolume: PairTotalVolumeType[] = await PairReadContracts(this.sdk, markets, ['totalVolume']);
        const marketsVolumeYesterday: PairTotalVolumeType[] = await PairReadContracts(
            this.sdk, 
            markets, 
            ['totalVolume'], 
            [[]], 
            {blockTag: await calcBlockHeight(-PERIOD_IN_SECONDS.ONE_DAY, this.sdk.context.provider)}
        );

        const volumes24H: MarketsVolumes = {};
        for (let i = 0; i < marketsVolume.length; i++) {
            const market = markets[i];
            const volume = marketsVolume[i];
            const volumeYesterday = marketsVolumeYesterday[i];
            volumes24H[market] = volume.sub(volumeYesterday);
        }

        return volumes24H;
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
            const formattedOrderDetails: PairEarningsTypeWithOrderInfo[] = orderDetails.map((e, i)=>{
                const originToken = orderViewsPerMarket[i].originToken;
                const direction = originToken == targetMarkets[i].tokenY.address 
                    ? OrderDirection.buy 
                    : OrderDirection.sell;
                return {
                    direction,
                    earned: toRealAmount(e.earned),
                    sold: toRealAmount(e.sold),
                    selling: toRealAmount(e.selling),
                    ...orderViewsPerMarket[i]
                } as unknown as PairEarningsTypeWithOrderInfo;
            });
            earnings[market] = formattedOrderDetails;
        }
        return earnings;
    }

    public async placeLimitOrder(market: string, direction: OrderDirection, price: number, volume: number) {
        const targetMarket: ExchangeMarketType | undefined = this.markets.filter(e=>e.marketAddress=market)?.[0];

        const originToken = direction == OrderDirection.buy ? targetMarket.tokenY : targetMarket.tokenX;
        const point = price2Point(price);
        const amount = toPlainAmount(volume, originToken.decimals);
        const holder = DEFAULT_REFERRAL_ADDRESS;
        const referral = DEFAULT_REFERRAL_ADDRESS;

        return await PairWriteContract(this.sdk, market, 'limitOrder', [originToken, point, amount, holder, referral]);
    }

    public async placeMarketOrder(market: string, direction: OrderDirection, volume: number, curPrice: number, 
        slippage: number) 
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

    public async cancelLimitOrder(market: string, direction: OrderDirection, point: number) {
        const targetMarket: ExchangeMarketType | undefined = this.markets.filter(e=>e.marketAddress=market)?.[0];
        if (!targetMarket) {
            throw new Error(TARGET_MARKET_NOT_FOUND);
        }

        const originToken = direction == OrderDirection.buy ? targetMarket.tokenY : targetMarket.tokenX;
        return await PairWriteContract(this.sdk, market, 'cancelLimitOrder', [originToken, point]);
    }

    public async cancelAllLimitOrder(market: string) {
        const targetMarket: ExchangeMarketType | undefined = this.markets.filter(e=>e.marketAddress=market)?.[0];
        if (!targetMarket) {
            throw new Error(TARGET_MARKET_NOT_FOUND);
        }

        return await PairWriteContract(this.sdk, market, 'cancelAllLimitOrders', []);
    }

    public async claimEarning(market: string, direction: OrderDirection, point: number) {
        const targetMarket: ExchangeMarketType | undefined = this.markets.filter(e=>e.marketAddress=market)?.[0];
        if (!targetMarket) {
            throw new Error(TARGET_MARKET_NOT_FOUND);
        }

        const originToken = direction == OrderDirection.buy ? targetMarket.tokenY.address : targetMarket.tokenX.address;
        return await PairWriteContract(this.sdk, market, 'claimEarning', [originToken, point]);
    }

    public async claimAllEarnings(market: string) {
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
        const pairs: ExchangePairsType = await ExchangeReadContracts(this.sdk, ['pairs'], [[marketName]]);

        if (!pairs) {
            return [];
        }

        const tokensSet = new Set<string>();
        for (const pair of pairs) {
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

        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i];

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
