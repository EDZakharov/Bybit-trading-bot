"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMinQty = void 0;
const getInstrumentInfo_js_1 = require("./getInstrumentInfo.js");
const getMinQty = async (symbol) => {
    const instrumentInfo = await (0, getInstrumentInfo_js_1.getInstrumentInfo)(symbol);
    return (instrumentInfo &&
        instrumentInfo.result.list[0]?.lotSizeFilter.minOrderQty);
};
exports.getMinQty = getMinQty;
