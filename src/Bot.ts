import { DCA } from './Strategies/DCA.js';
import { verifiedSymbols } from './Symbols/verifiedSymbols.js';

//TEST
const bot = DCA({
    startOrderVolume: 23,
    insuranceOrderVolume: 15,
    insuranceOrderSteps: 15,
    insuranceOrderPriceDeviation: 0.4,
    insuranceOrderVolumeMultiplier: 0.75,
    insuranceOrderStepsMultiplier: 1.59,
});
const trxBot = await bot(verifiedSymbols.TRX);

console.log(trxBot);
