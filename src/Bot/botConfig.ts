import { IBotConfig, IBotSetupConfig } from '../Types/types.js';

export const botConfig: IBotConfig = {
    targetProfitPercent: 1,
    startOrderVolumeUSDT: 10,
    insuranceOrderVolumeUSDT: 10,
    insuranceOrderSteps: 10,
    insuranceOrderPriceDeviationPercent: 0.4,
    insuranceOrderVolumeMultiplier: 0.75,
    insuranceOrderStepsMultiplier: 1.59,
};

export const editBotConfig: IBotSetupConfig = {
    setTargetProfitPercent(targetProfitPercent = 1) {
        botConfig.targetProfitPercent = targetProfitPercent;
    },

    setStartOrderVolumeUSDT(startOrderVolumeUSDT = 10) {
        botConfig.startOrderVolumeUSDT = startOrderVolumeUSDT;
    },

    setInsuranceOrderVolumeUSDT(insuranceOrderVolumeUSDT = 10) {
        botConfig.insuranceOrderVolumeUSDT = insuranceOrderVolumeUSDT;
    },

    setInsuranceOrderSteps(insuranceOrderSteps = 10) {
        botConfig.insuranceOrderSteps = insuranceOrderSteps;
    },

    setInsuranceOrderPriceDeviationPercent(
        insuranceOrderPriceDeviationPercent = 0.4
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
