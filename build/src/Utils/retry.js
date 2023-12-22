"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retry = void 0;
const sleep_js_1 = require("./sleep.js");
async function retry(cb, symbol) {
    let result = undefined;
    while (!result) {
        try {
            result = await cb(symbol);
            if (!result) {
                result = undefined;
            }
        }
        catch (error) {
            result = undefined;
        }
        // console.log(result);
        await (0, sleep_js_1.sleep)(1000);
    }
    return result && cb(symbol);
}
exports.retry = retry;
