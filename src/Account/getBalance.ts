import { AccountCoinBalanceV5 } from 'bybit-api/lib/types/response/v5-asset.js';
import { APIResponseV3 } from 'bybit-api/lib/types/shared.js';
import { symbolChecker } from '../Utils/symbolChecker.js';
import restClient from '../restClient.js';

export const getBalance = async (
    coin: string
): Promise<APIResponseV3<AccountCoinBalanceV5> | undefined> => {
    let ok = symbolChecker(coin);
    if (!ok) {
        console.error(`request failed: undefined coin`);
        return;
    }
    try {
        const result = await restClient.getCoinBalance({
            coin,
            accountType: 'UNIFIED',
        });

        return result;
    } catch (error) {
        console.error('5request failed: ', error);
        return;
    }
};
