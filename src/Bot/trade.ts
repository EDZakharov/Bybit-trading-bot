import { getBalance } from '../Account/getBalance.js';
import { getTickers } from '../Market/getTickers.js';
import { cancelOrder } from '../Orders/cancelOrder.js';
import { placeOrder } from '../Orders/placeOrder.js';
import { IBuyOrdersStepsToGrid } from '../Types/types.js';
import { editBotConfig } from './botConfig.js';
import { getBotStrategy } from './getBotStrategy.js';

export async function trade(coin: string): Promise<void> {
    let strategy = await getBotStrategy(coin);
    if (!strategy || strategy.length === 0) return;

    let order: IBuyOrdersStepsToGrid;
    // let currentStep: number;
    let orderId: string = '';
    let currentPrice: number = 0;
    let onPosition: boolean = false;
    let profit: number = 0;
    let finish: boolean = false;
    await sleep(1000);
    START_TRADE: for (order of strategy) {
        if (finish) return;

        const allStepsCount = editBotConfig.getInsuranceOrderSteps();
        const orders: Array<IBuyOrdersStepsToGrid> = [...strategy];
        const allOrdersPriceToStep = orders.map((el) => el.orderPriceToStep);
        let nextInsurancePriceToStep = allOrdersPriceToStep[order.step + 1];
        const balanceUSDT = await getBalance('USDT');
        const summarizedOrderBasePairVolume = orders.find(
            (order: IBuyOrdersStepsToGrid) => order.step === allStepsCount
        )?.summarizedOrderBasePairVolume;
        const orderSecondaryPairVolume = order.orderSecondaryPairVolume;
        const summarizedOrderSecondaryPairVolume =
            order.summarizedOrderSecondaryPairVolume;
        const orderTargetPrice = order.orderTargetPrice;
        const orderPriceToStep = order.orderPriceToStep;

        if (!nextInsurancePriceToStep) {
            console.log('all insurance orders was executed');
            nextInsurancePriceToStep = currentPrice / 100;
        }
        if (
            !summarizedOrderSecondaryPairVolume ||
            !orderSecondaryPairVolume ||
            !orderTargetPrice ||
            !summarizedOrderBasePairVolume ||
            !balanceUSDT ||
            +balanceUSDT < summarizedOrderBasePairVolume
        ) {
            console.error(`request failed: something went wrong1`);
            return;
        }

        EXECUTE_STEP: do {
            const price = await getTickers('KASUSDT');
            //UNDEFINED?

            if (!price || !price.list[0]) {
                //retry
                //continue
                return;
            }

            currentPrice = +price.list[0].lastPrice;

            // PLACE LIMIT ORDER & TP ORDER
            if (!onPosition) {
                onPosition = true;
                console.table({
                    position: 'buy',
                    price: currentPrice,
                    profitTarget: orderTargetPrice,
                    nextStep: nextInsurancePriceToStep,
                });

                await placeOrder({
                    orderType: 'Limit',
                    side: 'Buy',
                    symbol: 'KASUSDT',
                    qty: Math.ceil(orderSecondaryPairVolume),
                    price: parseFloat(orderTargetPrice.toFixed(5)), //???
                });
                console.log(
                    `placeOrder Buy Market ${Math.floor(
                        orderSecondaryPairVolume
                    )} KASUSDT - ${orderPriceToStep.toFixed(5)}`
                );

                const takeProfitOrder = await placeOrder({
                    orderType: 'Limit',
                    side: 'Sell',
                    symbol: 'KASUSDT',
                    qty: Math.floor(summarizedOrderSecondaryPairVolume),
                    price: parseFloat(orderTargetPrice.toFixed(5)),
                });
                console.log(
                    `placeOrder Sell Limit ${Math.floor(
                        summarizedOrderSecondaryPairVolume
                    )} KASUSDT - ${parseFloat(orderTargetPrice.toFixed(5))}`
                );

                if (takeProfitOrder && takeProfitOrder.result) {
                    orderId = takeProfitOrder.result.orderId;
                } else {
                    console.error(`request failed: something went wrong2`);
                    return;
                }
            }

            //CANCEL TP ORDER & NEXT STEP
            if (onPosition && currentPrice < nextInsurancePriceToStep) {
                await cancelOrder('KASUSDT', orderId);
                console.log('cancelOrder');

                onPosition = false;
                console.table({
                    position: 'next_step',
                });
            }

            //EXECUTE TP ORDER
            if (onPosition && currentPrice >= orderTargetPrice) {
                onPosition = false;
                console.table({
                    position: 'sell-TP',
                    price: currentPrice,
                });
                profit = orderTargetPrice - orderPriceToStep;
                finish = true;
                break;
            }

            const date = new Date();

            console.log(
                `${date.getHours()}:${date.getMinutes()}:${
                    date.getSeconds() < 10
                        ? '0' + date.getSeconds()
                        : date.getSeconds()
                }`,
                currentPrice
            );

            await sleep(5000);
        } while (currentPrice >= nextInsurancePriceToStep);
    }

    console.log(profit);
}
async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
