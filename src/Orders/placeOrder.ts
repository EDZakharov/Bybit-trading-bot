import { OrderResultV5 } from 'bybit-api/lib/types/response/v5-trade.js';
import { APIResponseV3WithTime } from 'bybit-api/lib/types/shared.js';
import { IPlaceOrder } from '../Types/types.js';
import { symbolChecker } from '../Utils/symbolChecker.js';
import restClient from '../restClient.js';
import { getMinQty } from './getMinQty.js';

export const placeOrder = async ({
    orderType,
    side,
    symbol,
    qty,
    price,
}: IPlaceOrder): Promise<APIResponseV3WithTime<OrderResultV5> | undefined> => {
    if (!symbolChecker(symbol)) {
        console.error(`request failed: undefined coin - ${symbol}`);
        return;
    }
    let data;
    try {
        const instrumentMinQty = await getMinQty(symbol);
        if (instrumentMinQty && +instrumentMinQty <= +qty) {
            data = await restClient.submitOrder({
                category: 'spot',
                orderType,
                side,
                symbol,
                qty: `${qty}`,
                price: `${price}`,
            });
            console.dir(data);
            // cancel order
            // await cancelOrder(symbol, data.result.orderId);
        } else {
            !instrumentMinQty
                ? console.error(`request failed: undefined coin - ${symbol}`)
                : console.error(
                      `request failed: you sent ${qty} qty, you should send >= ${instrumentMinQty} qty for success`
                  );
        }
    } catch (error) {
        console.error('request failed: ', error);
    }
    return data;
};
