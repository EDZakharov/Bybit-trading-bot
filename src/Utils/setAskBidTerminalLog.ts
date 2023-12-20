import { gethms } from './gethms.js';
import { terminalColors } from './termColors.js';

export const setAskBidTerminalLog = function () {
    let lastPrice: number = 0;

    return function (date: Date, currentPrice: number) {
        const currentTime = gethms(date);

        const loggedStr = `${currentTime} | Current price: ${currentPrice}`;

        if (lastPrice === 0) {
            console.log(
                `${terminalColors.BgBlue}%s${terminalColors.Reset}`,
                loggedStr
            );
            lastPrice = currentPrice;
        } else if (currentPrice > lastPrice) {
            console.log(
                `${terminalColors.BgGreen}%s${terminalColors.Reset}`,
                loggedStr
            );
            lastPrice = currentPrice;
        } else if (currentPrice < lastPrice) {
            console.log(
                `${terminalColors.BgRed}%s${terminalColors.Reset}`,
                loggedStr
            );
            lastPrice = currentPrice;
        } else {
            console.log(
                `${terminalColors.BgBlack}%s${terminalColors.Reset}`,
                loggedStr
            );
        }
    };
};
