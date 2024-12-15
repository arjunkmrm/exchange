import { BigNumber, ethers } from "ethers";
import { DEFAULT_DECIMAL } from "../constants";
import { CONTRACT_POINT_BASE_NUMBER } from "../constants/prices";

export function notNill<Value>(value: Value | null | undefined): value is Value {
	return !!value
}

export const RATES_ENDPOINTS: Record<number, number> = {
	17069: 2,
}

export const point2Price = (point: number) => {
    return Math.pow(CONTRACT_POINT_BASE_NUMBER, point);
};

export const price2Point = (price: number) => {
    return Number((Math.log(price) / Math.log(1.0001)).toFixed());
};

export const calcBlockHeight = async(relativeTime: number, provider: ethers.providers.Provider) => {
    if (relativeTime > 0) {
        relativeTime = 0;
    }
    const blockNumber = await provider.getBlockNumber();
    const networkId = (await (provider.getNetwork())).chainId;
    const rate = RATES_ENDPOINTS[networkId];
    const targetBlockNumber = blockNumber + relativeTime / rate;
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
    return BigNumber.from(realAmount).shl(decimal);
};

export const toRealAmount = (plainAmount: BigNumber, decimal: number = DEFAULT_DECIMAL) => {
    return plainAmount.shr(decimal).toNumber();
};