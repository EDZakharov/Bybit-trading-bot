import { findAndVerifySymbol } from '../Market/getVerifiedSymbols.js';
import { generateBotStrategy } from '../Strategies/DCA.js';
import { IBuyOrdersStepsToGrid } from '../Types/types.js';
import { botConfig } from './botConfig.js';

const generatedStrategy = generateBotStrategy(botConfig);

export const getBotStrategy = async function (
    symbol: string
): Promise<Array<IBuyOrdersStepsToGrid> | undefined> {
    const validatedSymbol = findAndVerifySymbol(symbol);
    if (!validatedSymbol) {
        console.error(`request failed: bad symbol ${symbol}`);
        return;
    }
    const result: Array<IBuyOrdersStepsToGrid> = await generatedStrategy(
        symbol
    );

    console.table(result);

    return result;
};
