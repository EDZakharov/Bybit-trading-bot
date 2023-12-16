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
 *
 * */

import { getTickers } from '../Market/getTickers.js';
import { getMinQty } from '../Orders/getMinQty.js';

interface IBuyOrdersStepsToGrid {
    symbol?: string;
    step: number;
    orderDeviation: number;
    orderBasePairVolume: number;
    orderSecondaryPairVolume: number;
    orderPriceToStep: number;
    orderAveragePrice: number;
    orderTargetPrice: number;
    orderTargetDeviation: number;
    summarizedOrderBasePairVolume: number;
    summarizedOrderSecondaryPairVolume: number;
}

interface IBotOptions {
    targetProfit: number;
    insuranceOrderSteps: number;
    insuranceOrderPriceDeviation: number;
    startOrderVolume: number;
    insuranceOrderStepsMultiplier: number;
    insuranceOrderVolume: number;
    insuranceOrderVolumeMultiplier: number;
}

export const DCA = ({
    targetProfit,
    insuranceOrderSteps,
    insuranceOrderStepsMultiplier,
    insuranceOrderPriceDeviation,
    startOrderVolume,
    insuranceOrderVolume,
    insuranceOrderVolumeMultiplier,
}: IBotOptions): Function => {
    const buyOrdersStepsToGrid: IBuyOrdersStepsToGrid[] = [];
    return async function (
        symbol: string
    ): Promise<IBuyOrdersStepsToGrid[] | undefined> {
        const minQty = await getMinQty(symbol);
        const tickerInfo = await getTickers(symbol);
        let tickerPrice: string;
        if (!tickerInfo || !tickerInfo.list[0]) {
            console.error(`request failed: undefined coin info - ${symbol}`);
            return;
        } else {
            tickerPrice = tickerInfo.list[0].lastPrice;
        }

        if (!minQty) {
            console.error(`request failed: bad minQty of ${symbol}`);
            return;
        }

        if (startOrderVolume && startOrderVolume <= +minQty) {
            console.error(
                `request failed: starting order ${startOrderVolume}, min qty ${minQty}`
            );
            return;
        }
        if (!insuranceOrderPriceDeviation) {
            console.error(`request failed: undefined price deviation`);
            return;
        }

        let orderBasePairVolume = startOrderVolume;
        let orderSecondaryPairVolume = parseFloat(
            (orderBasePairVolume / +tickerPrice).toFixed(8)
        );
        let orderDeviation = 0;
        let orderPriceToStep = +tickerPrice;

        // let orderTargetDeviation = calculateOrderTargetDeviationToStep(
        //     targetProfit,
        //     orderDeviation,
        //     insuranceOrderStepsMultiplier,
        //     insuranceOrderPriceDeviation,
        //     insuranceOrderVolumeMultiplier
        // );
        let summarizedOrderBasePairVolume =
            calculateSummarizedPairVolumeToStep();
        let calculatedSummarizedPairVolumeToStep =
            calculateSummarizedPairVolumeToStep();
        // let summarizedOrderSecondaryPairVolumeToFirstStep =
        //     calculateSummarizedPairVolumeToStep()(orderSecondaryPairVolume);
        const orderAveragePriceToStep = calculateAveragePriceToStep(0, 0);
        let orderAveragePrice = orderAveragePriceToStep({
            orderPriceToStep,
            orderSecondaryPairVolume,
            summarizedOrderSecondaryPairVolume: orderSecondaryPairVolume,
        });

        let orderTargetPrice = calculateOrderTargetPriceToStep(
            orderAveragePrice,
            targetProfit
            // orderPriceToStep,
            // orderTargetDeviation
            // insuranceOrderStepsMultiplier
        );
        let orderTargetDeviation = calculateOrderTargetDeviationToStep(
            orderPriceToStep,
            orderTargetPrice
        );
        let summarizedOrderSecondaryPairVolume =
            calculatedSummarizedPairVolumeToStep(orderSecondaryPairVolume);

        /**
         * ________________________________________________
         * PLACE STEP = 0
         * ________________________________________________
         * */
        buyOrdersStepsToGrid.push({
            step: 0,
            orderDeviation,
            orderSecondaryPairVolume,
            orderBasePairVolume,
            orderPriceToStep,
            orderAveragePrice,
            orderTargetPrice,
            orderTargetDeviation, //TODO
            summarizedOrderSecondaryPairVolume,
            summarizedOrderBasePairVolume:
                summarizedOrderBasePairVolume(orderBasePairVolume),
        });

        /**
         * ________________________________________________
         * PLACE STEPS > 0
         * ________________________________________________
         * */
        for (let step = 1; step <= insuranceOrderSteps; step++) {
            orderDeviation = calculateOrderDeviationToStep(
                orderDeviation,
                insuranceOrderPriceDeviation,
                insuranceOrderStepsMultiplier
            );

            if (orderDeviation > 100) {
                console.error('order deviation > 100 %');
                return buyOrdersStepsToGrid;
            }

            orderBasePairVolume = calculateOrderVolumeToStep(
                step,
                orderBasePairVolume,
                insuranceOrderVolume,
                insuranceOrderVolumeMultiplier
            );

            orderPriceToStep = calculateOrderPriceToStep(
                +tickerPrice,
                orderDeviation
            );

            orderSecondaryPairVolume = parseFloat(
                (orderBasePairVolume / orderPriceToStep).toFixed(8)
            );

            summarizedOrderSecondaryPairVolume =
                calculatedSummarizedPairVolumeToStep(orderSecondaryPairVolume);

            orderAveragePrice = orderAveragePriceToStep({
                orderPriceToStep,
                orderSecondaryPairVolume,
                summarizedOrderSecondaryPairVolume,
            });
            orderTargetPrice = calculateOrderTargetPriceToStep(
                orderAveragePrice,
                targetProfit
            );
            orderTargetDeviation = calculateOrderTargetDeviationToStep(
                orderPriceToStep,
                orderTargetPrice
            );

            buyOrdersStepsToGrid.push({
                step,
                orderDeviation: +orderDeviation.toFixed(8),
                orderSecondaryPairVolume,
                orderBasePairVolume: +orderBasePairVolume.toFixed(8),
                orderPriceToStep,
                orderAveragePrice,
                orderTargetPrice,
                orderTargetDeviation,
                summarizedOrderSecondaryPairVolume,
                summarizedOrderBasePairVolume:
                    summarizedOrderBasePairVolume(orderBasePairVolume),
            });
        }
        return buyOrdersStepsToGrid;
    };
};

