import BitlySDK from "..";
import get from 'axios';
import { KLINE_SOLUTION } from "../types/common";
import { calcBlockHeight } from "../utils";
import { API_RESPONSE_ERROR, AXIOS_GET_ERROR, RESOLUTION_FORMAT_ERROR } from "../common/errors";
import { BITLY_API_URL } from "../constants";

export const getOffChainKline = async (
	sdk: BitlySDK,
	market: string,
    resolution: KLINE_SOLUTION,
    relativeFromInSec: number,
    relativeToInSec: number,
) => {
    if (resolution.length !== 2) {
        throw new Error(RESOLUTION_FORMAT_ERROR);
    }

    const [step, unit] = resolution;
	const fromBlock = await calcBlockHeight(relativeFromInSec, sdk.context.provider);
    const toBlock = await calcBlockHeight(relativeToInSec, sdk.context.provider);

    const bars = await get(
        BITLY_API_URL+`/api/getChart?pair=${market}&from=${fromBlock}&to=${toBlock}&resolution=${unit}&step=${step}`
    );

    if (bars.status !== 200) {
        throw new Error(`${AXIOS_GET_ERROR}: ${bars.status}`);
    }
    const resp = bars.data;
    if (resp['err_code'] !== 'SUCCESS') {
        throw new Error(`${API_RESPONSE_ERROR}: ${resp['err_code']}`);
    }
    
    return resp['data'];
}