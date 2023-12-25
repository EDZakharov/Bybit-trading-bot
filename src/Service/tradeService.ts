// import { editBotConfig } from '../Bot/botConfig';
// import { tradeV2 } from '../Bot/trade-v2';

// export const tradeService = async function () {};

// async function startBot(symbols: Array<string>, editOptions: any) {
//     //TODO
//     if (editOptions) {
//         editBotConfig.setInsuranceOrderSteps(editOptions.insuranceOrderSteps);
//         editBotConfig.setTargetProfitPercent(editOptions.targetProfitPercent);
//         editBotConfig.setInsuranceOrderPriceDeviationPercent(
//             editOptions.insuranceOrderPriceDeviationPercent
//         );
//     }

//     for (const coinName of symbols) {
//         loop(coinName, symbols.length);
//     }
// }

// async function loop(
//     coinName: string,
//     length: number
// ): Promise<Function | void> {
//     return (await tradeV2(coinName))
//         ? loop(coinName, length)
//         : console.error('Something went wrong!');
// }
