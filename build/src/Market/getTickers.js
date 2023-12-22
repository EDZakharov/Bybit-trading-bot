"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTickers = void 0;
const restClient_js_1 = __importDefault(require("../restClient.js"));
const getTickers = async (symbol) => {
    try {
        const { result } = await restClient_js_1.default.getTickers({
            category: 'spot',
            symbol,
        });
        if (!result.list) {
            console.error(`request failed: undefined coin - ${symbol}`);
            return;
        }
        return result;
    }
    catch (error) {
        console.error(`6request failed: something went wrong ${error}`);
        return;
    }
};
exports.getTickers = getTickers;
