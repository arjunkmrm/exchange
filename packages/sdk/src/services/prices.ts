import { BlockTag } from '@ethersproject/providers';
import { ethers } from 'ethers';
import BitlySDK from '..';
import { TARGET_MARKET_NOT_FOUND } from '../common/errors';
import { getPairContract, getPairContractInterface } from '../contracts';
import { getOffChainKline } from '../queries/exchange';
import { KLINE_SOLUTION } from '../types/common';
import { ExchangeMarketType, MarketEventSignature } from '../types/exchange';
import { PairPointType, PairStartOffType } from '../types/prices';
import { calcRealTime, PairReadContracts, toRealAmount } from '../utils';
import { calcBlockHeight, point2Price } from '../utils';

export default class PricesService {
	private sdk: BitlySDK

	constructor(sdk: BitlySDK) {
		this.sdk = sdk
	}

	public async getPrices(markets: string[], relativeTimeInSec: number): Promise<Record<string, number>> {
		const allMarkets = await this.sdk.exchange.markets;
        markets = markets.filter(market=>allMarkets?.map(e=>e.marketAddress).includes(market));

        const startOffs: PairStartOffType[] = await PairReadContracts(this.sdk, markets, ['startOff'], [[]], {
            blockTag: await calcBlockHeight(relativeTimeInSec, this.sdk.context.provider)
        });
        const points: PairPointType[] = await PairReadContracts(this.sdk, markets, ['curPoint'], [[]], {
            blockTag: await calcBlockHeight(relativeTimeInSec, this.sdk.context.provider)
        });

		const prices: Record<string, number> = {};
        for (let i = 0; i < markets.length; i++) {
            const startOff = startOffs[i];
            const market = markets[i];
            const point = points[i];
            const price = startOff ? point2Price(point) : 0;
            prices[market] = price;
        }

		return prices;
	}

    public async getKlines(markets: string[], resolution: KLINE_SOLUTION, relativeFromInSec: number,
        relativeToInSec: number
    ) {
        let klines: any[] = [];

        const allMarkets = await this.sdk.exchange.markets;
        const targetMarkets = allMarkets?.filter(market=>markets.includes(market.marketAddress));

        if (!targetMarkets) {
            throw new Error(TARGET_MARKET_NOT_FOUND);
        }

        try {
            for (const market of targetMarkets) {
                klines.push(await getOffChainKline(
                    this.sdk, market.marketAddress, resolution, relativeFromInSec, relativeToInSec
                ));
            }
        } catch (e) {
            for (const market of targetMarkets) {
                const [step, unit] = resolution;
                klines.push(await this.getOnChainKline(
                    market, unit, Number(step), relativeFromInSec, relativeToInSec
                ));
            }
        }
    }

    // Private functions

    async getOnChainKline(
        market: ExchangeMarketType,
        resolution: string,
        step: number,
        relativeFromInSec: number,
        relativeToInSec: number,
    ) {
        const decimal = market.tokenX.decimals;
        const data = [];

        const fromBlock = await calcBlockHeight(relativeFromInSec, this.sdk.context.provider);
        const toBlock = await calcBlockHeight(relativeToInSec, this.sdk.context.provider);
        
        const fromTime = await calcRealTime(fromBlock, this.sdk.context.provider);
        const toTime = await calcRealTime(toBlock, this.sdk.context.provider);
        const lastTime = fromTime;

        if (toBlock <= 1) {
            return [];
        }

        let beginPrice = (await this.getPrices([market.marketAddress], relativeFromInSec))?.[market.marketAddress];
        let endPrice = (await this.getPrices([market.marketAddress], relativeToInSec))?.[market.marketAddress];
        if (endPrice == 0) {
            return [];
        }
        const logs = await this.getMarketLog(market.marketAddress, fromBlock, toBlock, 'Swapped(address,int24,uint128)');

        const increase = (curTime: Date) => {
            switch (resolution) {
                case "S":
                    curTime.setSeconds(curTime.getSeconds()+step);
                    break;
                case "M":
                    curTime.setMinutes(curTime.getMinutes()+step);
                    break;
                case "H":
                    curTime.setHours(curTime.getHours()+step);
                    break;
                default:
                    curTime.setDate(curTime.getDate()+step);
            }
        };

        let bar = {
            open: beginPrice,
            close: beginPrice,
            high: beginPrice,
            low: beginPrice,
            volume: 0,
            symbol: market,
            time: lastTime.toISOString()
        };

        for (let logBeginIndex = 0; lastTime.getTime() < toTime.getTime(); increase(lastTime)) {
            const breakTime = new Date(lastTime.getTime());
            increase(breakTime);

            for (; logBeginIndex < logs.length; logBeginIndex ++) {
                const log = logs[logBeginIndex];
                const eventTime = await calcRealTime(log.blockNumber, this.sdk.context.provider);
                if (eventTime.getTime() > breakTime.getTime()) {
                    break;
                }
                
                bar.volume += toRealAmount(log.args.amount.toString(), decimal);
                const curPrice = point2Price(log.args.point);
                bar.close = curPrice;
                bar.high = curPrice > bar.high ? curPrice : bar.high;
                bar.low = curPrice < bar.low ? curPrice : bar.low;
            }

            bar.time = breakTime.toISOString();
            if (bar.close !== 0 || bar.open !== 0) {
                data.push(bar);
            }
            beginPrice = bar.close;

            bar = {
                open: beginPrice,
                close: beginPrice,
                high: beginPrice,
                low: beginPrice,
                volume: 0,
                symbol: market,
                time: lastTime.toISOString()
            };
        }
        return data;
    }

    async getMarketLog(market: string, fromBlock: BlockTag, toBlock: BlockTag, event: MarketEventSignature, 
        args: any[] = []
    ) {
        const filters = getPairContract(market, this.sdk.context.provider).filters[event](...args);
        const logs = await this.sdk.context.provider.getLogs({
            ...filters,
            fromBlock,
            toBlock
        });

        const iface = getPairContractInterface();
        const parsedLogs = logs.map(log=>{
            return {
                ... iface.parseLog(log),
                ...log,
            }
        });

        return parsedLogs;
    }

}
