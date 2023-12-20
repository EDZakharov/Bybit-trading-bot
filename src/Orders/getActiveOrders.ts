import { AccountOrderV5 } from 'bybit-api/lib/types/response/v5-trade.js';
import {
    CategoryCursorListV5,
    CategoryV5,
} from 'bybit-api/lib/types/v5-shared.js';
import restClient from '../restClient.js';

export const getActiveOrders = async (
    symbol?: string
): Promise<CategoryCursorListV5<AccountOrderV5[], CategoryV5> | undefined> => {
    try {
        const { result } = await restClient.getActiveOrders({
            category: 'spot',
            symbol,
        });
        return result;
    } catch (error) {
        console.error('3request failed: ', error);
        return;
    }
};
