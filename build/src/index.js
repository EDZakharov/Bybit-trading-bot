"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botConfig_js_1 = require("./Bot/botConfig.js");
const trade_js_1 = require("./Bot/trade.js");
async function startBot(symbols, editOptions) {
    if (editOptions) {
        botConfig_js_1.editBotConfig.setInsuranceOrderSteps(editOptions.insuranceOrderSteps);
    }
    for (const coinName of symbols) {
        (0, trade_js_1.trade)(coinName);
    }
}
startBot(['KASUSDT']);
