import { getBalance } from '../Account/getBalance.js';
import { getTickers } from '../Market/getTickers.js';
import { cancelOrder } from '../Orders/cancelOrder.js';
import {
    IBuyOrdersStepsToGrid,
    IGetBalanceResult,
    IGetTickerPrice,
} from '../Types/types.js';
import { retry } from '../Utils/retry.js';
import { setAskBidTerminalLog } from '../Utils/setAskBidTerminalLog.js';
import { sleep } from '../Utils/sleep.js';
import { editBotConfig } from './botConfig.js';
import { getBotStrategy } from './getBotStrategy.js';

export async function trade(symbol: string): Promise<void> {
    const askBidTerminal = setAskBidTerminalLog();
    let strategy = await getBotStrategy(symbol);
    if (!strategy || strategy.length === 0) return;
    let order: IBuyOrdersStepsToGrid;
    // let currentStep: number;
    let orderId: string = '';
    let currentPrice: number = 0;
    let onPosition: boolean = false;
    let profit: number = 0;
    let finish: boolean = false;
    for (order of strategy) {
        if (finish) return;

        const allStepsCount = editBotConfig.getInsuranceOrderSteps();
        const orders: Array<IBuyOrdersStepsToGrid> = [...strategy];
        const allOrdersPriceToStep = orders.map((el) => el.orderPriceToStep);
        let nextInsurancePriceToStep = allOrdersPriceToStep[order.step + 1];
        const balanceUSDT: IGetBalanceResult = await retry(getBalance, 'USDT');
        const summarizedOrderBasePairVolume = orders.find(
            (order: IBuyOrdersStepsToGrid) => order.step === allStepsCount
        )?.summarizedOrderBasePairVolume;
        const orderSecondaryPairVolume = order.orderSecondaryPairVolume;
        const summarizedOrderSecondaryPairVolume =
            order.summarizedOrderSecondaryPairVolume;
        const orderTargetPrice = order.orderTargetPrice;
        const orderPriceToStep = order.orderPriceToStep;

        if (!nextInsurancePriceToStep || order.step === allStepsCount) {
            console.log('all insurance orders was executed');
            nextInsurancePriceToStep = currentPrice / 1000;
        }

        if (
            !summarizedOrderSecondaryPairVolume ||
            !orderSecondaryPairVolume ||
            !orderTargetPrice ||
            !summarizedOrderBasePairVolume ||
            !balanceUSDT ||
            +balanceUSDT.result.balance.walletBalance <
                summarizedOrderBasePairVolume
        ) {
            console.error(
                `request failed: something went wrong ${summarizedOrderSecondaryPairVolume} || ${orderSecondaryPairVolume} || ${orderTargetPrice} || ${summarizedOrderBasePairVolume} || ${balanceUSDT}`
            );

            return;
        }

        do {
            let result: IGetTickerPrice = await retry(getTickers, symbol);
            currentPrice = +result.list[0].lastPrice;

            // PLACE LIMIT ORDER & TP ORDER
            if (!onPosition) {
                onPosition = true;
                console.table({
                    position: 'buy',
                    price: currentPrice,
                    profitTarget: orderTargetPrice,
                    nextStep: nextInsurancePriceToStep,
                });

                // //PLACE START ORDER
                // await placeOrder({
                //     orderType: 'Limit',
                //     side: 'Buy',
                //     symbol,
                //     qty: Math.ceil(orderSecondaryPairVolume),
                //     price: parseFloat(orderTargetPrice.toFixed(5)), //???
                // });
                console.log(
                    `place Buy limit order ${Math.floor(
                        orderSecondaryPairVolume
                    )} KASUSDT - ${orderPriceToStep.toFixed(5)}`
                );

                // //PLACE TP ORDER
                // const takeProfitOrder = await placeOrder({
                //     orderType: 'Limit',
                //     side: 'Sell',
                //     symbol,
                //     qty: Math.floor(summarizedOrderSecondaryPairVolume),
                //     price: parseFloat(orderTargetPrice.toFixed(5)),
                // });
                console.log(
                    `place take profit order ${Math.floor(
                        summarizedOrderSecondaryPairVolume
                    )} KASUSDT - ${parseFloat(orderTargetPrice.toFixed(5))}`
                );

                // //SET TP ORDER ID
                // if (takeProfitOrder && takeProfitOrder.result) {
                //     orderId = takeProfitOrder.result.orderId;
                // } else {
                //     console.error(
                //         `PLACE LIMIT ORDER & TP ORDER - request failed: something went wrong ${orderId} || ${takeProfitOrder}`
                //     );
                //     return;
                // }
            }

            //CANCEL TP ORDER & NEXT STEP
            if (onPosition && currentPrice < nextInsurancePriceToStep) {
                await cancelOrder('KASUSDT', orderId);
                console.log(`cancel order ${orderId}`);

                onPosition = false;
                console.table({
                    position: 'next_step',
                });
            }

            //EXECUTE TP ORDER
            if (onPosition && currentPrice >= orderTargetPrice) {
                onPosition = false;
                console.table({
                    position: 'take_profit',
                    price: currentPrice,
                });
                profit = orderTargetPrice - orderPriceToStep;
                finish = true;
                break;
            }

            const date = new Date();
            askBidTerminal(date, currentPrice);
            console.log(
                Math.abs(
                    orderTargetPrice * summarizedOrderSecondaryPairVolume -
                        orderPriceToStep * summarizedOrderSecondaryPairVolume
                )
            );

            await sleep(5000);
        } while (currentPrice >= nextInsurancePriceToStep);
    }

    console.log(profit);
}
