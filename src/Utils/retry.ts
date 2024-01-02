import { sleep } from './sleep.js';

export async function retry(
    cb: Function,
    symbol?: any,
    param1?: any,
    param2?: any,
    param3?: any,
    param4?: any
): Promise<any> {
    let result = undefined;

    while (!result) {
        try {
            result = await cb(symbol, param1, param2, param3, param4);
            if (!result) {
                result = undefined;
            }
        } catch (error) {
            result = undefined;
        }

        // console.log(result);
        await sleep(1000);
    }

    return result && cb(symbol, param1, param2, param3, param4);
}
