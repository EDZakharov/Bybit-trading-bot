"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrder = void 0;
const symbolChecker_js_1 = require("../Utils/symbolChecker.js");
const restClient_js_1 = __importDefault(require("../restClient.js"));
const getActiveOrders_js_1 = require("./getActiveOrders.js");
const cancelOrder = async (symbol, orderId) => {
    if (!(0, symbolChecker_js_1.symbolChecker)(symbol) || symbol.length === 0) {
        console.error(`request failed: undefined coin - ${symbol}`);
        return;
    }
    if (orderId && orderId.length === 0) {
        console.error(`request failed: wrong orderId length - ${orderId.length}`);
        return;
    }
    try {
        const activeOrders = await (0, getActiveOrders_js_1.getActiveOrders)(symbol);
        const activeOrderId = activeOrders?.list.find((order) => order.orderId === orderId);
        if (!activeOrderId) {
            console.error(`request failed: order with id ${orderId} not found`);
            return;
        }
        const { result } = await restClient_js_1.default.cancelOrder({
            category: 'spot',
            symbol,
            orderId,
        });
        console.dir(`${symbol} order with id ${result.orderId} was canceled`);
        return result;
    }
    catch (error) {
        console.error(`1request failed: something went wrong ${error}`);
        return;
    }
};
exports.cancelOrder = cancelOrder;
