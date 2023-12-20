import { sleep } from './sleep.js';

export async function retry(cb: Function, symbol: string): Promise<any> {
    let result = undefined;

    while (!result) {
        try {
            result = await cb(symbol);
            if (!result) {
                result = undefined;
            }
        } catch (error) {
            result = undefined;
        }

        // console.log(result);
        await sleep(1000);
    }

    return result && cb(symbol);
}
