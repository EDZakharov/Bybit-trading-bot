import * as fs from 'node:fs';
import * as path from 'path';
import * as setCookieParser from 'set-cookie-parser';
import * as util from 'util';
import { AxiosResponse } from '../Types/types';

const tokensFolderPath = path.join(__dirname, 'tokens');

export const addCredentialsToFile = async (result: AxiosResponse) => {
    if (!result) {
        return;
    }

    if (!fs.existsSync(tokensFolderPath)) {
        fs.mkdirSync(tokensFolderPath);
    }

    const data = await getDataFromFile('all');

    fs.readdir(tokensFolderPath, (err, _files) => {
        if (err) {
            console.error(err);
        } else {
            const filePath = path.join(tokensFolderPath, `tokens.json`);
            fs.writeFileSync(
                filePath,
                JSON.stringify({
                    ...data,
                    userId: result.data.userId,
                    accessToken: result.data.accessToken,
                })
            );
        }
    });
    return true;
};

export const setRefreshTokenToFile = async (result: AxiosResponse) => {
    if (!result) {
        return;
    }

    if (!fs.existsSync(tokensFolderPath)) {
        fs.mkdirSync(tokensFolderPath);
    }
    const setCookieHeader = result.headers && result.headers['set-cookie'];

    if (setCookieHeader) {
        const cookies = setCookieParser.parse(setCookieHeader);

        const data = await getDataFromFile('all');

        fs.readdir(tokensFolderPath, (err, _files) => {
            if (err) {
                console.error(err);
            } else {
                const filePath = path.join(tokensFolderPath, `tokens.json`);
                fs.writeFileSync(
                    filePath,
                    JSON.stringify(
                        { ...data, refreshToken: cookies[0]?.value },
                        null,
                        2
                    )
                );
            }
        });
    }
    return true;
};
const unlinkAsync = util.promisify(fs.unlink);

export const deleteTokensFromFile = async () => {
    try {
        const health = await checkTokensHealthFromFile();
        if (!health) {
            return false;
        } else {
            const tokenPath = `${tokensFolderPath}/tokens.json`;
            if (fs.existsSync(tokenPath)) {
                await unlinkAsync(tokenPath);
                return true;
            } else {
                return false;
            }
        }
    } catch (error) {
        return false;
    }
};

type keys = 'accessToken' | 'refreshToken' | 'userId' | 'all';
const readFileAsync = util.promisify(fs.readFile);
const accessAsync = util.promisify(fs.access);

export const getDataFromFile = async (keys: keys) => {
    const tokenPath = `${tokensFolderPath}/tokens.json`;

    try {
        const fsData = await readFileAsync(tokenPath, 'utf-8');

        const existingData = await JSON.parse(fsData);
        switch (keys) {
            case 'accessToken': {
                return existingData.accessToken;
            }
            case 'refreshToken': {
                return existingData.refreshToken;
            }
            case 'userId': {
                return existingData.userId;
            }
            case 'all': {
                return existingData;
            }
        }
    } catch (error) {
        fs.readdir(tokensFolderPath, (err, _files) => {
            if (err) {
                console.error(err);
            } else {
                const filePath = path.join(tokensFolderPath, `tokens.json`);
                fs.writeFileSync(filePath, JSON.stringify('', null, 2));
            }
        });
        return '';
    }
};

export const checkTokensHealthFromFile = async () => {
    try {
        const tokenPath = `${tokensFolderPath}/tokens.json`;
        await accessAsync(tokenPath);
        return true;
    } catch (error) {
        return false;
    }
};
