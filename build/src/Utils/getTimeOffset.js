"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimeOffset = void 0;
const axios_1 = __importDefault(require("axios"));
async function getTimeOffset(url) {
    const start = Date.now();
    const { data } = await (0, axios_1.default)({
        method: 'get',
        url,
    });
    const end = Date.now();
    return Math.ceil(data.result.timeSecond * 1000 - end + (end - start) / 2);
}
exports.getTimeOffset = getTimeOffset;
