"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gethms = void 0;
const gethms = function (date, args = '') {
    return (`${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}:${date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()}` + args);
};
exports.gethms = gethms;
