import axios from 'axios';
import consola from 'consola';
import { AxiosResponse, ISetOrdersStepsToMongo } from '../Types/types';

const baseUrl = 'localhost:5000';

const mongoServiceInstance = axios.create({
    baseURL: `http://${baseUrl}/api/users`,
    timeout: 1000,
    // headers: {'X-Custom-Header': 'foobar'}
});

export function getUsers() {
    mongoServiceInstance.get('/get-users').then((res) => console.log(res.data));
}

export async function loginUserToMongoService(
    username: string,
    password: string
) {
    const result: AxiosResponse = await mongoServiceInstance.post(
        '/login-user',
        {
            // username: 'evgesha1',
            // password: 'SLoqwnxz1',
            username,
            password,
        }
    );
    return result;
}
// :
export async function getCoinStrategyFromDb(
    coin: string,
    userCredentials: AxiosResponse<any>
): Promise<ISetOrdersStepsToMongo | undefined> {
    try {
        // console.log(isLoggedIn);

        const strategy = await mongoServiceInstance.get('/get-coin-strategy', {
            params: {
                id: userCredentials.data.userId,
                coin,
            },
            headers: {
                Authorization: userCredentials.data.accessToken,
            },
        });

        const strategyArray = Object.keys(strategy.data)
            .filter((key) => Number.isInteger(parseInt(key)))
            .map((key) => ({ step: parseInt(key), ...strategy.data[key] }));

        const result = {
            strategy: strategyArray,
            coin: strategy.data.coin,
            message: strategy.data.message,
            status: strategy.data.status,
        };

        consola.success({
            message: 'Strategy found',
            // badge: true,
        });
        return result.strategy;
    } catch (error: any) {
        consola.error({
            message: 'Strategy not found',
            badge: false,
        });
        return;
    }
}

export async function setCoinStrategy(
    strategy: ISetOrdersStepsToMongo,
    coin: string,
    userCredentials: AxiosResponse<any>
) {
    try {
        await mongoServiceInstance.post(
            '/set-coin-strategy',
            { strategy },
            {
                params: {
                    id: userCredentials.data.userId,
                    coin,
                },
                headers: {
                    Authorization: userCredentials.data.accessToken,
                },
            }
        );
        consola.success({
            message: 'Strategy set to db',
            // badge: true,
        });
    } catch (error) {
        consola.error({
            message: error,
            badge: true,
        });
    }
}

export async function getCurrentStep(
    coin: string,
    userCredentials: AxiosResponse<any>
): Promise<any | undefined> {
    try {
        const result = await mongoServiceInstance.get('/get-current-step', {
            params: {
                id: userCredentials.data.userId,
                coin,
            },
            headers: {
                Authorization: userCredentials.data.accessToken,
            },
        });
        if (!result || !result.data) {
            return;
        }

        consola.success({
            message: 'Step found',
            // badge: true,
        });

        return result.data.step;
    } catch (error: any) {
        consola.error({
            message: 'Step not found',
            badge: false,
        });
        return;
    }
}

export async function setCurrentStep(
    coin: string,
    step: number,
    userCredentials: AxiosResponse<any>
): Promise<any | undefined> {
    try {
        const result = await mongoServiceInstance.post(
            '/set-current-step',
            {},
            {
                params: {
                    id: userCredentials.data.userId,
                    coin,
                    step,
                },
                headers: {
                    Authorization: userCredentials.data.accessToken,
                },
            }
        );

        if (!result || (result.status !== 200 && result.status !== 201)) {
            return;
        }

        consola.success({
            message: 'Current step set',
            // badge: true,
        });

        return result;
    } catch (error: any) {
        consola.error({
            message: `Unable to set step: ${error.response?.data.message}`,
            badge: false,
        });
        return;
    }
}
