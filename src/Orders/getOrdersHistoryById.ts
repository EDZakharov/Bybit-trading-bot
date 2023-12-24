import { AccountOrderV5 } from 'bybit-api/lib/types/response/v5-trade.js';
import { APIResponseV3WithTime } from 'bybit-api/lib/types/shared.js';
import {
    CategoryCursorListV5,
    CategoryV5,
} from 'bybit-api/lib/types/v5-shared.js';
import restClient from '../restClient.js';

export const getOrdersHistoryById = async (
    symbol: string,
    orderId: string
): Promise<
    | APIResponseV3WithTime<CategoryCursorListV5<AccountOrderV5[], CategoryV5>>
    | undefined
> => {
    try {
        const result = await restClient.getHistoricOrders({
            category: 'spot',
            symbol,
            orderId,
        });
        return result;
    } catch (error) {
        console.error('request failed: ', error);
        return;
    }
};
