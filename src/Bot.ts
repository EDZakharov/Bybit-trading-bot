import { DCA } from './Strategies/DCA.js';
import { verifiedSymbols } from './Symbols/verifiedSymbols.js';

//TEST

const botConfig = {
    targetProfit: 0.5,
    startOrderVolume: 30,
    insuranceOrderVolume: 30,
    insuranceOrderSteps: 10,
    insuranceOrderPriceDeviation: 0.4,
    insuranceOrderVolumeMultiplier: 0.75,
    insuranceOrderStepsMultiplier: 1.59,
};

const bot = DCA(botConfig);
const kasBot = await bot(verifiedSymbols.KAS);

console.table(botConfig);
console.table(kasBot);
