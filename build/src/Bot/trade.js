"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trade = void 0;
const getBalance_js_1 = require("../Account/getBalance.js");
const getTickers_js_1 = require("../Market/getTickers.js");
const cancelOrder_js_1 = require("../Orders/cancelOrder.js");
const retry_js_1 = require("../Utils/retry.js");
const setAskBidTerminalLog_js_1 = require("../Utils/setAskBidTerminalLog.js");
const sleep_js_1 = require("../Utils/sleep.js");
const botConfig_js_1 = require("./botConfig.js");
const getBotStrategy_js_1 = require("./getBotStrategy.js");
async function trade(symbol) {
    const askBidTerminal = (0, setAskBidTerminalLog_js_1.setAskBidTerminalLog)();
    let strategy = await (0, getBotStrategy_js_1.getBotStrategy)(symbol);
    if (!strategy || strategy.length === 0)
        return;
    let order;
    // let currentStep: number;
    let orderId = '';
    let currentPrice = 0;
    let onPosition = false;
    let profit = 0;
    let finish = false;
    for (order of strategy) {
        if (finish)
            return;
        const allStepsCount = botConfig_js_1.editBotConfig.getInsuranceOrderSteps();
        const orders = [...strategy];
        const allOrdersPriceToStep = orders.map((el) => el.orderPriceToStep);
        let nextInsurancePriceToStep = allOrdersPriceToStep[order.step + 1];
        const balanceUSDT = await (0, retry_js_1.retry)(getBalance_js_1.getBalance, 'USDT');
        const summarizedOrderBasePairVolume = orders.find((order) => order.step === allStepsCount)?.summarizedOrderBasePairVolume;
        const orderSecondaryPairVolume = order.orderSecondaryPairVolume;
        const summarizedOrderSecondaryPairVolume = order.summarizedOrderSecondaryPairVolume;
        const orderTargetPrice = order.orderTargetPrice;
        const orderPriceToStep = order.orderPriceToStep;
        if (!nextInsurancePriceToStep || order.step === allStepsCount) {
            console.log('all insurance orders was executed');
            nextInsurancePriceToStep = currentPrice / 1000;
        }
        if (!summarizedOrderSecondaryPairVolume ||
            !orderSecondaryPairVolume ||
            !orderTargetPrice ||
            !summarizedOrderBasePairVolume ||
            !balanceUSDT ||
            +balanceUSDT.result.balance.walletBalance <
                summarizedOrderBasePairVolume) {
            console.error(`request failed: something went wrong ${summarizedOrderSecondaryPairVolume} || ${orderSecondaryPairVolume} || ${orderTargetPrice} || ${summarizedOrderBasePairVolume} || ${balanceUSDT}`);
            return;
        }
        START_STRING: do {
            let result = await (0, retry_js_1.retry)(getTickers_js_1.getTickers, symbol);
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
                //     //PLACE START ORDER
                // await placeOrder({
                //     orderType: 'Limit',
                //     side: 'Buy',
                //     symbol,
                //     qty: Math.ceil(orderSecondaryPairVolume),
                //     price: parseFloat(orderTargetPrice.toFixed(5)), //???
                // });
                console.log(`place Buy limit order ${Math.floor(orderSecondaryPairVolume)} KASUSDT - ${orderPriceToStep.toFixed(5)}`);
                //PLACE TP ORDER
                // const takeProfitOrder = await placeOrder({
                //     orderType: 'Limit',
                //     side: 'Sell',
                //     symbol,
                //     qty: Math.floor(summarizedOrderSecondaryPairVolume),
                //     price: parseFloat(orderTargetPrice.toFixed(5)),
                // });
                console.log(`place take profit order ${Math.floor(summarizedOrderSecondaryPairVolume)} KASUSDT - ${parseFloat(orderTargetPrice.toFixed(5))}`);
                //     //SET TP ORDER ID
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
                await (0, cancelOrder_js_1.cancelOrder)('KASUSDT', orderId);
                console.log(`cancel order ${orderId}`);
                onPosition = false;
                console.table({
                    position: 'next_step',
                });
            }
            //EXECUTE TP ORDER
            if (onPosition && currentPrice >= orderTargetPrice) {
                onPosition = false;
                profit = Math.abs(orderTargetPrice * summarizedOrderSecondaryPairVolume -
                    orderPriceToStep * summarizedOrderSecondaryPairVolume);
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
            await (0, sleep_js_1.sleep)(5000);
        } while (currentPrice >= nextInsurancePriceToStep);
    }
}
exports.trade = trade;
