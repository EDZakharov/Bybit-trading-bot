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
    marketUnit?: string;
    orderId?: string;
}

export interface IGetBalanceResult {
    rateLimitApi: undefined;
    retCode: number;
    retMsg: string;
    result: {
        accountType: string;
        bizType: number;
        accountId: string;
        memberId: string;
        balance: {
            coin: string;
            walletBalance: string;
            transferBalance: string;
            bonus: string;
            transferSafeAmount: string;
            ltvTransferSafeAmount: string;
        };
    };
    retExtInfo: {};
    time: number;
}

export interface IGetTickerPrice {
    category: string;
    list: [
        {
            symbol: string;
            bid1Price: string;
            bid1Size: string;
            ask1Price: string;
            ask1Size: string;
            lastPrice: string;
            prevPrice24h: string;
            price24hPcnt: string;
            highPrice24h: string;
            lowPrice24h: string;
            turnover24h: string;
            volume24h: string;
        }
    ];
}
