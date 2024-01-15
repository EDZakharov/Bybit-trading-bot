import { OrderResultV5 } from 'bybit-api/lib/types/response/v5-trade.js';
import { symbolChecker } from '../Utils/symbolChecker.js';
import restClient from '../restClient.js';
// import { getActiveOrders } from './getActiveOrders.js';

export const cancelOrder = async (
    symbol: string,
    orderId: string
): Promise<OrderResultV5 | undefined> => {
    if (!symbolChecker(symbol) || symbol.length === 0) {
        console.error(`request failed: undefined coin - ${symbol}`);
        return;
    }

    if (orderId && orderId.length === 0) {
        console.error(
            `request failed: wrong orderId length - ${orderId.length}`
        );
        return;
    }

    try {
        // const activeOrders = await getActiveOrders(symbol);
        // const activeOrderId = activeOrders?.list.find(
        //     (order) => order.orderId === orderId
        // );

        // if (!activeOrderId) {
        //     console.error(`request failed: order with id ${orderId} not found`);
        //     return;
        // }

        const { result } = await restClient.cancelOrder({
            category: 'spot',
            symbol,
            orderId,
        });
        return result;
    } catch (error) {
        console.error(
            `cancelOrder: request failed: something went wrong ${error}`
        );
        return;
    }
};
