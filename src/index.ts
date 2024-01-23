import { consola } from 'consola';
import { loginUserToMongoService } from './Api/api.js';
import { editBotConfig } from './Bot/botConfig.js';
import { trade } from './Bot/trade.js';
import {
    AxiosResponse,
    IUserCredentials,
    verifiedSymbols,
} from './Types/types.js';
import { sleep } from './Utils/sleep.js';

async function startBot(
    symbols: Array<verifiedSymbols>,
    editOptions: any,
    userCredentials: IUserCredentials
) {
    if (!symbols || symbols.length === 0) {
        consola.error({
            message: 'Missing symbols',
        });
        return;
    }

    if (editOptions) {
        editBotConfig.setInsuranceOrderSteps(editOptions.insuranceOrderSteps);
        editBotConfig.setTargetProfitPercent(editOptions.targetProfitPercent);
        editBotConfig.setInsuranceOrderPriceDeviationPercent(
            editOptions.insuranceOrderPriceDeviationPercent
        );
    }

    const isAuth = await loginUserToMongoService(
        userCredentials.username,
        userCredentials.password
    ).catch(async (error) => {
        if (error.code === 'ECONNREFUSED') {
            consola.error({
                message: 'Connection to Mongo-service failed. Retrying ... ',
            });

            await sleep(10000);
            startBot(symbols, editOptions, userCredentials);
        } else {
            consola.error({
                message: error,
            });
        }
        return;
    });

    if (!isAuth || isAuth.status !== 200 || !isAuth.data) {
        return;
    }

    consola.success({
        message: isAuth.data.message,
        badge: true,
    });

    for (const coinName of symbols) {
        loop(coinName, symbols.length, isAuth);
    }
}

async function loop(
    coinName: verifiedSymbols,
    length: number,
    isAuth: AxiosResponse<any>
): Promise<Function | void> {
    return (await trade(coinName, length, isAuth))
        ? loop(coinName, length, isAuth)
        : consola.error({
              message: 'Loop failed: something went wrong!',
              badge: true,
          });
}

startBot(
    [
        'BTCUSDT',
        // 'XRPUSDT',
        // 'KASUSDT',
    ],
    {
        insuranceOrderPriceDeviationPercent: 0.1,
        targetProfitPercent: 0.1,
    },
    { username: 'evgesha1', password: 'SLoqwnxz1' }
);
