export interface IRestClientOptions {
    key?: string;
    secret?: string;
    testnet?: boolean;
    recv_window?: number;
    enable_time_sync?: boolean;
    baseUrl?: string;
}

export interface IBotConfig {
    targetProfitPercent: number;
    startOrderVolumeUSDT: number;
    insuranceOrderSteps: number;
    insuranceOrderPriceDeviationPercent: number;
    insuranceOrderStepsMultiplier: number;
    insuranceOrderVolumeUSDT: number;
    insuranceOrderVolumeMultiplier: number;
}

export interface IBotSetupConfig {
    setTargetProfitPercent(props: number): void;
    setStartOrderVolumeUSDT(props: number): void;
    setInsuranceOrderSteps(props: number): void;
    setInsuranceOrderPriceDeviationPercent(props: number): void;
    setInsuranceOrderStepsMultiplier(props: number): void;
    setInsuranceOrderVolumeUSDT(props: number): void;
    setInsuranceOrderVolumeMultiplier(props: number): void;
    getInsuranceOrderSteps(): number;
}

export enum VerifiedSymbols {
    BTC = 'BTCUSDT',
    ADA = 'ADAUSDT',
    DOGE = 'DOGEUSDT',
    DOT = 'DOTUSDT',
    LINK = 'LINKUSDT',
    LTC = 'LTCUSDT',
    MATIC = 'MATICUSDT',
    RVN = 'RVNUSDT',
    SOL = 'SOLUSDT',
    SUSHI = 'SUSHIUSDT',
    TRX = 'TRXUSDT',
    TWT = 'TWTUSDT',
    UNI = 'UNIUSDT',
    XRP = 'XRPUSDT',
    KAS = 'KASUSDT',
    YFI = 'YFIUSDT',
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
    orderType: 'Limit' | 'Market';
    side: 'Buy' | 'Sell';
    symbol: string;
    qty: number;
    price: number;
}
