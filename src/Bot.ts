import { DCA } from './Strategies/DCA.js';
import { verifiedSymbols } from './Symbols/verifiedSymbols.js';

//TEST
const bot = DCA({
    targetProfit: 0.5,
    startOrderVolume: 30,
    insuranceOrderVolume: 30,
    insuranceOrderSteps: 10,
    insuranceOrderPriceDeviation: 0.3,
    insuranceOrderVolumeMultiplier: 0.7,
    insuranceOrderStepsMultiplier: 1.4,
});
const kasBot = await bot(verifiedSymbols.KAS);

console.table(kasBot);
