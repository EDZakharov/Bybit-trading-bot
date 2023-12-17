import { generateBotStrategy } from './Strategies/DCA.js';
import { verifiedSymbols } from './Symbols/verifiedSymbols.js';
import { botConfig } from './botConfig.js';

const bot = generateBotStrategy(botConfig);
const kasBot = await bot(verifiedSymbols.KAS);
const btcBot = await bot(verifiedSymbols.BTC);
const ltcBot = await bot(verifiedSymbols.LTC);
console.table(btcBot);
console.table(kasBot);
console.table(ltcBot);
