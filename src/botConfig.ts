import { IBotConfig } from './Types/types.js';

export const botConfig: IBotConfig = {
    targetProfitPercent: 2,
    startOrderVolumeUSDT: 30,
    insuranceOrderVolumeUSDT: 30,
    insuranceOrderSteps: 10,
    insuranceOrderPriceDeviationPercent: 0.4,
    insuranceOrderVolumeMultiplier: 0.75,
    insuranceOrderStepsMultiplier: 1.59,
};
