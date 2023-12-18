import { editBotConfig } from './Bot/botConfig.js';
import { trade } from './Bot/trade.js';

editBotConfig.setInsuranceOrderSteps(10);
// const strategyKAS = await getBotStrategy('KAS');

trade('KAS');
// console.table(strategyKAS);
