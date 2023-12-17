import restClient from '../restClient.js';
import { IGetBalance } from '../Types/types.js';
import { symbolChecker } from '../Utils/symbolChecker.js';

export const getBalance = async (
    coin: string
): Promise<IGetBalance | undefined> => {
    let ok = symbolChecker(coin);
    if (!ok) {
        console.error(`request failed: undefined coin`);
        return;
    }
    try {
        const { result } = await restClient.getCoinBalance({
            coin,
            accountType: 'UNIFIED',
        });
        return result.balance;
    } catch (error) {
        console.error('request failed: ', error);
        return;
    }
};
