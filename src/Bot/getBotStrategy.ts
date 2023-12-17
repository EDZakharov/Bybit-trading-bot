import { generateBotStrategy } from '../Strategies/DCA.js';
import { VerifiedSymbols } from '../Types/types.js';
import { botConfig } from './botConfig.js';

const generatedStrategy = generateBotStrategy(botConfig);

export const getBotStrategy = async function (
    symbol: string
): Promise<[] | undefined> {
    const validatedSymbolIndex = Object.keys(VerifiedSymbols).findIndex(
        (symbolName) => symbolName === symbol
    );
    if (validatedSymbolIndex === -1) {
        console.error(`request failed: bad symbol ${symbol}`);
        return;
    }
    const correctSymbol = Object.values(VerifiedSymbols)[validatedSymbolIndex];
    return generatedStrategy(correctSymbol);
};
