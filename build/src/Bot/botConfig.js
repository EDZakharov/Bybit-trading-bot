"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editBotConfig = exports.botConfig = void 0;
exports.botConfig = {
    targetProfitPercent: 0.5,
    startOrderVolumeUSDT: 30,
    insuranceOrderVolumeUSDT: 30,
    insuranceOrderSteps: 10,
    insuranceOrderPriceDeviationPercent: 0.4,
    insuranceOrderVolumeMultiplier: 0.75,
    insuranceOrderStepsMultiplier: 1.59,
};
exports.editBotConfig = {
    setTargetProfitPercent(targetProfitPercent = 1) {
        exports.botConfig.targetProfitPercent = targetProfitPercent;
    },
    setStartOrderVolumeUSDT(startOrderVolumeUSDT = 30) {
        exports.botConfig.startOrderVolumeUSDT = startOrderVolumeUSDT;
    },
    setInsuranceOrderVolumeUSDT(insuranceOrderVolumeUSDT = 30) {
        exports.botConfig.insuranceOrderVolumeUSDT = insuranceOrderVolumeUSDT;
    },
    setInsuranceOrderSteps(insuranceOrderSteps = 10) {
        exports.botConfig.insuranceOrderSteps = insuranceOrderSteps;
    },
    setInsuranceOrderPriceDeviationPercent(insuranceOrderPriceDeviationPercent = 0.3) {
        exports.botConfig.insuranceOrderPriceDeviationPercent =
            insuranceOrderPriceDeviationPercent;
    },
    setInsuranceOrderVolumeMultiplier(insuranceOrderVolumeMultiplier = 0.75) {
        exports.botConfig.insuranceOrderVolumeMultiplier =
            insuranceOrderVolumeMultiplier;
    },
    setInsuranceOrderStepsMultiplier(insuranceOrderStepsMultiplier = 1.59) {
        exports.botConfig.insuranceOrderStepsMultiplier = insuranceOrderStepsMultiplier;
    },
    getInsuranceOrderSteps() {
        return exports.botConfig.insuranceOrderSteps;
    },
};
