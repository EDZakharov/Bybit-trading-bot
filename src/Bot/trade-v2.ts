// import {
//     IBuyOrdersStepsToGrid,
//     IGetBalanceResult,
//     IGetTickerPrice,
// } from '../Types/types.js';
// // import { retry } from '../Utils/retry.js';

// export async function tradeV2(
//     symbol: string,
//     strategy: IBuyOrdersStepsToGrid[],
//     allStepsCount: number,
//     balanceUSDT: IGetBalanceResult,
//     summarizedOrderBasePairVolume: number,
//     orders: Array<IBuyOrdersStepsToGrid>,
//     allOrdersPriceToStep: number[],
//     retry: Function,
//     sleep: Function,
//     getTickers: Function,
//     placeOrder: Function,
//     cancelOrder: Function,
//     setAskBidTerminalLog: Function
// ): Promise<boolean> {
//     const askBidTerminal = setAskBidTerminalLog();
//     let order: IBuyOrdersStepsToGrid;
//     let finish: boolean = false;

//     for (order of orders) {
//         if (finish) return true;
//         let orderId: string = '';
//         let currentPrice: number = 0;
//         let nextInsurancePriceToStep = allOrdersPriceToStep[order.step + 1];
//         let onPosition: boolean = false;
//         const orderSecondaryPairVolume = order.orderSecondaryPairVolume;
//         const orderBasePairVolume = order.orderBasePairVolume;
//         const summarizedOrderSecondaryPairVolume =
//             order.summarizedOrderSecondaryPairVolume;
//         const orderTargetPrice = order.orderTargetPrice;
//         const orderPriceToStep = order.orderPriceToStep;

//         if (!nextInsurancePriceToStep || order.step === allStepsCount) {
//             console.log('all insurance orders was executed');
//             nextInsurancePriceToStep = currentPrice / 1000;
//         }

//         do {
//             let result: IGetTickerPrice = await retry(getTickers, symbol);
//             currentPrice = +result.list[0].lastPrice;

//             // PLACE LIMIT ORDER & TP ORDER
//             if (!onPosition) {
//                 onPosition = true;

//                 console.table({
//                     position: 'buy',
//                     price: currentPrice,
//                     profitTarget: orderTargetPrice,
//                     nextStep: nextInsurancePriceToStep,
//                 });

//                 //PLACE START ORDER
//                 const buyOrder = await placeOrder({
//                     orderType: 'Market',
//                     side: 'Buy',
//                     symbol,
//                     qty: orderBasePairVolume,
//                     price: currentPrice,
//                 });

//                 console.log(
//                     `place buy market order ${orderSecondaryPairVolume} ${symbol} - ${orderPriceToStep}`
//                 );

//                 // PLACE TP ORDER
//                 const takeProfitOrder = await placeOrder({
//                     orderType: 'Limit',
//                     side: 'Sell',
//                     symbol,
//                     qty: summarizedOrderSecondaryPairVolume,
//                     price: orderTargetPrice,
//                     orderId: buyOrder?.result.orderId,
//                 });

//                 console.log(
//                     `place limit take profit order ${summarizedOrderSecondaryPairVolume} ${symbol} - ${orderTargetPrice}`
//                 );

//                 //SET TP ORDER ID
//                 if (takeProfitOrder && takeProfitOrder.result) {
//                     orderId = takeProfitOrder.result.orderId;
//                 } else {
//                     console.error(
//                         `PLACE LIMIT ORDER & TP ORDER - request failed: something went wrong ${orderId} || ${takeProfitOrder}`
//                     );

//                     return false;
//                 }
//             }

//             //CANCEL TP ORDER & NEXT STEP
//             if (onPosition && currentPrice < nextInsurancePriceToStep) {
//                 await cancelOrder(symbol, orderId);
//                 console.log(`cancel order ${orderId}`);
//                 onPosition = false;
//                 console.table({
//                     position: 'next_step',
//                 });
//             }

//             //EXECUTE TP ORDER
//             if (onPosition && currentPrice >= orderTargetPrice) {
//                 onPosition = false;
//                 const profit = Math.abs(
//                     orderTargetPrice * summarizedOrderSecondaryPairVolume -
//                         orderPriceToStep * summarizedOrderSecondaryPairVolume
//                 );
//                 console.table({
//                     position: 'take_profit',
//                     price: currentPrice,
//                     profit,
//                 });

//                 finish = true;
//                 break;
//             }

//             const date = new Date();
//             askBidTerminal(date, currentPrice);
//             await sleep(5000);
//         } while (currentPrice >= nextInsurancePriceToStep);
//     }
//     return finish;
// }
