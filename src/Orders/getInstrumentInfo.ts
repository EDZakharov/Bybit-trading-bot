import { symbolChecker } from '../Utils/symbolChecker.js';
import restClient from '../restClient.js';

export const getInstrumentInfo = async (symbol: string) => {
    let ok = symbolChecker(symbol);
    if (!ok) {
        console.error(`request failed: undefined coin`);
        return;
    }
    try {
        const { result } = await restClient.getInstrumentsInfo({
            category: 'spot',
            symbol,
        });
        return result;
    } catch (error) {
        console.error('request failed: ', error);
        return;
    }
};