/**
 * ________________________________________________
 * CALCULATE FUNCTIONS
 * ________________________________________________
 * */

function calculateOrderDeviationToStep(
    orderDeviation: number,
    insuranceOrderPriceDeviation: number,
    insuranceOrderStepsMultiplier: number
): number {
    return orderDeviation !== 0
        ? (orderDeviation =
              insuranceOrderPriceDeviation +
              orderDeviation * insuranceOrderStepsMultiplier)
        : (orderDeviation = insuranceOrderPriceDeviation);
}

function calculateOrderVolumeToStep(
    step: number,
    orderVolume: number,
    insuranceOrderVolume: number,
    insuranceOrderVolumeMultiplier: number
): number {
    return orderVolume === insuranceOrderVolume
        ? step === 1
            ? (orderVolume = insuranceOrderVolume)
            : (orderVolume = orderVolume * insuranceOrderVolumeMultiplier)
        : step !== 1
        ? (orderVolume = orderVolume * insuranceOrderVolumeMultiplier)
        : (orderVolume = insuranceOrderVolume);
}

function calculateOrderPriceToStep(
    tickerPrice: number,
    orderDeviation: number
): number {
    return parseFloat(
        (tickerPrice - (+tickerPrice / 100) * orderDeviation).toFixed(8)
    );
}

interface IWeightedSum {
    orderPriceToStep: number; //orderPriceToStep
    orderSecondaryPairVolume: number; // orderSecondaryPairVolume
    summarizedOrderSecondaryPairVolume: number; //summarizedOrderSecondaryPairVolume
}

function calculateAveragePriceToStep(
    prevPrice: number,
    prevVolume: number
): Function {
    let orderPricesToStep: Array<number> = [];
    let orderSecondaryPairVolumesToStep: Array<number> = [];
    prevPrice && orderPricesToStep.push(prevPrice);
    prevVolume && orderSecondaryPairVolumesToStep.push(prevVolume);
    let weightedSum;
    return function ({
        orderPriceToStep,
        orderSecondaryPairVolume,
        summarizedOrderSecondaryPairVolume,
    }: IWeightedSum): number {
        orderPricesToStep.push(orderPriceToStep);
        orderSecondaryPairVolumesToStep.push(orderSecondaryPairVolume);
        weightedSum = orderSecondaryPairVolumesToStep.reduce(
            (prev: number, curr: number, index: number): number => {
                // @ts-ignore
                return prev + curr * orderPricesToStep[index];
            },
            0
        );

        const averagePrice = weightedSum / summarizedOrderSecondaryPairVolume;
        return parseFloat(averagePrice.toFixed(8));
    };
}

function calculateOrderTargetPriceToStep(
    orderAveragePrice: number,
    targetProfit: number
): number {
    console.table({
        orderAveragePrice,
        targetProfit,
    });
    const calculate =
        orderAveragePrice + (orderAveragePrice + targetProfit * 0.01) / 100;

    return parseFloat(calculate.toFixed(8));
}

function calculateOrderTargetDeviationToStep(
    orderPriceToStep: number,
    orderTargetPrice: number
): number {
    // OLS in regression analysis (data approximation)???????????????
    const calculate =
        ((orderTargetPrice - orderPriceToStep) / orderPriceToStep) * 100;
    return parseFloat(calculate.toFixed(8));
}

function calculateSummarizedPairVolumeToStep(): Function {
    let summ = 0;
    return (pairVolume: number): number => {
        summ = summ + pairVolume;
        return parseFloat(summ.toFixed(8));
    };
}
