import { OrderResultV5 } from 'bybit-api/lib/types/response/v5-trade.js';
import { APIResponseV3WithTime } from 'bybit-api/lib/types/shared.js';
import consola from 'consola';
import { getBalance } from '../Account/getBalance.js';
import { getFeeRate } from '../Market/getFeeRate.js';
import { IPlaceOrder } from '../Types/types.js';
import { retry } from '../Utils/retry.js';
import { roundToPrecision } from '../Utils/roundToPrecision.js';
import { symbolChecker } from '../Utils/symbolChecker.js';
import { getInstrumentInfo } from './getInstrumentInfo.js';
import { getMinQty } from './getMinQty.js';
import { getOrdersHistoryById } from './getOrdersHistoryById.js';

export const placeOrder = async ({
    side,
    symbol,
    qty,
    price,
    orderId,
}: IPlaceOrder): Promise<APIResponseV3WithTime<OrderResultV5> | undefined> => {
    if (!symbolChecker(symbol)) {
        consola.error({
            message: `request failed: undefined coin - ${symbol}`,
            badge: true,
        });
        return;
    }
    let data;
    try {
        const instr = await retry(getInstrumentInfo, symbol);
        if (!instr || !instr.result.list[0]) {
            consola.error({
                message: 'request failed: something went wrong',
                badge: true,
            });
            return;
        }
        const result = instr.result.list[0];
        const { basePrecision, quotePrecision } = result.lotSizeFilter;
        const { tickSize } = result.priceFilter;
        price = roundToPrecision(+price, +tickSize);
        const instrumentMinQty = await retry(getMinQty, symbol);
        const rSymbol = symbol.replace(/USDT$/m, '');
        const balance = await retry(getBalance, rSymbol);

        if (orderId.length !== 0 && side === 'Sell') {
            await retry(getOrdersHistoryById, symbol, orderId);
            const getFeeRateSymbol = await retry(getFeeRate, symbol);
            const walletBalance = +balance.result.balance.walletBalance;
            let calculatedTakerSymbolFee =
                +getFeeRateSymbol.list[0].takerFeeRate * qty;
            let calculatedMakerSymbolFee =
                +getFeeRateSymbol.list[0].makerFeeRate * qty;
            qty = qty - (calculatedTakerSymbolFee + calculatedMakerSymbolFee);

            if (walletBalance <= qty) {
                qty = walletBalance - Number.EPSILON;
                console.log('EPSILON: ', qty);
            }
            qty = calculateQty(qty, basePrecision);
            if (+instrumentMinQty <= qty) {
                // data = await restClient.submitOrder({
                //     category: 'spot',
                //     orderType: 'Limit',
                //     side,
                //     symbol,
                //     qty: `${qty}`,
                //     price: `${price}`,
                // });
                // console.log(data);
                // return data;

                // TEST

                return {
                    //@ts-ignore
                    result: {
                        orderId: '123',
                    },
                };
            } else {
                showError(instrumentMinQty, symbol, qty);
                return;
            }
        } else if (orderId.length === 0 && side === 'Buy') {
            qty = calculateQty(qty, quotePrecision);
            if (+instrumentMinQty <= +qty / price) {
                // data = await restClient.submitOrder({
                //     category: 'spot',
                //     orderType: 'Market',
                //     side,
                //     symbol,
                //     qty: `${qty}`,
                // });
                // console.log(data);
                // return data;

                // TEST
                return {
                    //@ts-ignore
                    result: {
                        orderId: '123',
                    },
                };
            } else {
                showError(instrumentMinQty, symbol, qty);
                return;
            }
        }
    } catch (error) {
        consola.error({
            message: `request failed: ${error}`,
            badge: true,
        });
    }
    return data;
};

function showError(
    instrumentMinQty: number,
    symbol: string,
    qty: number
): void {
    return !instrumentMinQty
        ? consola.error({
              message: `request failed: undefined coin - ${symbol}`,
              badge: true,
          })
        : consola.error({
              message: `request failed: you sent ${qty} qty, you should send >= ${instrumentMinQty} qty for success`,
              badge: true,
          });
}

function calculateQty(qty: number, precision: string) {
    return (
        Math.floor(qty * Math.pow(10, +precision.length - 2)) /
        Math.pow(10, +precision.length - 2)
    );
}
