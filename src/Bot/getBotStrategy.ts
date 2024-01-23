import consola from 'consola';
import { findAndVerifySymbol } from '../Market/getVerifiedSymbols.js';
import { generateBotStrategy } from '../Strategies/DCA.js';
import { IBuyOrdersStepsToGrid, verifiedSymbols } from '../Types/types.js';
import { botConfig } from './botConfig.js';
import { setStrategyToFile } from './strategies.js';

const generatedBotStrategy = generateBotStrategy(botConfig);

export const generateStrategy = async function (
    symbol: verifiedSymbols
): Promise<IBuyOrdersStepsToGrid[] | null> {
    const validatedSymbol = findAndVerifySymbol(symbol);
    if (!validatedSymbol) {
        console.error(`request failed: bad symbol ${symbol}`);
        return null;
    }
    const strategy: Array<IBuyOrdersStepsToGrid> = await generatedBotStrategy(
        symbol
    );
    consola.info({
        message: `generating strategy to symbol ${symbol} ... `,
        // badge: true,
    });
    await setStrategyToFile(strategy, symbol);
    return strategy;
};
