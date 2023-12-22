import { editBotConfig } from './Bot/botConfig.js';
import { trade } from './Bot/trade.js';
import { IBotConfig } from './Types/types.js';

async function startBot(symbols: Array<string>, editOptions?: IBotConfig) {
    if (editOptions) {
        editBotConfig.setInsuranceOrderSteps(editOptions.insuranceOrderSteps);
    }

    for (const coinName of symbols) {
        trade(coinName);
    }
}

startBot(['KASUSDT']);
