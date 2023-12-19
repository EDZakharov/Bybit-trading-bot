import { getBalance } from '../Account/getBalance.js';
import { getTickers } from '../Market/getTickers.js';
import { IBuyOrdersStepsToGrid } from '../Types/types.js';
import { editBotConfig } from './botConfig.js';
import { getBotStrategy } from './getBotStrategy.js';

export async function trade(coin: string): Promise<void> {
    let strategy = await getBotStrategy(coin);
    if (!strategy || strategy.length === 0) return;

    let order: IBuyOrdersStepsToGrid;
    // let currentStep: number;
    let currentPrice: number = 0;
    let onPosition: boolean = false;

    START_TRADE: for (order of strategy) {
        const allStepsCount = editBotConfig.getInsuranceOrderSteps();
        const orders: Array<IBuyOrdersStepsToGrid> = [...strategy];
        const allOrdersPriceToStep = orders.map((el) => el.orderPriceToStep);
        let nextInsurancePriceToStep = allOrdersPriceToStep[order.step + 1];
        const balanceUSDT = await getBalance('USDT');
        const summarizedOrderBasePairVolume = orders.find(
            (order: IBuyOrdersStepsToGrid) => order.step === allStepsCount
        )?.summarizedOrderBasePairVolume;
        const orderSecondaryPairVolume = order.orderSecondaryPairVolume;
        const orderTargetPrice = order.orderTargetPrice;
        if (!nextInsurancePriceToStep) {
            console.log('all insurance orders was executed');
            nextInsurancePriceToStep = currentPrice / 100;
        }
        if (
            !orderSecondaryPairVolume ||
            !orderTargetPrice ||
            !summarizedOrderBasePairVolume ||
            !balanceUSDT ||
            +balanceUSDT < summarizedOrderBasePairVolume
        ) {
            console.error(`request failed: something went wrong`);
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

            // PLACE LIMIT ORDER & SL&TP ORDERS
            if (!onPosition) {
                //orderiD = placeOrder({
                //     side: 'Buy',
                //     symbol: 'KASUSDT',
                //     qty: parseFloat(orderSecondaryPairVolume.toFixed(0)),
                //     price: parseFloat(orderTargetPrice.toFixed(5)),
                // });

                onPosition = true;
                console.table({
                    position: 'buy',
                    price: currentPrice,
                    nextStep: nextInsurancePriceToStep,
                });
            }

            //CANCEL TP ORDER & PLACE NEXT INSURANCE ORDER
            if (onPosition && currentPrice < nextInsurancePriceToStep) {
                onPosition = false;
                console.table({
                    position: 'next_step',
                    price: currentPrice,
                    nextStep: nextInsurancePriceToStep,
                });
            }

            if (onPosition && currentPrice >= orderTargetPrice) {
                onPosition = false;
                console.table({
                    position: 'sell-TP',
                    price: currentPrice,
                    nextStep: nextInsurancePriceToStep,
                });
            }

            console.log(currentPrice);
            await sleep(5000);
        } while (currentPrice >= nextInsurancePriceToStep);
    }
}
function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
