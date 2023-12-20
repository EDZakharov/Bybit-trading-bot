import { IBotConfig, IBotSetupConfig } from '../Types/types.js';

export const botConfig: IBotConfig = {
    targetProfitPercent: 0.5,
    startOrderVolumeUSDT: 30,
    insuranceOrderVolumeUSDT: 30,
    insuranceOrderSteps: 10,
    insuranceOrderPriceDeviationPercent: 0.4,
    insuranceOrderVolumeMultiplier: 0.75,
    insuranceOrderStepsMultiplier: 1.59,
};

export const editBotConfig: IBotSetupConfig = {
    setTargetProfitPercent(targetProfitPercent = 1) {
        botConfig.targetProfitPercent = targetProfitPercent;
    },

    setStartOrderVolumeUSDT(startOrderVolumeUSDT = 30) {
        botConfig.startOrderVolumeUSDT = startOrderVolumeUSDT;
    },

    setInsuranceOrderVolumeUSDT(insuranceOrderVolumeUSDT = 30) {
        botConfig.insuranceOrderVolumeUSDT = insuranceOrderVolumeUSDT;
    },

    setInsuranceOrderSteps(insuranceOrderSteps = 10) {
        botConfig.insuranceOrderSteps = insuranceOrderSteps;
    },

    setInsuranceOrderPriceDeviationPercent(
        insuranceOrderPriceDeviationPercent = 0.3
    ) {
        botConfig.insuranceOrderPriceDeviationPercent =
            insuranceOrderPriceDeviationPercent;
    },

    setInsuranceOrderVolumeMultiplier(insuranceOrderVolumeMultiplier = 0.75) {
        botConfig.insuranceOrderVolumeMultiplier =
            insuranceOrderVolumeMultiplier;
    },

    setInsuranceOrderStepsMultiplier(insuranceOrderStepsMultiplier = 1.59) {
        botConfig.insuranceOrderStepsMultiplier = insuranceOrderStepsMultiplier;
    },

    getInsuranceOrderSteps() {
        return botConfig.insuranceOrderSteps;
    },
};
