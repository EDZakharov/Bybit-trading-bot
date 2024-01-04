import { sleep } from './sleep.js';

export async function retry(
    cb: Function,
    symbol: string,
    id?: string
): Promise<any> {
    let result = undefined;

    while (!result) {
        try {
            result = await cb(symbol, id);
            if (!result) {
                result = undefined;
            }
        } catch (error) {
            result = undefined;
        }

        // console.log(result);
        await sleep(1000);
    }

    return result && cb(symbol, id);
}
