import axios, { AxiosError } from 'axios';
import consola from 'consola';
import {
    AxiosResponse,
    IBuyOrdersStepsToGrid,
    ISetOrdersStepsToMongo,
    IStrategyMongoResult,
    verifiedSymbols,
} from '../Types/types';
import {
    addCredentialsToFile,
    checkTokensHealthFromFile,
    deleteTokensFromFile,
    getDataFromFile,
    setRefreshTokenToFile,
} from './auth';

import { sleep } from '../Utils/sleep';
import { setAuthStatusToFile } from './checkauth';

// const mutex = new Mutex();
const baseUrl = 'localhost:5000';
const mongoServiceInstance = axios.create({
    baseURL: `http://${baseUrl}/api/users`,
    timeout: 5000,
    headers: { 'Content-Type': 'application/json' },
});
const getAccessToken = async () => {
    const token = await getDataFromFile('accessToken');
    return token;
    // return 'token';
};
const maxRetries = 2;
let currentRetry = 0;

mongoServiceInstance.interceptors.request.use(
    function (config) {
        return config;
    },
    function (error) {
        // console.log(error.code);
        return Promise.reject(error);
    }
);

mongoServiceInstance.interceptors.response.use(
    async (response) => {
        await setAuthStatusToFile(true);
        currentRetry = 0;
        return response;
    },
    async (error: AxiosError) => {
        if (error.response && error.response.status === 401 && error.config) {
            try {
                if (currentRetry >= maxRetries) {
                    throw new Error();
                }

                currentRetry += 1;
                consola.warn({
                    message: `Refreshing tokens retries count: ${currentRetry}`,
                    badge: true,
                });

                await sleep(2000);
                await refreshTokens();

                const originalRequest = error.config;
                const accessToken = await getDataFromFile('accessToken');

                originalRequest.headers.Authorization = accessToken;

                return mongoServiceInstance(originalRequest);
            } catch (error) {
                console.log('Error refreshing token');

                await setAuthStatusToFile(false);
                await deleteTokensFromFile();
            }
        }

        if (error.response && error.response.status === 404 && error.config) {
            console.error('404 Not Found:', error.config.url);
        }
        if (error.response && error.response.status === 400 && error.config) {
            console.error('400 Bad Request:', error.config.url);
        }

        return Promise.reject(error);
    }
);

export async function placeBuyOrderSpot(
    symbol: string,
    qty: string,
    userCredentials: AxiosResponse<any>
) {
    try {
        const result: AxiosResponse = await mongoServiceInstance.post(
            '/place-buy-order-spot-bybit',
            {
                symbol,
                qty,
            },
            {
                params: {
                    id: userCredentials.data.userId,
                },
            }
        );
        console.log(result.data);
        return result.data;
    } catch (error) {
        return Promise.reject(error);
    }
}

export async function placeSellOrderSpot(
    symbol: string,
    qty: string,
    price: string,
    userCredentials: AxiosResponse<any>
) {
    try {
        const result: AxiosResponse = await mongoServiceInstance.post(
            '/place-sell-order-spot-bybit',
            {
                symbol,
                qty,
                price,
            },
            {
                params: {
                    id: userCredentials.data.userId,
                },
            }
        );
        console.log(result.data);

        return result.data;
    } catch (error) {
        return Promise.reject(error);
    }
}

export async function deleteAllCoinOrdersSpot(
    symbol: string,
    userCredentials: AxiosResponse<any>
) {
    try {
        const result: AxiosResponse = await mongoServiceInstance.delete(
            '/delete-all-coin-orders',
            {
                params: {
                    id: userCredentials.data.userId,
                    coin: symbol,
                },
            }
        );
        console.log(result.data);

        return result.data;
    } catch (error) {
        return Promise.reject(error);
    }
}

/**
 * @param -
 * @returns promise AxiosResponse<any>
 * @description reset refresh token in db and get new credentials
 */
export async function refreshTokens(): Promise<AxiosResponse<any> | undefined> {
    try {
        const tokensHealth = await checkTokensHealthFromFile();
        if (!tokensHealth) {
            throw new Error();
        } else {
            const refreshToken = await getDataFromFile('refreshToken');
            const result: AxiosResponse = await mongoServiceInstance.put(
                '/refresh-tokens',
                {
                    refreshToken: refreshToken,
                }
            );

            await addCredentialsToFile(result);
            await setRefreshTokenToFile(result);

            consola.info({
                message: `Tokens refreshed`,
                badge: true,
            });

            return result;
        }
    } catch (error: any) {
        console.log('Unable to refresh tokens');

        return Promise.reject(error);
    }
}

