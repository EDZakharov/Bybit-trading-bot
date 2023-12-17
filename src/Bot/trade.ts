import { getBotStrategy } from './getBotStrategy.js';

export async function trade(coin: string) {
    const strategy = await getBotStrategy(coin);
    if (!strategy) return;

    //FN START
    //find step
    //save step & {...}
    //check account balance
    //if balance (USDT) < summarizedOrderBasePairVolume(step 10) error low balance
    //find orderSecondaryPairVolume
    //set orderBasePairVolume to placeOrder( {qty:orderSecondaryPairVolume} )
    //set orderPriceToStep to placeOrder( {price:orderPriceToStep} )
    //set orderTargetPrice to placeTakeProfitOrder /// TODO

    //FN CHECK
    //getTicker.lastPrice
    //if getTicker.lastPrice < orderPriceToStep
    //cancel placeTakeProfitOrder
    //set step to next & again FN START
    //if getTicker.lastPrice >= orderTargetPrice
    //execute placeTakeProfitOrder
    //end strategy

    //generate new strategy
    //again FN START
    //again FN CHECK
}
