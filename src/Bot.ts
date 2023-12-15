import { DCA } from './Strategies/DCA.js';
import { verifiedSymbols } from './Symbols/verifiedSymbols.js';

//TEST
const bot = DCA({
    targetProfit: 0.7,
    startOrderVolume: 20,
    insuranceOrderVolume: 15,
    insuranceOrderSteps: 10,
    insuranceOrderPriceDeviation: 0.4,
    insuranceOrderVolumeMultiplier: 0.75,
    insuranceOrderStepsMultiplier: 1.59,
});
const yfiBot = await bot(verifiedSymbols.YFI);

console.table(yfiBot);