export function getUsers() {
    mongoServiceInstance.get('/get-users').then((res) => console.log(res.data));
}

export async function loginUserToMongoService(
    username: string,
    password: string
) {
    try {
        const result: AxiosResponse = await mongoServiceInstance.post(
            '/login-user',
            {
                username,
                password,
            }
        );
        if (result && result.status === 200 && result.data) {
            await addCredentialsToFile(result);
            await setRefreshTokenToFile(result);
        }

        return result;
    } catch (error) {
        return Promise.reject(error);
    }
}

export async function getCoinStrategyFromDb(
    coin: string,
    userCredentials: AxiosResponse<any>
): Promise<IBuyOrdersStepsToGrid[] | undefined> {
    try {
        const strategy = await mongoServiceInstance.get('/get-coin-strategy', {
            params: {
                id: userCredentials.data.userId,
                coin,
            },
            headers: {
                Authorization: await getAccessToken(),
            },
        });

        const strategyArray: IBuyOrdersStepsToGrid[] = Object.keys(
            strategy.data
        )
            .filter((key) => Number.isInteger(parseInt(key)))
            .map((key) => ({ step: parseInt(key), ...strategy.data[key] }));

        const result: IStrategyMongoResult = {
            strategy: strategyArray,
            coin: strategy.data.coin,
        };

        consola.success({
            message: `Strategy found`,
        });

        // await setStrategyToFile(result.strategy, result.coin);

        return result.strategy;
    } catch (error: any) {
        // consola.error({
        //     message: `Strategy not found`,
        //     badge: false,
        // });

        return;
    }
}

export async function setCoinStrategy(
    strategy: ISetOrdersStepsToMongo,
    coin: verifiedSymbols,
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
                    Authorization: await getAccessToken(),
                },
            }
        );
        consola.success({
            message: 'Strategy set to db',
            badge: true,
        });
    } catch (error: any) {
        if (error && error.response.data.message) {
            consola.error({
                message: error.response.data.message,
                badge: true,
            });
        } else {
            consola.error({
                message: error,
                badge: true,
            });
        }
    }
}

export async function deleteCoinStrategy(
    coin: verifiedSymbols,
    userCredentials: AxiosResponse<any>
) {
    try {
        const result = await mongoServiceInstance.delete(
            '/delete-coin-strategy',
            {
                params: {
                    id: userCredentials.data.userId,
                    coin,
                },
                headers: {
                    Authorization: await getAccessToken(),
                },
            }
        );
        if (!result) {
            return;
        }
        consola.info({
            message: 'Strategy was deleted',
            // badge: true,
        });

        return result;
    } catch (error: any) {
        consola.error({
            message: `Unable to delete coin strategy: ${error.response?.status}`,
            badge: false,
        });
        return error.response?.status;
    }
}

export async function getCurrentStep(
    coin: verifiedSymbols,
    userCredentials: AxiosResponse<any>
): Promise<any | undefined> {
    try {
        const result = await mongoServiceInstance.get('/get-current-step', {
            params: {
                id: userCredentials.data.userId,
                coin,
            },
            headers: {
                Authorization: await getAccessToken(),
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
        // consola.error({
        //     message: 'Step not found',
        //     badge: false,
        // });
        return;
    }
}

export async function setCurrentStep(
    coin: verifiedSymbols,
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
                    Authorization: await getAccessToken(),
                },
            }
        );

        if (!result || (result.status !== 200 && result.status !== 201)) {
            return;
        }

        consola.success({
            message: 'Current step set to db',
            badge: true,
        });

        return result;
    } catch (error: any) {
        consola.error({
            message: `Unable to set step: ${error.response?.status}`,
            badge: false,
        });

        return error.response;
    }
}

export async function deleteCurrentStep(
    coin: verifiedSymbols,
    userCredentials: AxiosResponse<any>
): Promise<any | undefined> {
    try {
        const result = await mongoServiceInstance.delete(
            '/delete-current-step',
            {
                params: {
                    id: userCredentials.data.userId,
                    coin,
                },
                headers: {
                    Authorization: await getAccessToken(),
                },
            }
        );

        if (result && result.data) {
            consola.info({
                message: 'Current step was deleted',
                // badge: true,
            });
        }
        // console.log(result);
        return result;
    } catch (error: any) {
        consola.error({
            message: `Unable to delete current step: ${error.response?.status}`,
            badge: false,
        });
        return error.response?.status;
    }
}
