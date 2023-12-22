"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBotStrategy = void 0;
const getVerifiedSymbols_js_1 = require("../Market/getVerifiedSymbols.js");
const DCA_js_1 = require("../Strategies/DCA.js");
const botConfig_js_1 = require("./botConfig.js");
const generatedStrategy = (0, DCA_js_1.generateBotStrategy)(botConfig_js_1.botConfig);
const getBotStrategy = async function (symbol) {
    const validatedSymbol = (0, getVerifiedSymbols_js_1.findAndVerifySymbol)(symbol);
    if (!validatedSymbol) {
        console.error(`request failed: bad symbol ${symbol}`);
        return;
    }
    const result = await generatedStrategy(symbol);
    console.table(result);
    return result;
};
exports.getBotStrategy = getBotStrategy;
