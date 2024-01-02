import { getBalance } from '../Account/getBalance.js';
import { getTickers } from '../Market/getTickers.js';
import { cancelOrder } from '../Orders/cancelOrder.js';
import { placeOrder } from '../Orders/placeOrder.js';
import { RSI } from '../Strategies/RSI.js';
import {
    IBuyOrdersStepsToGrid,
    IGetBalanceResult,
    IGetTickerPrice,
    verifiedSymbols,
} from '../Types/types.js';
import { retry } from '../Utils/retry.js';
import { setAskBidTerminalLog } from '../Utils/setAskBidTerminalLog.js';
import { sleep } from '../Utils/sleep.js';
import { terminalColors } from '../Utils/termColors.js';
import { editBotConfig } from './botConfig.js';
import { getBotStrategy } from './getBotStrategy.js';

export async function trade(
    symbol: verifiedSymbols,
    length: number
): Promise<boolean> {
    const activate = await activateDeal(symbol);
    if (!activate) return true;

    const askBidTerminal = setAskBidTerminalLog();
    let strategy = await getBotStrategy(symbol);
    const allStepsCount = editBotConfig.getInsuranceOrderSteps();
    let summarizedOrderBasePairVolume: number | undefined;
    if (!strategy || strategy.length === 0) return false;
    let order: IBuyOrdersStepsToGrid;
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
        !balanceUSDT.result ||
        !balanceUSDT.result.balance ||
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

    NEXT_STEP: for (order of strategy) {
        if (finish) return true;
        // console.table(order);
        let buyOrderId: string = '';
        let sellOrderId: string = '';
        let currentPrice: number = 0;
        let onPosition: boolean = false;
        let onTakeProfit: boolean = false;
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

        NEXT_LOOP: do {
            let result: IGetTickerPrice = await retry(getTickers, symbol);

            if (!result) {
                continue NEXT_LOOP;
            }
            currentPrice = +result.list[0].lastPrice;

            // PLACE BUY ORDER
            if (!onPosition) {
                onPosition = true;
                console.table({
                    position: 'buy',
                    price: currentPrice,
                    profitTarget: orderTargetPrice,
                    nextStep: nextInsurancePriceToStep,
                });

                console.log(
                    `place buy market order ${orderSecondaryPairVolume} ${symbol} - ${orderPriceToStep}`
                );
                buyOrderId = '';
                const buyOrder = await placeOrder({
                    side: 'Buy',
                    symbol,
                    qty: orderBasePairVolume,
                    price: currentPrice,
                    orderId: buyOrderId,
                });
                if (!buyOrder) {
                    onPosition = false;
                    console.error(`place failed! retry!`);
                    continue NEXT_LOOP;
                }
                buyOrderId = buyOrder.result.orderId;
            }

            //CANCEL TP ORDER & NEXT STEP
            if (onPosition && currentPrice < nextInsurancePriceToStep) {
                await retry(cancelOrder, symbol, sellOrderId);

                onPosition = false;
                onTakeProfit = false;
                buyOrderId = '';
                sellOrderId = '';
                console.table({
                    position: 'next_step',
                });
                continue NEXT_STEP;
            }

            // PLACE TP ORDER
            if (onPosition && !onTakeProfit) {
                const takeProfitOrder = await placeTakeProfitOrder(
                    symbol,
                    summarizedOrderSecondaryPairVolume,
                    orderTargetPrice,
                    buyOrderId
                );

                //SET TP ORDER ID
                if (takeProfitOrder && takeProfitOrder.result) {
                    console.log(
                        `place limit take profit order ${summarizedOrderSecondaryPairVolume} ${symbol} - ${orderTargetPrice}`
                    );
                    sellOrderId = takeProfitOrder.result.orderId;
                    onTakeProfit = true;
                } else {
                    console.error(
                        `PLACE LIMIT ORDER & TP ORDER - request failed: something went wrong ${sellOrderId} || ${takeProfitOrder}`
                    );
                    return false;
                }
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

async function placeTakeProfitOrder(
    symbol: string,
    summarizedOrderSecondaryPairVolume: number,
    orderTargetPrice: number,
    orderId: string
) {
    return await placeOrder({
        side: 'Sell',
        symbol,
        qty: summarizedOrderSecondaryPairVolume,
        price: orderTargetPrice,
        orderId,
    });
}

async function activateDeal(symbol: verifiedSymbols) {
    let calculatedRsi = await RSI(symbol, '3', 14);
    if (calculatedRsi && calculatedRsi.relativeStrengthIndex < 30) {
        console.log('Wait deal');
        console.table(calculatedRsi);
        while (calculatedRsi.rsiConclusion !== 'normal') {
            calculatedRsi = await RSI(symbol, '3', 7);
            await sleep(5000);
        }
        console.log('Start deal');
        console.table(calculatedRsi);

        return true;
    } else {
        await sleep(5000);
        return false;
    }
}
