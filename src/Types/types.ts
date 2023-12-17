export interface IBotConfig {
    targetProfitPercent: number;
    startOrderVolumeUSDT: number;
    insuranceOrderSteps: number;
    insuranceOrderPriceDeviationPercent: number;
    insuranceOrderStepsMultiplier: number;
    insuranceOrderVolumeUSDT: number;
    insuranceOrderVolumeMultiplier: number;
}

export interface IBuyOrdersStepsToGrid {
    symbol?: string;
    step: number;
    orderDeviation: number;
    orderBasePairVolume: number;
    orderSecondaryPairVolume: number;
    orderPriceToStep: number;
    orderAveragePrice: number;
    orderTargetPrice: number;
    orderTargetDeviation: number;
    summarizedOrderBasePairVolume: number;
    summarizedOrderSecondaryPairVolume: number;
}

export interface IWeightedSum {
    orderPriceToStep: number;
    orderSecondaryPairVolume: number;
    summarizedOrderSecondaryPairVolume: number;
}

export interface IGetBalance {
    coin: string;
    walletBalance: string;
    transferBalance: string;
    bonus: string;
}

export interface IPlaceOrder {
    side: 'Buy' | 'Sell';
    symbol: string;
    qty: string;
    price: string;
}
