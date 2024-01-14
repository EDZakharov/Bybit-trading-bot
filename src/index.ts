import { consola } from 'consola';
import { loginUserToMongoService } from './Api/api.js';
import { editBotConfig } from './Bot/botConfig.js';
import { trade } from './Bot/trade.js';
import { AxiosResponse, verifiedSymbols } from './Types/types.js';

interface IUserCredentials {
    username: string;
    password: string;
}

async function startBot(
    symbols: Array<verifiedSymbols>,
    editOptions: any,
    userCredentials: IUserCredentials
) {
    //TODO
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
    ).catch((err) => {
        consola.error({
            message: err.response?.data,
        });
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

// getCoinStrategy();
// 'KASUSDT',"BTCUSDT","XRPUSDT","UNIUSDT","DOGEUSDT","SOLUSDT","TWTUSDT","RVNUSDT","MATICUSDT",
startBot(
    [
        'BTCUSDT',
        // 'XRPUSDT',
        // 'KASUSDT',
    ],
    {
        // insuranceOrderPriceDeviationPercent: 0.1,
        // targetProfitPercent: 0.1,
    },
    { username: 'evgesha1', password: 'SLoqwnxz1' }
);

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
