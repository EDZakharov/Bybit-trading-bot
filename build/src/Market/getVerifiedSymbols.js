"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAndVerifySymbol = void 0;
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
const findAndVerifySymbol = function (symbol) {
    return Object.values(VerifiedSymbols).some((targetSymbol) => targetSymbol === symbol);
};
exports.findAndVerifySymbol = findAndVerifySymbol;
