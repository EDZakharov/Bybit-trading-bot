import * as fs from 'node:fs';
import * as path from 'path';
import * as util from 'util';
import { IBuyOrdersStepsToGrid, verifiedSymbols } from '../Types/types';

const strategiesFolderPath = path.join(__dirname, 'strategies');

export const setStrategyToFile = async (
    strategy: IBuyOrdersStepsToGrid[],
    coin: verifiedSymbols
) => {
    if (!strategy || !coin) {
        return;
    }

    if (!fs.existsSync(strategiesFolderPath)) {
        fs.mkdirSync(strategiesFolderPath);
    }

    fs.readdir(strategiesFolderPath, (err, _files) => {
        if (err) {
            console.error(err);
        } else {
            const filePath = path.join(
                strategiesFolderPath,
                `${coin}-strategy.json`
            );
            fs.writeFileSync(
                filePath,
                JSON.stringify({ strategy, coin }, null, 2)
            );
        }
    });

    return true;
};

export const deleteStrategyFromFile = async (coin: verifiedSymbols) => {
    if (!coin) {
        return;
    }

    if (!fs.existsSync(strategiesFolderPath)) {
        return;
    }

    fs.readdir(strategiesFolderPath, (err, _files) => {
        if (err) {
            console.error(err);
        } else {
            const filePath = path.join(
                strategiesFolderPath,
                `${coin}-strategy.json`
            );
            fs.unlink(filePath, (error) => {
                console.log(error);
            });
        }
    });

    return true;
};

const readFileAsync = util.promisify(fs.readFile);
const accessAsync = util.promisify(fs.access);

export const getStrategyFromFile = async (symbol: verifiedSymbols) => {
    if (!symbol) {
        return;
    }
    const filePath = `${strategiesFolderPath}/${symbol}-strategy.json`;

    try {
        const fsData = await readFileAsync(filePath, 'utf-8');
        if (!fsData) {
            return;
        }
        const { strategy } = await JSON.parse(fsData);

        return strategy;
    } catch (error) {
        console.log(error);

        return [];
    }
};

export const checkStrategyHealthFromFile = async (symbol: verifiedSymbols) => {
    try {
        const filePath = `${strategiesFolderPath}/${symbol}-strategy.json`;
        await accessAsync(filePath);
        return true;
    } catch (error) {
        return false;
    }
};
