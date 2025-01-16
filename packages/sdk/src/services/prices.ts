import BitlySDK from '..';
import { TARGET_MARKET_NOT_FOUND } from '../common/errors';
import { getOffChainKline, updateOffChainKline } from '../queries/exchange';
import { KLINE_SOLUTION } from '../types/common';
import { ExchangeMarketType } from '../types/exchange';
import { CandleResult, PairPointType, PairStartOffType, PricesListener, PricesMap } from '../types/prices';
import { calcRealTime, getMarketLog, PairReadContracts, startInterval, toRealAmount } from '../utils';
import { calcBlockHeight, point2Price } from '../utils';

export default class PricesService {
	private sdk: BitlySDK;
	private ratesInterval?: ReturnType<typeof setInterval>;
	private onChainPrices: PricesMap = {}

	constructor(sdk: BitlySDK) {
		this.sdk = sdk;
	}

	public async startPriceUpdates(intervalTime: number) {
		// Poll the onchain prices
		if (!this.ratesInterval) {
			this.ratesInterval = startInterval(async () => {
				try {
					if (!this.sdk.exchange.getMarketsInfo([])) {
						return;
					}
					this.onChainPrices = await this.getPrices(this.sdk.exchange.getMarketsInfo([]).map(e=>e.marketAddress), 0);
					this.sdk.context.events.emit('prices_updated', {
						prices: this.onChainPrices,
					});
				} catch (err) {
					this.sdk.context.logError(err);
				}
			}, intervalTime);
		}
	}

	public onPricesUpdated(listener: PricesListener) {
		return this.sdk.context.events.on('prices_updated', listener);
	}

	public removePricesListener(listener: PricesListener) {
		return this.sdk.context.events.off('prices_updated', listener);
	}

	public removePricesListeners() {
		this.sdk.context.events.removeAllListeners('prices_updated');
	}

	public async getPrices(markets: string[], relativeTimeInSec: number): Promise<PricesMap> {
		const allMarkets = await this.sdk.exchange.getMarketsInfo([]);
        markets = markets.filter(market=>allMarkets?.map(e=>e.marketAddress).includes(market));

		const blockDeployed = await PairReadContracts(
			this.sdk,
			markets,
			['blockDeployed'],
			[[]]
		);
		const targetBlockHeight = await calcBlockHeight(relativeTimeInSec, this.sdk.context.provider);
		const marketInvovledList= [];
		for (let i = 0; i < markets.length; i++) {
			const market = markets[i];
			const block = blockDeployed[i];
			if (block <= targetBlockHeight) {
				marketInvovledList.push(market);
			}
		}

        const startOffs: PairStartOffType[] = await PairReadContracts(this.sdk, marketInvovledList, ['startOff'], [[]], {
            blockTag: targetBlockHeight
        });
        const points: PairPointType[] = await PairReadContracts(this.sdk, marketInvovledList, ['curPoint'], [[]], {
            blockTag: targetBlockHeight
        });

		const prices: Record<string, number> = {};
        for (let i = 0; i < marketInvovledList.length; i++) {
            const startOff = startOffs[i];
            const market = marketInvovledList[i];
            const point = points[i];
            const price = startOff ? point2Price(point) : 0;
            prices[market] = price;
        }

		return prices;
	}

    public async getKlines(markets: string[], resolution: KLINE_SOLUTION, relativeFromInSec: number,
        relativeToInSec: number
    ) {
        let klines = [];

        const allMarkets = await this.sdk.exchange.getMarketsInfo([]);
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
		return klines;
    }

	public async updateKline(market: string) {
		return updateOffChainKline(market);
	}

    // Private functions

    async getOnChainKline(
        market: ExchangeMarketType,
        resolution: string,
        step: number,
        relativeFromInSec: number,
        relativeToInSec: number,
    ): Promise<CandleResult[]> {
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
        const logs = await getMarketLog(this.sdk, market.marketAddress, fromBlock, toBlock, 'Swapped(address,int24,uint128,uint256)');

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

        let bar: CandleResult = {
            open: beginPrice,
            close: beginPrice,
            high: beginPrice,
            low: beginPrice,
            volume: 0,
            symbol: market.marketAddress,
            time: lastTime.toISOString()
        };

        for (let logBeginIndex = 0; lastTime.getTime() < toTime.getTime(); increase(lastTime)) {
            const breakTime = new Date(lastTime.getTime());
            increase(breakTime);

            for (; logBeginIndex < logs.length; logBeginIndex ++) {
                const log = logs[logBeginIndex];
                const eventTime = log.args.timestamp;
                if (eventTime > breakTime.getTime()) {
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
                symbol: market.marketAddress,
                time: lastTime.toISOString()
            };
        }
        return data;
    }
}
