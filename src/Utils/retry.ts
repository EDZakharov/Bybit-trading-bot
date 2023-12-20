import { sleep } from './sleep.js';

export async function retry(cb: Function, symbol: string) {
    let result = undefined;
    while (!result) {
        try {
            result = await cb(symbol);
        } catch (error) {
            console.log('Bad request!');
            result = undefined;
        }
        // console.log(result);
        console.log(
            `Retry status: \ncode ${result?.retCode}, ${result?.retMsg}`
        );
        if (!result || result.retCode !== 0) {
            result = undefined;
        }

        await sleep(1000);
    }

    return result;
}
