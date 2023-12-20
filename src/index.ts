import { editBotConfig } from './Bot/botConfig.js';
import { trade } from './Bot/trade.js';

editBotConfig.setInsuranceOrderSteps(10);
// const strategyKAS = await getBotStrategy('KAS');

trade('KASUSDT');
// console.table(strategyKAS);

// const data = await placeOrder({
//     side: 'Buy',
//     symbol: 'KASUSDT',
//     qty: 30,
//     price: 0.05,
// });

// console.log(data?.result);
