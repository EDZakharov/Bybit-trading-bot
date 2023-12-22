"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAskBidTerminalLog = void 0;
const gethms_js_1 = require("./gethms.js");
const termColors_js_1 = require("./termColors.js");
const setAskBidTerminalLog = function () {
    let lastPrice = 0;
    return function (date, currentPrice) {
        const currentTime = (0, gethms_js_1.gethms)(date);
        const loggedStr = `${currentTime} | Current price: ${currentPrice}`;
        if (lastPrice === 0) {
            console.log(`${termColors_js_1.terminalColors.BgBlue}%s${termColors_js_1.terminalColors.Reset}`, loggedStr);
            lastPrice = currentPrice;
        }
        else if (currentPrice > lastPrice) {
            console.log(`${termColors_js_1.terminalColors.BgGreen}%s${termColors_js_1.terminalColors.Reset}`, loggedStr);
            lastPrice = currentPrice;
        }
        else if (currentPrice < lastPrice) {
            console.log(`${termColors_js_1.terminalColors.BgRed}%s${termColors_js_1.terminalColors.Reset}`, loggedStr);
            lastPrice = currentPrice;
        }
        else {
            console.log(`${termColors_js_1.terminalColors.BgBlack}%s${termColors_js_1.terminalColors.Reset}`, loggedStr);
        }
    };
};
exports.setAskBidTerminalLog = setAskBidTerminalLog;
