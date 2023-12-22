"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBalance = void 0;
const symbolChecker_js_1 = require("../Utils/symbolChecker.js");
const restClient_js_1 = __importDefault(require("../restClient.js"));
const getBalance = async (coin) => {
    let ok = (0, symbolChecker_js_1.symbolChecker)(coin);
    if (!ok) {
        console.error(`request failed: undefined coin`);
        return;
    }
    try {
        const result = await restClient_js_1.default.getCoinBalance({
            coin,
            accountType: 'UNIFIED',
        });
        return result;
    }
    catch (error) {
        console.error('5request failed: ', error);
        return;
    }
};
exports.getBalance = getBalance;
