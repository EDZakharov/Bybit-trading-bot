import consola from 'consola';
import { getBalance } from '../Account/getBalance.js';
import {
    deleteCoinStrategy,
    deleteCurrentStep,
    getCoinStrategyFromDb,
    getCurrentStep,
    setCoinStrategy,
    setCurrentStep,
} from '../Api/api.js';
import { getTickers } from '../Market/getTickers.js';
import { cancelOrder } from '../Orders/cancelOrder.js';
import { placeOrder } from '../Orders/placeOrder.js';
import { IRsiOptions, RSI } from '../Strategies/RSI.js';
import {
    AxiosResponse,
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
    length: number,
    userCredentials: AxiosResponse<any>
): Promise<boolean> {
    let strategy: IBuyOrdersStepsToGrid[] | undefined;
    let strategyFromDb = await getCoinStrategyFromDb(symbol, userCredentials);
    let currentStep = await getCurrentStep(symbol, userCredentials);

    // if (!strategyFromDb && !currentStep) {
    //     const activate = await activateDeal(symbol);
    //     if (!activate) return true;
    // }

    if (!strategyFromDb && currentStep) {
        await deleteCurrentStep(symbol, userCredentials);
        consola.info({
            message: `retrying ...`,
            // badge: true,
        });
        await sleep(5000);
        return true;
    }

    if (strategyFromDb && !currentStep && currentStep !== 0) {
        currentStep = await setCurrentStep(symbol, 0, userCredentials);
        consola.info({
            message: `retrying ...`,
            // badge: true,
        });
        await sleep(5000);
        return true;
    }

    if (!strategyFromDb || strategyFromDb.length === 0) {
        strategy = await getBotStrategy(symbol);
        strategy &&
            strategy.length !== 0 &&
            (await setCoinStrategy(strategy, symbol, userCredentials));
    }
    if (!strategy && !!strategyFromDb && strategyFromDb.length !== 0) {
        strategy = strategyFromDb;
    } else {
        consola.info({
            message: `retrying ...`,
            // badge: true,
        });
        await sleep(5000);
        return true;
    }

    let filteredStrategy: IBuyOrdersStepsToGrid[];

    if (currentStep === 0) {
        filteredStrategy = strategy;
    } else {
        filteredStrategy = strategy.filter((step) => {
            return step.step >= currentStep;
        });
    }

    console.table(filteredStrategy);

    const askBidTerminal = setAskBidTerminalLog();
    const allStepsCount = editBotConfig.getInsuranceOrderSteps();
    let summarizedOrderBasePairVolume: number | undefined;

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
        consola.error({
            message: 'request failed: something went wrong',
            badge: true,
        });
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

    if (filteredStrategy.length === 0) {
        await deleteCurrentStep(symbol, userCredentials);
        await deleteCoinStrategy(symbol, userCredentials);
        return true;
    }

    NEXT_STEP: for (order of filteredStrategy) {
        // FILTERED STRATEGY (CURRENT STEP FROM DB)
        await setCurrentStep(symbol, order.step, userCredentials);
        if (finish) return true;
        // console.table(order);
        let buyOrderId: string = '';
        let sellOrderId: string = '';
        let currentPrice: number = 0;
        let onPosition: boolean = false;
        let onTakeProfit: boolean = false;
        let nextInsurancePriceToStep = allOrdersPriceToStep[order.step + 1];
        // let currInsurancePriceToStep = allOrdersPriceToStep[order.step];
        // console.log(currInsurancePriceToStep);

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
            //EXIT
            consola.warn({
                message: 'All insurance orders was executed',
            });

            let lastResult: IGetTickerPrice = await retry(getTickers, symbol);
            let lastPrice = +lastResult.list[0].lastPrice;

            console.table({
                profitTarget: orderTargetPrice,
                nextStep: 'Exiting',
            });

            while (lastPrice < orderTargetPrice) {
                lastResult = await retry(getTickers, symbol);
                lastPrice = +lastResult.list[0].lastPrice;
                const date = new Date();
                askBidTerminal(date, lastPrice);
                await sleep(5000);
                continue;
            }
            profit = Math.abs(
                orderTargetPrice * summarizedOrderSecondaryPairVolume -
                    orderPriceToStep * summarizedOrderSecondaryPairVolume
            );

            console.table({
                position: 'take_profit',
                price: lastPrice,
                profit,
            });

            await deleteCurrentStep(symbol, userCredentials);
            await deleteCoinStrategy(symbol, userCredentials);
            return true;
        }

        if (
            !summarizedOrderSecondaryPairVolume ||
            !orderSecondaryPairVolume ||
            !orderTargetPrice ||
            !summarizedOrderBasePairVolume
        ) {
            consola.error({
                message: `request failed: something went wrong ${summarizedOrderSecondaryPairVolume} || ${orderSecondaryPairVolume} || ${orderTargetPrice} || ${summarizedOrderBasePairVolume}`,
                badge: true,
            });

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

                consola.info({
                    message: `place buy market order ${orderSecondaryPairVolume} ${symbol} - ${orderPriceToStep}`,
                    // badge: true,
                });
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
                    consola.info({
                        message: `place failed! retrying ...`,
                        // badge: true,
                    });
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
                    consola.info({
                        message: `place limit take profit order ${summarizedOrderSecondaryPairVolume} ${symbol} - ${orderTargetPrice}`,
                    });

                    sellOrderId = takeProfitOrder.result.orderId;
                    onTakeProfit = true;
                } else {
                    consola.error({
                        message: `PLACE LIMIT ORDER & TP ORDER - request failed: something went wrong ${sellOrderId} || ${takeProfitOrder}`,
                    });

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
                await deleteCurrentStep(symbol, userCredentials);
                await deleteCoinStrategy(symbol, userCredentials);
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
    const rsiOptions: IRsiOptions = {
        symbol,
        timeInterval: '1',
        limit: 5,
    };
    let calculatedRsi = await RSI(
        rsiOptions.symbol,
        rsiOptions.timeInterval,
        rsiOptions.limit
    );
    if (calculatedRsi && calculatedRsi.relativeStrengthIndex < 30) {
        consola.info({
            message: `starting RSI monitoring...`,
            // badge: true,
        });
        while (calculatedRsi.rsiConclusion !== 'normal') {
            calculatedRsi = await RSI(
                rsiOptions.symbol,
                rsiOptions.timeInterval,
                rsiOptions.limit
            );
            consola.info({
                message: `current RSI = ${calculatedRsi.relativeStrengthIndex}, wait deal ... `,
                // badge: true,
            });
            await sleep(5000);
        }
        consola.info({
            message: `start deal...`,
            // badge: true,
        });
        return true;
    } else {
        consola.info({
            message: `current RSI = ${calculatedRsi.relativeStrengthIndex}, monitoring ...`,
            // badge: true,
        });
        await sleep(5000);
        return await activateDeal(symbol);
    }
}
