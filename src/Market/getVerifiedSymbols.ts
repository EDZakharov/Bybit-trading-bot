const VerifiedSymbols = {
    BTC: 'BTCUSDT',
    ADA: 'ADAUSDT',
    DOGE: 'DOGEUSDT',
    DOT: 'DOTUSDT',
    LINK: 'LINKUSDT',
    LTC: 'LTCUSDT',
    MATIC: 'MATICUSDT',
    RVN: 'RVNUSDT',
    SOL: 'SOLUSDT',
    SUSHI: 'SUSHIUSDT',
    TRX: 'TRXUSDT',
    TWT: 'TWTUSDT',
    UNI: 'UNIUSDT',
    XRP: 'XRPUSDT',
    KAS: 'KASUSDT',
};
export const findAndVerifySymbol = function (symbol: string): boolean {
    return Object.values(VerifiedSymbols).some(
        (targetSymbol) => targetSymbol === symbol
    );
};
