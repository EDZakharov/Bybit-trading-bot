import { DCA } from './Strategies/DCA.js';
import { verifiedSymbols } from './Symbols/verifiedSymbols.js';

//TEST
const bot = DCA({
    startOrderVolume: 20,
    insuranceOrderVolume: 17,
    insuranceOrderSteps: 10,
    insuranceOrderPriceDeviation: 0.4,
    insuranceOrderVolumeMultiplier: 0.5,
    insuranceOrderStepsMultiplier: 1.3,
});
const trxBot = await bot(verifiedSymbols.TRX);
console.log(trxBot);
