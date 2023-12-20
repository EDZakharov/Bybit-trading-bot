import { getBalance } from '../Account/getBalance.js';
import { getTickers } from '../Market/getTickers.js';
import { placeOrder } from '../Orders/placeOrder.js';
import { IBuyOrdersStepsToGrid } from '../Types/types.js';
import { editBotConfig } from './botConfig.js';
import { getBotStrategy } from './getBotStrategy.js';

export async function trade(coin: string): Promise<void> {
    let strategy = await getBotStrategy(coin);
    if (!strategy || strategy.length === 0) return;

    let step: IBuyOrdersStepsToGrid;
    START: for (step of strategy) {
        //DO WHILE?
        console.log('start');
        const currentStep = step.step;

        const currentStep1 = step;
        const allStepsCount = editBotConfig.getInsuranceOrderSteps();
        const orders: Array<IBuyOrdersStepsToGrid> = [...strategy];

        const summarizedOrderBasePairVolume = orders.find(
            (order: IBuyOrdersStepsToGrid) => order.step === allStepsCount
        )?.summarizedOrderBasePairVolume;

        const orderSecondaryPairVolume = orders.find(
            (order: IBuyOrdersStepsToGrid) => order.step === currentStep
        )?.orderSecondaryPairVolume;

        const orderTargetPrice = orders.find(
            (order: IBuyOrdersStepsToGrid) => order.step === currentStep
        )?.orderTargetPrice;
        if (!summarizedOrderBasePairVolume) return;
        if (!orderSecondaryPairVolume) return;
        if (!orderTargetPrice) return;
        const balanceUSDT = await getBalance('USDT');
        if (
            !balanceUSDT ||
            +balanceUSDT.walletBalance < summarizedOrderBasePairVolume
        ) {
            return;
        }

        const price = await getTickers('KASUSDT');
        if (!price || !price.list[0]) return;

        // //TODO
        // if (+price.list[0].lastPrice >= step.orderPriceToStep) {
        //     await sleep(5000);
        //     // console.log(currentStep1);
        //     continue START;
        // }
        placeOrder({
            side: 'Buy',
            symbol: 'KASUSDT',
            qty: parseFloat(orderSecondaryPairVolume.toFixed(0)),
            price: parseFloat(orderTargetPrice.toFixed(5)),
        });
    }
}
function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
