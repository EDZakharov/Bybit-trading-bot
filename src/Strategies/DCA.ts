/** Sequencing
 * using strategies - long
 *
 * set target profit or minimum profit - %
 * select deals conditions - immediately | rsi | other
 * set volume of start order - number
 * set volume of insurance order - number
 * set maximum number of insurance orders - number
 * select type of insurance orders - market | limit
 * set price deviation - % of the cost of the initial order
 * set safety order volume multiplier - number
 * set safety order step multiplier - number
 * create a grid for calculating the amount of additional funds for each step
 *
 * start market order
 *
 * ______________________________
 * >>>>> It works like this <<<<<
 * ______________________________
 * Let's say you set the minimum return at 1%.
 * Thus: If the price has not reached this level of profitability, and the
 * selected closing condition signals the closure of the transaction, it will
 * not be closed!
 *
 * If the price overcomes the minimum profit level and the condition for
 * closing the transaction is met to close the transaction, it will be closed!
 *
 * If the price exceeds the minimum profit level and then falls below this
 * level again, the transaction will return to the original standby mode.
 * Thus, if the price falls below the minimum yield again and the trade exit
 * condition is met, the trade will not be closed.
 *
 * ________________________________________________
 * >>>>> Calculation of minimum profitability <<<<<
 * ________________________________________________
 * As a percentage of the base order - the bot will calculate the minimum TP
 * level, taking into account only the size of the base order, regardless of
 * how many safety orders are filled.
 * Thus, if the base order size is $100 and the minimum profit is set to 5%
 * then the TP level will produce a profit of $5 regardless of how many safety
 * orders are filled.
 *
 * As a percentage of the final volume - the bot will calculate the minimum TP
 * level taking into account the size of the entire transaction, and not just
 * the size of the base order.
 * Thus, if the Minimum Profit is set to 5%, the base order size is $100, and
 * 3 safety orders are executed for a total of $900, then the total trade size
 * becomes $1000. And in this case the TP level will be set to $50, not $5.
 *
 * */

import { getMinQty } from '../Orders/getMinQty.js';

interface IBuyOrdersStepsToGrid {
    symbol?: string;
    step: number;
    orderDeviation: number;
    orderVolume: number;
}

type botOptions = {
    insuranceOrderSteps: number;
    insuranceOrderPriceDeviation: number;
    startOrderVolume: number;
    insuranceOrderStepsMultiplier: number;
    insuranceOrderVolume: number;
    insuranceOrderVolumeMultiplier: number;
};

export const DCA = ({
    insuranceOrderSteps,
    insuranceOrderStepsMultiplier,
    insuranceOrderPriceDeviation,
    startOrderVolume,
    insuranceOrderVolume,
    insuranceOrderVolumeMultiplier,
}: botOptions): Function => {
    const buyOrdersStepsToGrid: IBuyOrdersStepsToGrid[] = [];

    return async function (
        symbol: string
    ): Promise<IBuyOrdersStepsToGrid[] | undefined> {
        if (!insuranceOrderPriceDeviation) {
            console.error(`request failed: undefined price deviation`);
            return;
        }

        const minQty = await getMinQty(symbol);

        if (!minQty) {
            console.error(`request failed: bad minQty of ${symbol}`);
            return;
        }

        if (startOrderVolume && startOrderVolume <= +minQty) {
            console.dir(
                `request failed: starting order ${startOrderVolume}, min qty ${minQty}`
            );
            return;
        }

        let orderVolume = startOrderVolume;
        let orderDeviation = 0;

        // place step 0
        buyOrdersStepsToGrid.push({
            step: 0,
            orderDeviation,
            orderVolume,
        });

        for (let step = 1; step <= insuranceOrderSteps; step++) {
            orderDeviation !== 0
                ? (orderDeviation =
                      insuranceOrderPriceDeviation +
                      orderDeviation * insuranceOrderStepsMultiplier)
                : (orderDeviation = insuranceOrderPriceDeviation);

            if (orderDeviation > 100) {
                console.error('order deviation > 100 %');
                return buyOrdersStepsToGrid;
            }

            orderVolume === insuranceOrderVolume
                ? step === 1
                    ? (orderVolume = insuranceOrderVolume)
                    : (orderVolume =
                          orderVolume * insuranceOrderVolumeMultiplier)
                : step !== 1
                ? (orderVolume = orderVolume * insuranceOrderVolumeMultiplier)
                : (orderVolume = insuranceOrderVolume);

            buyOrdersStepsToGrid.push({
                step,
                orderDeviation: +orderDeviation.toFixed(8),
                orderVolume: +orderVolume.toFixed(8),
            });
        }

        return buyOrdersStepsToGrid;
    };
};
