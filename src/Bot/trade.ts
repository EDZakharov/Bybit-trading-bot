import { getBalance } from '../Account/getBalance.js';
import { getTickers } from '../Market/getTickers.js';
import { cancelOrder } from '../Orders/cancelOrder.js';
import { placeOrder } from '../Orders/placeOrder.js';
import {
    IBuyOrdersStepsToGrid,
    IGetBalanceResult,
    IGetTickerPrice,
} from '../Types/types.js';
import { retry } from '../Utils/retry.js';
import { setAskBidTerminalLog } from '../Utils/setAskBidTerminalLog.js';
import { sleep } from '../Utils/sleep.js';
import { terminalColors } from '../Utils/termColors.js';
import { editBotConfig } from './botConfig.js';
import { getBotStrategy } from './getBotStrategy.js';

export async function trade(symbol: string, length: number): Promise<boolean> {
    const askBidTerminal = setAskBidTerminalLog();
    let strategy = await getBotStrategy(symbol);
    const allStepsCount = editBotConfig.getInsuranceOrderSteps();
    let summarizedOrderBasePairVolume: number | undefined;
    if (!strategy || strategy.length === 0) return false;
    let order: IBuyOrdersStepsToGrid;
    let orderId: string = '';
    let currentPrice: number = 0;
    let onPosition: boolean = false;
    let profit: number = 0;
    let finish: boolean = false;
    summarizedOrderBasePairVolume = [...strategy][allStepsCount]
        ?.summarizedOrderBasePairVolume;
    const orders: Array<IBuyOrdersStepsToGrid> = [...strategy];
    const allOrdersPriceToStep = orders.map((el) => el.orderPriceToStep);

    let balanceUSDT: IGetBalanceResult = await retry(getBalance, 'USDT'); //getBalance
    if (
        !summarizedOrderBasePairVolume ||
        !balanceUSDT ||
        !balanceUSDT.result.balance.walletBalance
    ) {
        console.error(`request failed: something went wrong `);
        return false;
    }
    const currentUsedBalance = summarizedOrderBasePairVolume * length;
    if (currentUsedBalance > +balanceUSDT.result.balance.walletBalance) {
        console.warn(
            `${terminalColors.BgRed}%s${terminalColors.Reset}`,
            `Warn! Bot needs ${currentUsedBalance}. Your balance ${balanceUSDT.result.balance.walletBalance}. Add USDT in your wallet to trade safety!`
            //TODO add sendWarnToClient
        );
    }

    for (order of strategy) {
        if (finish) return true;

        let nextInsurancePriceToStep = allOrdersPriceToStep[order.step + 1];
        // balanceUSDT = await retry(getBalance, 'USDT');
        summarizedOrderBasePairVolume = [...strategy][allStepsCount]
            ?.summarizedOrderBasePairVolume;
        const orderSecondaryPairVolume = order.orderSecondaryPairVolume;
        const orderBasePairVolume = order.orderBasePairVolume;
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
            !summarizedOrderBasePairVolume
        ) {
            console.error(
                `request failed: something went wrong ${summarizedOrderSecondaryPairVolume} || ${orderSecondaryPairVolume} || ${orderTargetPrice} || ${summarizedOrderBasePairVolume}`
            );

            return false;
        }

        START_STRING: do {
            let result: IGetTickerPrice = await retry(getTickers, symbol);
            if (!result) {
                continue START_STRING;
            }
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

                //PLACE START ORDER
                const buyOrder = await placeOrder({
                    orderType: 'Market',
                    side: 'Buy',
                    symbol,
                    qty: orderBasePairVolume,
                    price: currentPrice,
                });
                console.log(
                    `place buy market order ${orderSecondaryPairVolume} ${symbol} - ${orderPriceToStep}`
                );

                // PLACE TP ORDER
                const takeProfitOrder = await placeOrder({
                    orderType: 'Limit',
                    side: 'Sell',
                    symbol,
                    qty: summarizedOrderSecondaryPairVolume,
                    price: orderTargetPrice,
                    orderId: buyOrder?.result.orderId,
                });
                console.log(
                    `place limit take profit order ${summarizedOrderSecondaryPairVolume} ${symbol} - ${orderTargetPrice}`
                );

                //SET TP ORDER ID
                if (takeProfitOrder && takeProfitOrder.result) {
                    orderId = takeProfitOrder.result.orderId;
                } else {
                    console.error(
                        `PLACE LIMIT ORDER & TP ORDER - request failed: something went wrong ${orderId} || ${takeProfitOrder}`
                    );
                    return false;
                }
            }

            //CANCEL TP ORDER & NEXT STEP
            if (onPosition && currentPrice < nextInsurancePriceToStep) {
                await cancelOrder(symbol, orderId);
                console.log(`cancel order ${orderId}`);

                onPosition = false;
                console.table({
                    position: 'next_step',
                });
            }

            //EXECUTE TP ORDER
            if (onPosition && currentPrice >= orderTargetPrice) {
                onPosition = false;
                profit = Math.abs(
                    orderTargetPrice * summarizedOrderSecondaryPairVolume -
                        orderPriceToStep * summarizedOrderSecondaryPairVolume
                );
                console.table({
                    position: 'take_profit',
                    price: currentPrice,
                    profit,
                });

                finish = true;
                break;
            }

            const date = new Date();
            askBidTerminal(date, currentPrice);
            await sleep(5000);
        } while (currentPrice >= nextInsurancePriceToStep);
    }
    return finish;
}
