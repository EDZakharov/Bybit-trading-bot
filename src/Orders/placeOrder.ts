import { IPlaceOrder } from '../Types/types.js';
import { symbolChecker } from '../Utils/symbolChecker.js';
import restClient from '../restClient.js';
import { cancelOrder } from './cancelOrder.js';
import { getMinQty } from './getMinQty.js';

export const placeOrder = async ({ side, symbol, qty, price }: IPlaceOrder) => {
    if (!symbolChecker(symbol)) {
        console.error(`request failed: undefined coin - ${symbol}`);
        return;
    }
    try {
        const instrumentMinQty = await getMinQty(symbol);
        if (instrumentMinQty && +instrumentMinQty <= +qty) {
            const data = await restClient.submitOrder({
                category: 'spot',
                orderType: 'Limit',
                side,
                symbol,
                qty: `${qty}`,
                price: `${price}`,
            });
            console.dir(data);
            // cancel order
            await cancelOrder(symbol, data.result.orderId);
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
};
