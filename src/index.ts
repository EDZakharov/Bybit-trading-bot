import { editBotConfig } from './Bot/botConfig.js';
import { trade } from './Bot/trade.js';

async function startBot(symbols: Array<string>, editOptions: any) {
    //TODO
    if (editOptions) {
        editBotConfig.setInsuranceOrderSteps(editOptions.insuranceOrderSteps);
        editBotConfig.setTargetProfitPercent(editOptions.targetProfitPercent);
        editBotConfig.setInsuranceOrderPriceDeviationPercent(
            editOptions.insuranceOrderPriceDeviationPercent
        );
    }

    for (const coinName of symbols) {
        loop(coinName, symbols.length);
    }
}
// 'KASUSDT',"BTCUSDT","XRPUSDT","UNIUSDT"
startBot(['DOTUSDT', 'BTCUSDT', 'ADAUSDT', 'TWTUSDT'], {
    // insuranceOrderPriceDeviationPercent: 0.1,
    // targetProfitPercent: 0.1,
});

async function loop(
    coinName: string,
    length: number
): Promise<Function | void> {
    return (await trade(coinName, length))
        ? loop(coinName, length)
        : console.error('Something went wrong!');
}
