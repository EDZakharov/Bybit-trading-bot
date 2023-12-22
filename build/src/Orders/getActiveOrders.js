"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveOrders = void 0;
const restClient_js_1 = __importDefault(require("../restClient.js"));
const getActiveOrders = async (symbol) => {
    try {
        const { result } = await restClient_js_1.default.getActiveOrders({
            category: 'spot',
            symbol,
        });
        return result;
    }
    catch (error) {
        console.error('3request failed: ', error);
        return;
    }
};
exports.getActiveOrders = getActiveOrders;
