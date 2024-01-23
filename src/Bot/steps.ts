import * as fs from 'node:fs';
import * as path from 'path';
import * as util from 'util';
import { verifiedSymbols } from '../Types/types';

const stepsFolderPath = path.join(__dirname, 'steps');

/**
 * @param step - number of step
 * @param coin - verified coin
 * @returns boolean (true) | undefined
 */
export const setStepToFile = async (step: number, coin: verifiedSymbols) => {
    if ((!step && step !== 0) || !coin) {
        return;
    }

    if (!fs.existsSync(stepsFolderPath)) {
        fs.mkdirSync(stepsFolderPath);
    }
    fs.readdir(stepsFolderPath, (err, _files) => {
        if (err) {
            console.error(err);
        } else {
            const filePath = path.join(stepsFolderPath, `${coin}-steps.json`);
            fs.writeFileSync(
                filePath,
                JSON.stringify({ currentStep: step, coin }, null, 2)
            );
        }
    });

    return true;
};

export const deleteStepFromFile = async (coin: verifiedSymbols) => {
    if (!coin) {
        return;
    }

    if (!fs.existsSync(stepsFolderPath)) {
        return;
    }

    fs.readdir(stepsFolderPath, (err, _files) => {
        if (err) {
            console.error(err);
        } else {
            const filePath = path.join(stepsFolderPath, `${coin}-steps.json`);
            fs.unlink(filePath, (error) => {
                console.log(error);
            });
        }
    });

    return true;
};

const readFileAsync = util.promisify(fs.readFile);

export const getStepFromFile = async (coin: verifiedSymbols) => {
    if (!coin) {
        return;
    }

    const fsData = await readFileAsync(
        `${stepsFolderPath}/${coin}-steps.json`,
        'utf-8'
    );
    if (!fsData) {
        return;
    }
    const existingData = await JSON.parse(fsData);
    return existingData;
};
