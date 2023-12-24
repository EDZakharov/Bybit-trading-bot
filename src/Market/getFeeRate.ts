import {
    CategoryCursorListV5,
    CategoryV5,
    FeeRateV5,
} from 'bybit-api/lib/types';
import restClient from '../restClient';

export const getFeeRate = async (
    symbol: string
): Promise<CategoryCursorListV5<FeeRateV5[], CategoryV5> | undefined> => {
    try {
        const { result } = await restClient.getFeeRate({
            category: 'spot',
            symbol,
            baseCoin: 'USDT',
        });

        if (!result.list) {
            console.error(`request failed: undefined coin - ${symbol}`);
            return;
        }
        return result;
    } catch (error) {
        console.error(`request failed: something went wrong ${error}`);
        return;
    }
};
