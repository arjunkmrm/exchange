import * as ethers from "ethers";
import BigNumber from 'bignumber.js';
import { DEFAULT_DECIMAL, RATES_ENDPOINTS } from "../constants";
import { CONTRACT_POINT_BASE_NUMBER } from "../constants/prices";

BigNumber.config({ DECIMAL_PLACES: 10, EXPONENTIAL_AT: 50 });

export function notNill<Value>(value: Value | null | undefined): value is Value {
	return !!value
}

export const point2Price = (point: number) => {
    return Math.pow(CONTRACT_POINT_BASE_NUMBER, point);
};

export const price2Point = (price: number, margin: number = 1) => {
    const pt = Number((Math.log(price) / Math.log(1.0001)).toFixed());
	return Math.floor(pt / margin) * margin;
};

export const calcBlockHeight = async(relativeTime: number, provider: ethers.providers.Provider) => {
    if (relativeTime > 0) {
        relativeTime = 0;
    }
    const blockNumber = await provider.getBlockNumber();
    const networkId = (await (provider.getNetwork())).chainId;
    const rate = RATES_ENDPOINTS[networkId.toString()];
    const targetBlockNumber = Math.floor(blockNumber + relativeTime / rate);
    return targetBlockNumber >= 1 ? targetBlockNumber : 1;
};

export const calcRealTime = async (blockHeight: number, provider: ethers.providers.Provider) => {
    const networkId = (await (provider.getNetwork())).chainId;
    const blockNumber = await provider.getBlockNumber();
    const rate = RATES_ENDPOINTS[networkId];

    const relativeTime = (blockHeight - blockNumber) * rate;
    const now = new Date();
    const ret = new Date(now.setSeconds(now.getSeconds() + relativeTime));
    return ret;
};

export const toPlainAmount = (realAmount: number, decimal: number = DEFAULT_DECIMAL) => {
	return ethers.BigNumber.from(BigNumber(realAmount).shiftedBy(decimal).toString());
};

export const toRealAmount = (plainAmount: ethers.BigNumber, decimal: number = DEFAULT_DECIMAL) => {
    // return plainAmount.div(ethers.BigNumber.from(10).pow(decimal)).toNumber();
	return BigNumber(plainAmount.toString()).shiftedBy(-decimal).toNumber();
};
