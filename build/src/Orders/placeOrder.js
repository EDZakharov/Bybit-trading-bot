"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.placeOrder = void 0;
const symbolChecker_js_1 = require("../Utils/symbolChecker.js");
const restClient_js_1 = __importDefault(require("../restClient.js"));
const getMinQty_js_1 = require("./getMinQty.js");
const placeOrder = async ({ orderType, side, symbol, qty, price, }) => {
    if (!(0, symbolChecker_js_1.symbolChecker)(symbol)) {
        console.error(`request failed: undefined coin - ${symbol}`);
        return;
    }
    let data;
    try {
        const instrumentMinQty = await (0, getMinQty_js_1.getMinQty)(symbol);
        if (instrumentMinQty && +instrumentMinQty <= +qty) {
            data = await restClient_js_1.default.submitOrder({
                category: 'spot',
                orderType,
                side,
                symbol,
                qty: `${qty}`,
                price: `${price}`,
            });
            console.dir(data);
            // cancel order
            // await cancelOrder(symbol, data.result.orderId);
        }
        else {
            !instrumentMinQty
                ? console.error(`request failed: undefined coin - ${symbol}`)
                : console.error(`request failed: you sent ${qty} qty, you should send >= ${instrumentMinQty} qty for success`);
        }
    }
    catch (error) {
        console.error('0request failed: ', error);
    }
    return data;
};
exports.placeOrder = placeOrder;
