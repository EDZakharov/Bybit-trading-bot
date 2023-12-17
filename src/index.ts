import { editBotConfig } from './Bot/botConfig.js';
import { getBotStrategy } from './Bot/getBotStrategy.js';

editBotConfig.setInsuranceOrderSteps(10);
const strategyKAS = await getBotStrategy('KAS');
console.table(strategyKAS);
