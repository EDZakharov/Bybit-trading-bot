import { OrderResultV5 } from 'bybit-api/lib/types/response/v5-trade.js';
import { APIResponseV3WithTime } from 'bybit-api/lib/types/shared.js';
import { getFeeRate } from '../Market/getFeeRate.js';
import { IPlaceOrder } from '../Types/types.js';
import { retry } from '../Utils/retry.js';
import { roundToPrecision } from '../Utils/roundToPrecision.js';
import { symbolChecker } from '../Utils/symbolChecker.js';
import restClient from '../restClient.js';
import { getInstrumentInfo } from './getInstrumentInfo.js';
import { getMinQty } from './getMinQty.js';
import { getOrdersHistoryById } from './getOrdersHistoryById.js';

export const placeOrder = async ({
    orderType,
    side,
    symbol,
    qty,
    price,
    orderId,
}: IPlaceOrder): Promise<APIResponseV3WithTime<OrderResultV5> | undefined> => {
    if (!symbolChecker(symbol)) {
        console.error(`request failed: undefined coin - ${symbol}`);
        return;
    }
    let data;
    try {
        const instr = await retry(getInstrumentInfo, symbol);
        if (!instr || !instr.result.list[0]) {
            console.error('request failed: something went wrong');
            return;
        }
        const result = instr.result.list[0];
        const { basePrecision, quotePrecision } = result.lotSizeFilter;
        const { tickSize } = result.priceFilter;

        price = roundToPrecision(+price, +tickSize);

        if (orderId && side === 'Sell') {
            const orderHistoryById = await retry(
                getOrdersHistoryById,
                result.baseCoin,
                orderId
            );
            const cumExecQty = orderHistoryById?.result.list[0]?.cumExecQty;
            const getFeeRateSymbol = await retry(getFeeRate, symbol);
            const calculatedTakerSymbolFee =
                +getFeeRateSymbol?.list[0].takerFeeRate * cumExecQty;
            const qtyWithFee = cumExecQty - calculatedTakerSymbolFee;
            qty =
                Math.floor(
                    qtyWithFee * Math.pow(10, +basePrecision.length - 2)
                ) / Math.pow(10, +basePrecision.length - 2);
        } else {
            qty =
                Math.floor(qty * Math.pow(10, +quotePrecision.length - 2)) /
                Math.pow(10, +quotePrecision.length - 2);
        }
        const instrumentMinQty = await retry(getMinQty, symbol);
        switch (orderType) {
            case 'Market': {
                console.log('CASES: ', +qty / price);
                if (+instrumentMinQty <= +qty / price) {
                    data = await restClient.submitOrder({
                        category: 'spot',
                        orderType,
                        side,
                        symbol,
                        qty: `${qty}`,
                        price: `${price}`,
                    });
                } else {
                    !instrumentMinQty
                        ? console.error(
                              `request failed: undefined coin - ${symbol}`
                          )
                        : console.error(
                              `request failed: you sent ${qty} qty, you should send >= ${instrumentMinQty} qty for success`
                          );
                }
                console.log(data);

                return data;
            }
            case 'Limit': {
                if (+instrumentMinQty <= +qty) {
                    data = await restClient.submitOrder({
                        category: 'spot',
                        orderType,
                        side,
                        symbol,
                        qty: `${qty}`,
                        price: `${price}`,
                    });
                } else {
                    !instrumentMinQty
                        ? console.error(
                              `request failed: undefined coin - ${symbol}`
                          )
                        : console.error(
                              `request failed: you sent ${qty} qty, you should send >= ${instrumentMinQty} qty for success`
                          );
                }
                console.log(data);

                return data;
            }
        }

        // console.log(instr.result.list[0]);
    } catch (error) {
        console.error('0request failed: ', error);
    }
    return data;
};
